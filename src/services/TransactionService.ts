import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { TransactionType, TransactionStatus, PaymentStatus, WithdrawalStatus } from '@prisma/client';

interface TransactionFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface DepositFilters {
  page: number;
  limit: number;
  status?: string;
  gateway?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface WithdrawalFilters {
  page: number;
  limit: number;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface EWallettransactionFilters {
  page: number;
  limit: number;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export class TransactionService {
  /**
   * Get all transactions with filtering and pagination
   */
  async getTransactions(filters: TransactionFilters) {
    try {
      const { page, limit, type, status, userId, startDate, endDate, search } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (type) {
        where.type = type as TransactionType;
      }

      if (status) {
        where.status = status as TransactionStatus;
      }

      if (userId) {
        where.userId = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { referenceId: { contains: search, mode: 'insensitive' } },
          { user: { username: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            payment: true,
            withdrawal: true
          }
        }),
        prisma.transaction.count({ where })
      ]);

      return {
        transactions,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    try {
      return await prisma.transaction.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          payment: true,
          withdrawal: true
        }
      });
    } catch (error) {
      logger.error('Error getting transaction by ID:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(id: string, status: string, notes?: string) {
    try {
      return await prisma.transaction.update({
        where: { id },
        data: {
          status: status as TransactionStatus,
          metadata: notes ? { notes } : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get deposits with filtering
   */
  async getDeposits(filters: DepositFilters) {
    try {
      const { page, limit, status, gateway, userId, startDate, endDate } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status as PaymentStatus;
      }

      if (gateway) {
        where.paymentGateway = gateway;
      }

      if (userId) {
        where.userId = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [deposits, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            gatewayConfig: true,
            transactions: true
          }
        }),
        prisma.payment.count({ where })
      ]);

      return {
        deposits,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting deposits:', error);
      throw error;
    }
  }

  /**
   * Process deposit
   */
  async processDeposit(id: string, action: string, notes?: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      let newStatus: PaymentStatus;
      let userBalanceUpdate = 0;

      if (action === 'approve') {
        newStatus = PaymentStatus.COMPLETED;
        userBalanceUpdate = payment.amount;
      } else if (action === 'reject') {
        newStatus = PaymentStatus.FAILED;
      } else {
        throw new Error('Invalid action');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: newStatus,
          processedAt: new Date(),
          gatewayResponse: notes ? { notes } : undefined
        }
      });

      // Update user balance if approved
      if (action === 'approve') {
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            totalEarnings: { increment: userBalanceUpdate },
            unpaidEarnings: { increment: userBalanceUpdate }
          }
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: payment.userId,
            type: TransactionType.DEPOSIT,
            amount: payment.amount,
            currency: payment.currency,
            description: `Deposit approved - ${payment.description}`,
            referenceId: payment.id,
            referenceType: 'payment',
            status: TransactionStatus.COMPLETED,
            balance: userBalanceUpdate,
            paymentId: payment.id
          }
        });
      }

      return updatedPayment;
    } catch (error) {
      logger.error('Error processing deposit:', error);
      throw error;
    }
  }

  /**
   * Get withdrawals with filtering
   */
  async getWithdrawals(filters: WithdrawalFilters) {
    try {
      const { page, limit, status, userId, startDate, endDate } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status as WithdrawalStatus;
      }

      if (userId) {
        where.userId = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            transactions: true
          }
        }),
        prisma.withdrawal.count({ where })
      ]);

      return {
        withdrawals,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting withdrawals:', error);
      throw error;
    }
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(id: string, action: string, notes?: string, transactionId?: string) {
    try {
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!withdrawal) {
        throw new Error('Withdrawal not found');
      }

      let newStatus: WithdrawalStatus;

      if (action === 'approve') {
        newStatus = WithdrawalStatus.APPROVED;
      } else if (action === 'reject') {
        newStatus = WithdrawalStatus.CANCELLED;
      } else if (action === 'complete') {
        newStatus = WithdrawalStatus.COMPLETED;
      } else {
        throw new Error('Invalid action');
      }

      // Update withdrawal status
      const updatedWithdrawal = await prisma.withdrawal.update({
        where: { id },
        data: {
          status: newStatus,
          processedAt: new Date(),
          transactionId,
          metadata: notes ? { notes } : undefined
        }
      });

      // Update user balance if rejected (refund)
      if (action === 'reject') {
        await prisma.user.update({
          where: { id: withdrawal.userId },
          data: {
            unpaidEarnings: { increment: withdrawal.amount }
          }
        });

        // Create transaction record for refund
        await prisma.transaction.create({
          data: {
            userId: withdrawal.userId,
            type: TransactionType.WITHDRAWAL,
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            description: `Withdrawal rejected - refunded`,
            referenceId: withdrawal.id,
            referenceType: 'withdrawal',
            status: TransactionStatus.COMPLETED,
            balance: withdrawal.amount,
            withdrawalId: withdrawal.id
          }
        });
      }

      // Update user balance if completed
      if (action === 'complete') {
        await prisma.user.update({
          where: { id: withdrawal.userId },
          data: {
            paidEarnings: { increment: withdrawal.netAmount },
            unpaidEarnings: { decrement: withdrawal.amount }
          }
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: withdrawal.userId,
            type: TransactionType.WITHDRAWAL,
            amount: -withdrawal.netAmount,
            currency: withdrawal.currency,
            description: `Withdrawal completed - ${withdrawal.walletAddress}`,
            referenceId: withdrawal.id,
            referenceType: 'withdrawal',
            status: TransactionStatus.COMPLETED,
            balance: -withdrawal.netAmount,
            withdrawalId: withdrawal.id
          }
        });
      }

      return updatedWithdrawal;
    } catch (error) {
      logger.error('Error processing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get eWallet transactions
   */
  async getEWalletTransactions(filters: EWallettransactionFilters) {
    try {
      const { page, limit, type, userId, startDate, endDate } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type as TransactionType;
      }

      if (userId) {
        where.userId = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.transaction.count({ where })
      ]);

      return {
        transactions,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting eWallet transactions:', error);
      throw error;
    }
  }

  /**
   * Create eWallet transaction
   */
  async createEWalletTransaction(data: {
    userId: string;
    type: string;
    amount: number;
    currency: string;
    description: string;
    referenceId?: string;
  }) {
    try {
      const { userId, type, amount, currency, description, referenceId } = data;

      // Get user current balance
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: type as TransactionType,
          amount,
          currency,
          description,
          referenceId,
          referenceType: 'admin',
          status: TransactionStatus.COMPLETED,
          balance: amount
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: { increment: amount },
          unpaidEarnings: { increment: amount }
        }
      });

      return transaction;
    } catch (error) {
      logger.error('Error creating eWallet transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStatistics(period: string = '30d') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        totalTransactions,
        totalDeposits,
        totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        completedDeposits,
        completedWithdrawals,
        totalVolume
      ] = await Promise.all([
        prisma.transaction.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.payment.count({
          where: { 
            createdAt: { gte: startDate },
            status: PaymentStatus.COMPLETED
          }
        }),
        prisma.withdrawal.count({
          where: { 
            createdAt: { gte: startDate },
            status: WithdrawalStatus.COMPLETED
          }
        }),
        prisma.payment.count({
          where: { 
            createdAt: { gte: startDate },
            status: PaymentStatus.PENDING
          }
        }),
        prisma.withdrawal.count({
          where: { 
            createdAt: { gte: startDate },
            status: WithdrawalStatus.PENDING
          }
        }),
        prisma.payment.aggregate({
          where: { 
            createdAt: { gte: startDate },
            status: PaymentStatus.COMPLETED
          },
          _sum: { amount: true }
        }),
        prisma.withdrawal.aggregate({
          where: { 
            createdAt: { gte: startDate },
            status: WithdrawalStatus.COMPLETED
          },
          _sum: { netAmount: true }
        }),
        prisma.transaction.aggregate({
          where: { 
            createdAt: { gte: startDate },
            status: TransactionStatus.COMPLETED
          },
          _sum: { amount: true }
        })
      ]);

      return {
        period,
        totalTransactions,
        totalDeposits,
        totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        completedDeposits: completedDeposits._sum.amount || 0,
        completedWithdrawals: completedWithdrawals._sum.netAmount || 0,
        totalVolume: totalVolume._sum.amount || 0,
        startDate,
        endDate: now
      };
    } catch (error) {
      logger.error('Error getting transaction statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk process transactions
   */
  async bulkProcessTransactions(transactionIds: string[], action: string, notes?: string) {
    try {
      let processed = 0;
      const errors: string[] = [];

      for (const id of transactionIds) {
        try {
          if (action === 'approve') {
            await this.updateTransactionStatus(id, 'COMPLETED', notes);
          } else if (action === 'reject') {
            await this.updateTransactionStatus(id, 'FAILED', notes);
          }
          processed++;
        } catch (error) {
          errors.push(`Transaction ${id}: ${error}`);
        }
      }

      return {
        processed,
        total: transactionIds.length,
        errors
      };
    } catch (error) {
      logger.error('Error bulk processing transactions:', error);
      throw error;
    }
  }
}

export default TransactionService;

