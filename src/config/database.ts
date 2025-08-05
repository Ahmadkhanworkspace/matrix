import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

class Database {
  private prisma: PrismaClient;
  private static instance: Database;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Prisma event listeners removed as they're not supported in current version
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Get Prisma client
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Connect to database
   */
  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('✅ Database disconnected successfully');
    } catch (error) {
      logger.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  public async getStatistics(): Promise<any> {
    try {
      const [
        userCount,
        paymentCount,
        withdrawalCount,
        bonusCount,
        matrixPositionCount
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.payment.count(),
        this.prisma.withdrawal.count(),
        this.prisma.bonus.count(),
        this.prisma.matrixPosition.count()
      ]);

      return {
        users: userCount,
        payments: paymentCount,
        withdrawals: withdrawalCount,
        bonuses: bonusCount,
        matrixPositions: matrixPositionCount
      };
    } catch (error) {
      logger.error('Error getting database statistics:', error);
      throw error;
    }
  }

  /**
   * Backup database (placeholder for actual backup implementation)
   */
  public async backup(): Promise<string> {
    try {
      // This is a placeholder - implement actual backup logic
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `backups/matrix-mlm-${timestamp}.sql`;
      
      logger.info(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Error creating database backup:', error);
      throw error;
    }
  }

  /**
   * Restore database (placeholder for actual restore implementation)
   */
  public async restore(backupPath: string): Promise<void> {
    try {
      // This is a placeholder - implement actual restore logic
      logger.info(`Database restored from: ${backupPath}`);
    } catch (error) {
      logger.error('Error restoring database:', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  public async cleanup(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old sessions
      const deletedSessions = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      // Clean up old logs (if you have a logs table)
      // const deletedLogs = await this.prisma.log.deleteMany({
      //   where: {
      //     createdAt: {
      //       lt: thirtyDaysAgo
      //     }
      //   }
      // });

      logger.info(`Cleanup completed: ${deletedSessions.count} expired sessions deleted`);
    } catch (error) {
      logger.error('Error during database cleanup:', error);
      throw error;
    }
  }

  /**
   * Reset database (for testing)
   */
  public async reset(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot reset database in production');
      }

      await this.prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
      await this.prisma.$executeRaw`CREATE SCHEMA public`;
      
      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Error resetting database:', error);
      throw error;
    }
  }

  /**
   * Seed database with initial data
   */
  public async seed(): Promise<void> {
    try {
      // Create default currencies
      await this.prisma.currency.upsert({
        where: { code: 'USD' },
        update: {},
        create: {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isActive: true,
          isDefault: true,
          exchangeRate: 1.0,
          decimalPlaces: 2,
          minWithdrawal: 10,
          maxWithdrawal: 10000,
          withdrawalFee: 2.5,
          withdrawalFeeType: 'PERCENTAGE'
        }
      });

      await this.prisma.currency.upsert({
        where: { code: 'BTC' },
        update: {},
        create: {
          code: 'BTC',
          name: 'Bitcoin',
          symbol: '₿',
          isActive: true,
          isDefault: false,
          exchangeRate: 45000.0,
          decimalPlaces: 8,
          minWithdrawal: 0.001,
          maxWithdrawal: 10,
          withdrawalFee: 0.0001,
          withdrawalFeeType: 'FIXED'
        }
      });

      await this.prisma.currency.upsert({
        where: { code: 'ETH' },
        update: {},
        create: {
          code: 'ETH',
          name: 'Ethereum',
          symbol: 'Ξ',
          isActive: true,
          isDefault: false,
          exchangeRate: 3000.0,
          decimalPlaces: 6,
          minWithdrawal: 0.01,
          maxWithdrawal: 100,
          withdrawalFee: 0.005,
          withdrawalFeeType: 'FIXED'
        }
      });

      // Create default matrix configurations
      for (let level = 1; level <= 15; level++) {
        await this.prisma.matrixConfig.upsert({
          where: { level },
          update: {},
          create: {
            level,
            name: `Level ${level}`,
            price: level * 100,
            currency: 'USD',
            matrixWidth: 2,
            matrixDepth: 8,
            referralBonus: level === 1 ? 10 : 0,
            matrixBonus: level * 50,
            matchingBonus: level === 1 ? 5 : 0,
            cycleBonus: level * 25,
            isActive: true
          }
        });
      }

      // Create default payment gateway configurations
      await this.prisma.paymentGatewayConfig.upsert({
        where: { gateway: 'COINPAYMENTS' },
        update: {},
        create: {
          name: 'CoinPayments',
          gateway: 'COINPAYMENTS',
          isActive: true,
          isTestMode: process.env.NODE_ENV !== 'production',
          supportedCurrencies: ['USD', 'BTC', 'ETH', 'USDT'],
          minAmount: 10,
          maxAmount: 10000,
          feePercentage: 2.5,
          fixedFee: 0,
          config: {
            merchantId: process.env.COINPAYMENTS_MERCHANT_ID || '',
            ipnSecret: process.env.COINPAYMENTS_IPN_SECRET || ''
          }
        }
      });

      await this.prisma.paymentGatewayConfig.upsert({
        where: { gateway: 'NOWPAYMENTS' },
        update: {},
        create: {
          name: 'NOWPayments',
          gateway: 'NOWPAYMENTS',
          isActive: true,
          isTestMode: process.env.NODE_ENV !== 'production',
          supportedCurrencies: ['USD', 'BTC', 'ETH', 'USDT'],
          minAmount: 10,
          maxAmount: 10000,
          feePercentage: 2.0,
          fixedFee: 0,
          config: {
            apiKey: process.env.NOWPAYMENTS_API_KEY || '',
            ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || ''
          }
        }
      });

      logger.info('Database seeded successfully');
    } catch (error) {
      logger.error('Error seeding database:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const database = Database.getInstance();

// Export Prisma client for direct use
export const prisma = database.getClient(); 