import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse, PaymentMethod, PaymentGateway } from '@/types';
import { PaymentGatewayService } from '@/services/PaymentGatewayService';
import { EmailService } from '@/services/EmailService';
import { StripeGateway } from '@/services/gateways/StripeGateway';
import { CoinPaymentsGateway } from '@/services/gateways/CoinPaymentsGateway';
import { NOWPaymentsGateway } from '@/services/gateways/NOWPaymentsGateway';

export class PaymentController {
  private paymentGatewayService: PaymentGatewayService;
  private emailService: EmailService;

  constructor() {
    this.paymentGatewayService = new PaymentGatewayService();
    this.emailService = new EmailService();
  }

  /**
   * Process payment
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { amount, currency, paymentMethod, description, gatewayId } = req.body;

      // Validate required fields
      if (!amount || !currency || !paymentMethod || !gatewayId) {
        res.status(400).json({
          success: false,
          message: 'Amount, currency, payment method, and gateway are required'
        } as ApiResponse);
        return;
      }

      // Check if currency exists and is active
      const currencyData = await prisma.currency.findFirst({
        where: { code: currency, isActive: true }
      });

      if (!currencyData) {
        res.status(400).json({
          success: false,
          message: 'Invalid or inactive currency'
        } as ApiResponse);
        return;
      }

      // Check if payment gateway exists and is active
      const gateway = await prisma.paymentGatewayConfig.findFirst({
        where: { id: gatewayId, isActive: true }
      });

      if (!gateway) {
        res.status(400).json({
          success: false,
          message: 'Invalid or inactive payment gateway'
        } as ApiResponse);
        return;
      }

      // Ensure currency and amount are supported by gateway
      if (!gateway.supportedCurrencies.includes(currency)) {
        res.status(400).json({
          success: false,
          message: `Selected gateway does not support currency ${currency}`
        } as ApiResponse);
        return;
      }
      if (amount < gateway.minAmount || amount > gateway.maxAmount) {
        res.status(400).json({
          success: false,
          message: `Amount must be between ${gateway.minAmount} and ${gateway.maxAmount} for this gateway`
        } as ApiResponse);
        return;
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId: userId as string,
          amount: amount as number,
          currency: currency as string,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentGateway: gateway.gateway as PaymentGateway,
          gatewayId: gatewayId as string,
          description: description as string,
          status: 'PENDING'
        }
      });

      // Process payment through gateway
      const paymentResult = await this.paymentGatewayService.processPayment({
        paymentId: payment.id,
        amount,
        currency,
        paymentMethod,
        gatewayId,
        description,
        userEmail: user.email,
        userData: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

      if (paymentResult.success) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId: paymentResult.transactionId,
            processedAt: new Date()
          }
        });

        // Create transaction record (link to payment and mark completed)
        const transaction = await prisma.transaction.create({
          data: {
            userId: userId as string,
            type: 'DEPOSIT',
            amount: amount as number,
            currency: currency as string,
            description: `Payment: ${description}`,
            referenceId: payment.id,
            referenceType: 'PAYMENT',
            paymentId: payment.id,
            balance: user.totalEarnings + amount, // Calculate new balance
            status: 'COMPLETED',
            metadata: {
              gateway: gateway.gateway,
              transactionId: paymentResult.transactionId
            }
          }
        });

        // Update user balance
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalEarnings: {
              increment: amount
            }
          }
        });

        // Send confirmation email
        await this.emailService.sendPaymentConfirmation(
          user.email,
          amount,
          currency
        );

        res.json({
          success: true,
          data: {
            payment,
            transaction,
            transactionId: paymentResult.transactionId
          },
          message: 'Payment processed successfully'
        } as ApiResponse);
      } else {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            gatewayResponse: paymentResult.error
          }
        });

        res.status(400).json({
          success: false,
          message: paymentResult.error || 'Payment processing failed'
        } as ApiResponse);
      }
    } catch (error) {
      logger.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { amount, currency, walletAddress, withdrawalMethod } = req.body;

      // Validate required fields
      if (!amount || !currency || !walletAddress) {
        res.status(400).json({
          success: false,
          message: 'Amount, currency, and wallet address are required'
        } as ApiResponse);
        return;
      }

      // Get user with current balance
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Check if user has sufficient balance
      if (user.totalEarnings < amount) {
        res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        } as ApiResponse);
        return;
      }

      // Check currency minimum withdrawal
      const currencyData = await prisma.currency.findFirst({
        where: { code: currency, isActive: true }
      });

      if (!currencyData) {
        res.status(400).json({
          success: false,
          message: 'Invalid or inactive currency'
        } as ApiResponse);
        return;
      }

      if (amount < currencyData.minWithdrawal) {
        res.status(400).json({
          success: false,
          message: `Minimum withdrawal amount is ${currencyData.minWithdrawal} ${currency}`
        } as ApiResponse);
        return;
      }

      if (amount > currencyData.maxWithdrawal) {
        res.status(400).json({
          success: false,
          message: `Maximum withdrawal amount is ${currencyData.maxWithdrawal} ${currency}`
        } as ApiResponse);
        return;
      }

      // Calculate withdrawal fee
      const withdrawalFee = currencyData.withdrawalFeeType === 'PERCENTAGE' 
        ? (amount * currencyData.withdrawalFee / 100)
        : currencyData.withdrawalFee;

      const netAmount = amount - withdrawalFee;

      // Create withdrawal record
      const withdrawal = await prisma.withdrawal.create({
        data: {
          userId,
          amount,
          netAmount,
          fee: withdrawalFee,
          currency,
          walletAddress,
          withdrawalMethod: withdrawalMethod || 'CRYPTO', // Now using the correct field
          status: 'PENDING',
          metadata: {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Deduct amount from user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: {
            decrement: amount
          }
        }
      });

      // Create transaction record (link to withdrawal)
      await prisma.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          amount: -amount,
          currency,
          description: `Withdrawal request: ${withdrawalMethod || 'CRYPTO'}`,
          status: 'PENDING',
          withdrawalId: withdrawal.id,
          balance: user.totalEarnings - amount, // Calculate new balance after withdrawal
          metadata: {
            withdrawalId: withdrawal.id,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Send withdrawal notification email
              await this.emailService.sendWithdrawalNotification(
          user.email,
          amount,
          currency
        );

      res.json({
        success: true,
        data: withdrawal,
        message: 'Withdrawal request submitted successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error requesting withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 10, status, paymentMethod, dateFrom, dateTo } = req.query;

      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (paymentMethod) {
        where.paymentMethod = paymentMethod;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            gatewayConfig: true, // Now using the correct relation name
            transactions: true // Now using the correct relation name
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.payment.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user withdrawals
   */
  async getUserWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 10, status, withdrawalMethod, dateFrom, dateTo } = req.query;

      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (withdrawalMethod) {
        where.withdrawalMethod = withdrawalMethod;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            transactions: true // Now using the correct relation name
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.withdrawal.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          withdrawals,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user withdrawals:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get available currencies
   */
  async getCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { isDefault: 'desc' }
      });

      res.json({
        success: true,
        data: currencies
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get payment gateways
   */
  async getPaymentGateways(req: Request, res: Response): Promise<void> {
    try {
      const gateways = await prisma.paymentGatewayConfig.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: gateways
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting payment gateways:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const [
        totalPayments,
        totalWithdrawals,
        pendingWithdrawals,
        completedPayments,
        failedPayments,
        totalFees
      ] = await Promise.all([
        prisma.payment.aggregate({
          where: { userId },
          _sum: { amount: true }
        }),
        prisma.withdrawal.aggregate({
          where: { userId },
          _sum: { amount: true }
        }),
        prisma.withdrawal.aggregate({
          where: { userId, status: 'PENDING' },
          _sum: { amount: true }
        }),
        prisma.payment.count({
          where: { userId, status: 'COMPLETED' }
        }),
        prisma.payment.count({
          where: { userId, status: 'FAILED' }
        }),
        prisma.withdrawal.aggregate({
          where: { userId },
          _sum: { fee: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalPayments: totalPayments._sum.amount || 0,
          totalWithdrawals: totalWithdrawals._sum.amount || 0,
          pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
          completedPayments: completedPayments,
          failedPayments: failedPayments,
          totalFees: totalFees._sum.fee || 0
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting payment statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Cancel withdrawal request
   */
  async cancelWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { withdrawalId } = req.params;

      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          id: withdrawalId,
          userId
        }
      });

      if (!withdrawal) {
        res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        } as ApiResponse);
        return;
      }

      if (withdrawal.status !== 'PENDING') {
        res.status(400).json({
          success: false,
          message: 'Only pending withdrawals can be cancelled'
        } as ApiResponse);
        return;
      }

      // Update withdrawal status
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
                  data: {
            status: 'CANCELLED'
          }
      });

      // Refund user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: {
            increment: withdrawal.amount
          }
        }
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: {
          withdrawalId: withdrawalId,
          type: 'WITHDRAWAL'
        },
        data: {
          status: 'CANCELLED' // Now using the correct field
        }
      });

      res.json({
        success: true,
        message: 'Withdrawal cancelled successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error cancelling withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Webhook: Stripe
   */
  async webhookStripe(req: Request, res: Response): Promise<void> {
    try {
      const config = await prisma.paymentGatewayConfig.findFirst({
        where: { gateway: 'STRIPE', isActive: true }
      });
      if (!config) {
        res.status(400).json({ success: false, message: 'Stripe gateway not configured' } as ApiResponse);
        return;
      }

      const gateway = new StripeGateway();
      const result = await gateway.processWebhook(req.body, config.config as any);
      if (!result) {
        res.status(400).json({ success: false, message: 'Invalid Stripe webhook payload' } as ApiResponse);
        return;
      }

      await this.applyWebhookUpdate(result.paymentId, result.status, result.transactionId, result.gatewayResponse);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Stripe webhook error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  /**
   * Webhook: CoinPayments
   */
  async webhookCoinPayments(req: Request, res: Response): Promise<void> {
    try {
      const config = await prisma.paymentGatewayConfig.findFirst({
        where: { gateway: 'COINPAYMENTS', isActive: true }
      });
      if (!config) {
        res.status(400).json({ success: false, message: 'CoinPayments gateway not configured' } as ApiResponse);
        return;
      }

      const gateway = new CoinPaymentsGateway();
      const result = await gateway.processWebhook(req.body, config.config as any);
      if (!result) {
        res.status(400).json({ success: false, message: 'Invalid CoinPayments webhook payload' } as ApiResponse);
        return;
      }

      await this.applyWebhookUpdate(result.paymentId, result.status, result.transactionId, result.gatewayResponse);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('CoinPayments webhook error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  /**
   * Webhook: NOWPayments
   */
  async webhookNOWPayments(req: Request, res: Response): Promise<void> {
    try {
      const config = await prisma.paymentGatewayConfig.findFirst({
        where: { gateway: 'NOWPAYMENTS', isActive: true }
      });
      if (!config) {
        res.status(400).json({ success: false, message: 'NOWPayments gateway not configured' } as ApiResponse);
        return;
      }

      const gateway = new NOWPaymentsGateway();
      const result = await gateway.processWebhook(req.body, config.config as any);
      if (!result) {
        res.status(400).json({ success: false, message: 'Invalid NOWPayments webhook payload' } as ApiResponse);
        return;
      }

      await this.applyWebhookUpdate(result.paymentId, result.status, result.transactionId, result.gatewayResponse);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('NOWPayments webhook error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  /**
   * Normalize and apply webhook update to payment and user balance
   */
  private async applyWebhookUpdate(paymentId: string, rawStatus: string, transactionId: string, gatewayResponse: any): Promise<void> {
    const toStatus = (status: string) => {
      const s = (status || '').toUpperCase();
      if (['COMPLETED', 'SUCCESS', 'SUCCEEDED', 'CONFIRMED'].includes(s)) return 'COMPLETED';
      if (['PENDING', 'PROCESSING', 'REQUIRES_PAYMENT_METHOD'].includes(s)) return 'PENDING';
      return 'FAILED';
    };

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      const newStatus = toStatus(rawStatus) as any;
      // Update payment
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          transactionId,
          processedAt: new Date(),
          gatewayResponse
        }
      });

      if (newStatus === 'COMPLETED') {
        const user = await tx.user.findUnique({ where: { id: payment.userId } });
        if (!user) return;

        // Prevent duplicate crediting: check existing transaction linked to payment
        const existing = await tx.transaction.findFirst({ where: { paymentId: payment.id, type: 'DEPOSIT', status: 'COMPLETED' } });
        if (existing) return;

        await tx.transaction.create({
          data: {
            userId: payment.userId,
            type: 'DEPOSIT',
            amount: payment.amount,
            currency: payment.currency,
            description: `Payment: ${payment.description}`,
            referenceId: payment.id,
            referenceType: 'PAYMENT',
            paymentId: payment.id,
            balance: user.totalEarnings + payment.amount,
            status: 'COMPLETED',
            metadata: { webhook: true, transactionId }
          }
        });

        await tx.user.update({
          where: { id: payment.userId },
          data: { totalEarnings: { increment: payment.amount } }
        });
      }
    });
  }
} 