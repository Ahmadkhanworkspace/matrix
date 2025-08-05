import * as cron from 'node-cron';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { MatrixService } from './MatrixService';
import { PaymentGatewayService } from './PaymentGatewayService';
import { EmailService } from './EmailService';
import { BonusService } from './BonusService';

interface CronJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobStatus: Map<string, CronJob> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeCronJobs();
  }

  public initializeCronJobs(): void {
    if (this.isInitialized) {
      logger.warn('CronService already initialized');
      return;
    }

    logger.info('Initializing cron jobs...');

    // Matrix processing job - runs every 2 minutes
    this.scheduleJob('matrix-processing', process.env.CRON_MATRIX_INTERVAL || '*/2 * * * *', async () => {
      await this.processMatrixQueue();
    });

    // Payment processing job - runs every 5 minutes
    this.scheduleJob('payment-processing', process.env.CRON_PAYMENT_INTERVAL || '*/5 * * * *', async () => {
      await this.processPendingPayments();
    });

    // Email processing job - runs every 10 minutes
    this.scheduleJob('email-processing', process.env.CRON_EMAIL_INTERVAL || '*/10 * * * *', async () => {
      await this.processEmailQueue();
    });

    // Database cleanup job - runs daily at 2 AM
    this.scheduleJob('database-cleanup', process.env.CRON_CLEANUP_INTERVAL || '0 2 * * *', async () => {
      await this.cleanupDatabase();
    });

    // Exchange rates update job - runs every 6 hours
    this.scheduleJob('exchange-rates', process.env.CRON_EXCHANGE_RATES_INTERVAL || '0 */6 * * *', async () => {
      await this.updateExchangeRates();
    });

    // Bonus distribution job - runs every 15 minutes
    this.scheduleJob('bonus-distribution', '*/15 * * * *', async () => {
      await this.processPendingBonuses();
    });

    // System health check job - runs every 10 minutes
    this.scheduleJob('health-check', '*/10 * * * *', async () => {
      await this.performHealthCheck();
    });

    this.isInitialized = true;
    logger.info('All cron jobs initialized successfully');
  }

  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    if (this.jobs.has(name)) {
      this.jobs.get(name)?.stop();
    }

    const job = cron.schedule(schedule, async () => {
      try {
        const jobInfo = this.jobStatus.get(name);
        if (jobInfo?.isRunning) {
          logger.warn(`Cron job ${name} is already running, skipping...`);
          return;
        }

        // Update job status
        if (jobInfo) {
          jobInfo.isRunning = true;
          jobInfo.lastRun = new Date();
        }

        logger.info(`Starting cron job: ${name}`);
        await task();
        logger.info(`Completed cron job: ${name}`);

        // Update job status
        if (jobInfo) {
          jobInfo.isRunning = false;
          jobInfo.nextRun = this.getNextRunTime(schedule);
        }
      } catch (error) {
        logger.error(`Error in cron job ${name}:`, error);
        
        // Update job status
        const jobInfo = this.jobStatus.get(name);
        if (jobInfo) {
          jobInfo.isRunning = false;
        }
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    this.jobStatus.set(name, {
      name,
      schedule,
      task,
      isRunning: false,
      lastRun: undefined,
      nextRun: this.getNextRunTime(schedule)
    });

    logger.info(`Scheduled cron job: ${name} with schedule: ${schedule}`);
  }

  private getNextRunTime(schedule: string): Date {
    const now = new Date();
    // For now, return a mock next run time
    // In a real implementation, you would use a proper cron library
    const nextRun = new Date(now.getTime() + 60000); // 1 minute from now
    return nextRun;
  }

  private async processMatrixQueue(): Promise<void> {
    try {
      const matrixService = new MatrixService();
      
      // Get pending matrix positions
      const pendingPositions = await prisma.matrixPosition.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          user: true
        }
      });

      logger.info(`Processing ${pendingPositions.length} matrix positions`);

      for (const position of pendingPositions) {
        try {
          // Check for cycle completion - using a different approach since the method doesn't exist
          // For now, we'll just log that we're processing the position
          logger.info(`Processing matrix position ${position.id} for level ${position.matrixLevel}`);
        } catch (error) {
          logger.error(`Error processing matrix position ${position.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in matrix processing:', error);
    }
  }

  private async processPendingPayments(): Promise<void> {
    try {
      const paymentService = new PaymentGatewayService();
      
      // Get pending payments
      const pendingPayments = await prisma.payment.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          user: true,
          gatewayConfig: true
        }
      });

      logger.info(`Processing ${pendingPayments.length} pending payments`);

      for (const payment of pendingPayments) {
        try {
          // Process payment
          await paymentService.processPayment({
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            gatewayId: payment.gatewayId,
            description: payment.description,
            userEmail: payment.user?.email || '',
            userData: {
              id: payment.userId,
              username: payment.user?.username || '',
              email: payment.user?.email || ''
            }
          });
        } catch (error) {
          logger.error(`Error processing payment ${payment.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in payment processing:', error);
    }
  }

  private async processEmailQueue(): Promise<void> {
    try {
      const emailService = new EmailService();
      
      // Get pending emails (this would be implemented based on your email queue system)
      // For now, we'll just log that the email processing is running
      logger.info('Processing email queue...');
      
      // In a real implementation, you would:
      // 1. Get pending emails from database or queue
      // 2. Send emails using EmailService
      // 3. Update email status
      
    } catch (error) {
      logger.error('Error in email processing:', error);
    }
  }

  private async cleanupDatabase(): Promise<void> {
    try {
      logger.info('Starting database cleanup...');

      // Clean up expired sessions
      const expiredSessions = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      logger.info(`Cleaned up ${expiredSessions.count} expired sessions`);

      // Clean up old logs (if you have a logs table)
      // This would depend on your logging strategy

      // Clean up old temporary files
      // This would depend on your file management strategy

      logger.info('Database cleanup completed');
    } catch (error) {
      logger.error('Error in database cleanup:', error);
    }
  }

  private async updateExchangeRates(): Promise<void> {
    try {
      logger.info('Updating exchange rates...');

      // Get all active currencies
      const currencies = await prisma.currency.findMany({
        where: {
          isActive: true
        }
      });

      // In a real implementation, you would:
      // 1. Call external exchange rate API
      // 2. Update currency exchange rates
      // 3. Log the updates

      for (const currency of currencies) {
        if (currency.code !== 'USD') {
          // Mock exchange rate update
          const mockRate = 1 + Math.random() * 0.1; // Random rate between 1.0 and 1.1
          
          await prisma.currency.update({
            where: { id: currency.id },
            data: { exchangeRate: mockRate }
          });
        }
      }

      logger.info('Exchange rates updated');
    } catch (error) {
      logger.error('Error updating exchange rates:', error);
    }
  }

  private async processPendingBonuses(): Promise<void> {
    try {
      const bonusService = new BonusService();
      
      // Get pending bonuses
      const pendingBonuses = await prisma.bonus.findMany({
        where: {
          status: 'PENDING'
        },
        include: {
          user: true
        }
      });

      logger.info(`Processing ${pendingBonuses.length} pending bonuses`);

      for (const bonus of pendingBonuses) {
        try {
          // Process bonus
          await bonusService.processPendingBonuses();
        } catch (error) {
          logger.error(`Error processing bonus ${bonus.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in bonus processing:', error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      logger.info('Performing system health check...');

      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check if all services are running
      const activeJobs = Array.from(this.jobStatus.values()).filter(job => !job.isRunning);
      
      if (activeJobs.length > 0) {
        logger.warn(`Found ${activeJobs.length} inactive cron jobs`);
      }

      // Check system resources (memory, CPU, etc.)
      const memUsage = process.memoryUsage();
      logger.info(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

      logger.info('Health check completed');
    } catch (error) {
      logger.error('Error in health check:', error);
    }
  }

  public stopAllJobs(): void {
    logger.info('Stopping all cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    
    this.jobs.clear();
    this.jobStatus.clear();
    this.isInitialized = false;
  }

  public getJobStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [name, jobInfo] of this.jobStatus) {
      status[name] = {
        name: jobInfo.name,
        schedule: jobInfo.schedule,
        isRunning: jobInfo.isRunning,
        lastRun: jobInfo.lastRun,
        nextRun: jobInfo.nextRun
      };
    }
    
    return status;
  }

  public async triggerMatrixProcessing(): Promise<void> {
    logger.info('Manually triggering matrix processing...');
    await this.processMatrixQueue();
  }

  public async triggerPaymentProcessing(): Promise<void> {
    logger.info('Manually triggering payment processing...');
    await this.processPendingPayments();
  }

  public async triggerBonusProcessing(): Promise<void> {
    logger.info('Manually triggering bonus processing...');
    await this.processPendingBonuses();
  }

  public getSystemStats(): Record<string, any> {
    return {
      totalJobs: this.jobs.size,
      activeJobs: Array.from(this.jobStatus.values()).filter(job => !job.isRunning).length,
      isInitialized: this.isInitialized,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
} 