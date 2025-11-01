const cron = require('node-cron');
const MatrixService = require('./MatrixService');
const PaymentService = require('./PaymentService');
const EmailService = require('./EmailService');
const db = require('../config/database');

class CronService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.jobs = new Map();
  }

  // Initialize all cron jobs
  async initialize() {
    console.log('Initializing cron jobs...');
    
    // Payment processing job - runs every minute
    this.scheduleJob('payment-processing', '* * * * *', async () => {
      await this.processPendingPayments();
    });
    
    // Matrix processing job - runs every 5 minutes
    this.scheduleJob('matrix-processing', '*/5 * * * *', async () => {
      await this.processMatrixQueue();
    });
    
    // Withdrawal processing job - runs every 2 minutes
    this.scheduleJob('withdrawal-processing', '*/2 * * * *', async () => {
      await this.processPendingWithdrawals();
    });
    
    // Email queue processing job - runs every 2 minutes
    this.scheduleJob('email-processing', '*/2 * * * *', async () => {
      await this.processEmailQueue();
    });
    
    // Database cleanup job - runs daily at 2 AM
    this.scheduleJob('database-cleanup', '0 2 * * *', async () => {
      await this.cleanupDatabase();
    });
    
    // System health check job - runs every 10 minutes
    this.scheduleJob('health-check', '*/10 * * * *', async () => {
      await this.performHealthCheck();
    });
    
    console.log('All cron jobs initialized successfully');
  }

  // Schedule a cron job
  scheduleJob(name, schedule, task) {
    if (this.jobs.has(name)) {
      this.jobs.get(name).stop();
    }
    
    const job = cron.schedule(schedule, async () => {
      try {
        console.log(`Starting cron job: ${name}`);
        await task();
        console.log(`Completed cron job: ${name}`);
      } catch (error) {
        console.error(`Error in cron job ${name}:`, error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    this.jobs.set(name, job);
    console.log(`Scheduled cron job: ${name} with schedule: ${schedule}`);
  }

  // Process matrix queue
  async processMatrixQueue() {
    if (this.isRunning) {
      console.log('Matrix processing already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    
    try {
      // Check if cron is already running
      const [cronStatus] = await db.execute(
        'SELECT * FROM cronjobs WHERE name = "matrix_processing" AND status = "running"'
      );
      
      if (cronStatus.length > 0) {
        console.log('Matrix processing already running in database, skipping...');
        return;
      }
      
      // Mark as running
      await db.execute(
        `INSERT INTO cronjobs (name, status, start_time, last_run) 
         VALUES ('matrix_processing', 'running', NOW(), NOW()) 
         ON DUPLICATE KEY UPDATE status = 'running', start_time = NOW()`
      );
      
      // Process matrix queue
      await MatrixService.processMatrixQueue();
      
      // Mark as completed
      await db.execute(
        `UPDATE cronjobs SET status = 'completed', end_time = NOW() 
         WHERE name = 'matrix_processing'`
      );
      
      this.lastRun = new Date();
      
    } catch (error) {
      console.error('Error in matrix processing:', error);
      
      // Mark as failed
      await db.execute(
        `UPDATE cronjobs SET status = 'failed', error_message = ? 
         WHERE name = 'matrix_processing'`,
        [error.message]
      );
    } finally {
      this.isRunning = false;
    }
  }

  // Process pending payments
  async processPendingPayments() {
    try {
      console.log('Processing pending payments...');
      
      // Get pending transactions
      const [pendingTransactions] = await db.execute(
        'SELECT * FROM transaction WHERE PaymentMode LIKE "pending%"'
      );
      
      for (const transaction of pendingTransactions) {
        try {
          // Process payment based on gateway
          if (transaction.PaymentMode.includes('coinpayments')) {
            await PaymentService.processCoinPaymentsIPN(transaction);
          } else if (transaction.PaymentMode.includes('nowpayments')) {
            await PaymentService.processNOWPaymentsIPN(transaction);
          }
        } catch (error) {
          console.error(`Error processing transaction ${transaction.ID}:`, error);
        }
      }
      
      console.log(`Processed ${pendingTransactions.length} pending payments`);
      
    } catch (error) {
      console.error('Error processing pending payments:', error);
    }
  }

  // Process pending withdrawals
  async processPendingWithdrawals() {
    try {
      console.log('Processing pending withdrawals...');
      
      // Get pending withdrawals
      const [pendingWithdrawals] = await db.execute(
        'SELECT * FROM wtransaction WHERE approved = 0 AND Amount <= (SELECT Unpaid FROM users WHERE Username = wtransaction.Username)'
      );
      
      for (const withdrawal of pendingWithdrawals) {
        try {
          // Get user wallet address
          const [user] = await db.execute(
            'SELECT TronWallet FROM users WHERE Username = ?',
            [withdrawal.Username]
          );
          
          if (user[0] && user[0].TronWallet) {
            await PaymentService.processAutomaticPayout(
              withdrawal.Username, 
              withdrawal.Amount
            );
          }
        } catch (error) {
          console.error(`Error processing withdrawal ${withdrawal.ID}:`, error);
        }
      }
      
      console.log(`Processed ${pendingWithdrawals.length} pending withdrawals`);
      
    } catch (error) {
      console.error('Error processing pending withdrawals:', error);
    }
  }

  // Process email queue
  async processEmailQueue() {
    try {
      console.log('Processing email queue...');
      
      // Get pending emails from database (if you have an email queue table)
      // For now, we'll just check for any pending notifications
      
      // Send welcome emails for new users
      const [newUsers] = await db.execute(
        `SELECT u.Username, u.Date, t.matrixid 
         FROM users u 
         JOIN transaction t ON u.Username = t.Username 
         WHERE u.Date >= DATE_SUB(NOW(), INTERVAL 1 HOUR) 
         AND t.PaymentMode NOT LIKE "pending%"`
      );
      
      for (const user of newUsers) {
        try {
          await EmailService.sendWelcomeEmail(user.Username, user.matrixid);
        } catch (error) {
          console.error(`Error sending welcome email to ${user.Username}:`, error);
        }
      }
      
      console.log(`Processed ${newUsers.length} welcome emails`);
      
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  // Cleanup database
  async cleanupDatabase() {
    try {
      console.log('Starting database cleanup...');
      
      // Clean up old verifier entries (older than 7 days)
      await db.execute(
        'DELETE FROM verifier WHERE Date < DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );
      
      // Clean up old transaction logs (older than 30 days)
      await db.execute(
        'DELETE FROM tlogs WHERE Date < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );
      
      // Clean up old cron job logs (older than 7 days)
      await db.execute(
        'DELETE FROM cronjobs WHERE start_time < DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );
      
      console.log('Database cleanup completed');
      
    } catch (error) {
      console.error('Error in database cleanup:', error);
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      console.log('Performing system health check...');
      
      // Check database connection
      await db.execute('SELECT 1');
      
      // Check payment gateways
      const gatewayStatus = PaymentService.getGatewayStatus();
      
      // Check matrix processing status
      const [cronJobs] = await db.execute(
        'SELECT * FROM cronjobs WHERE name = "matrix_processing" ORDER BY start_time DESC LIMIT 1'
      );
      
      // Log health status
      const healthStatus = {
        timestamp: new Date(),
        database: 'healthy',
        paymentGateways: gatewayStatus,
        matrixProcessing: cronJobs.length > 0 ? cronJobs[0].status : 'unknown'
      };
      
      console.log('Health check completed:', healthStatus);
      
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  // Stop all cron jobs
  stopAllJobs() {
    console.log('Stopping all cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    }
    
    this.jobs.clear();
  }

  // Get cron job status
  getJobStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    
    return status;
  }

  // Manually trigger matrix processing
  async triggerMatrixProcessing() {
    console.log('Manually triggering matrix processing...');
    await this.processMatrixQueue();
  }

  // Manually trigger payment processing
  async triggerPaymentProcessing() {
    console.log('Manually triggering payment processing...');
    await this.processPendingPayments();
  }

  // Manually trigger withdrawal processing
  async triggerWithdrawalProcessing() {
    console.log('Manually triggering withdrawal processing...');
    await this.processPendingWithdrawals();
  }

  // Get system statistics
  async getSystemStats() {
    try {
      const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
      const [transactionCount] = await db.execute('SELECT COUNT(*) as count FROM transaction');
      const [withdrawalCount] = await db.execute('SELECT COUNT(*) as count FROM wtransaction');
      const [pendingVerifier] = await db.execute('SELECT COUNT(*) as count FROM verifier WHERE processed = 0');
      
      return {
        totalUsers: userCount[0].count,
        totalTransactions: transactionCount[0].count,
        totalWithdrawals: withdrawalCount[0].count,
        pendingMatrixEntries: pendingVerifier[0].count,
        lastRun: this.lastRun,
        isRunning: this.isRunning
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {};
    }
  }
}

module.exports = new CronService(); 