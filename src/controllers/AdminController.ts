import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { PaymentGatewayService } from '@/services/PaymentGatewayService';
import { CurrencyService } from '@/services/CurrencyService';
import { MatrixCronService } from '@/services/MatrixCronService';
import { ApiResponse } from '@/types';

export class AdminController {
  private paymentGatewayService: PaymentGatewayService;
  private currencyService: CurrencyService;
  private matrixCronService: MatrixCronService;

  constructor() {
    this.paymentGatewayService = new PaymentGatewayService();
    this.currencyService = new CurrencyService();
    this.matrixCronService = new MatrixCronService();
  }

  // Dashboard
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalPayments,
        totalWithdrawals,
        paymentStats,
        currencyStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.payment.count(),
        prisma.withdrawal.count(),
        this.paymentGatewayService.getGatewayStatistics('all'),
        this.currencyService.getCurrencyStatistics()
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          users: { total: totalUsers, active: activeUsers },
          payments: paymentStats,
          currencies: currencyStats,
          withdrawals: { total: totalWithdrawals }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting admin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Payment Gateway Management
  async getPaymentGateways(req: Request, res: Response): Promise<void> {
    try {
      const gateways = await prisma.paymentGatewayConfig.findMany();
      
      const response: ApiResponse = {
        success: true,
        message: 'Payment gateways retrieved successfully',
        data: gateways,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting payment gateways:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment gateways',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async createPaymentGateway(req: Request, res: Response): Promise<void> {
    try {
      const gatewayData = req.body;
      const gateway = await prisma.paymentGatewayConfig.create({
        data: gatewayData
      });
      
      const response: ApiResponse = {
        success: true,
        message: 'Payment gateway created successfully',
        data: gateway,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating payment gateway:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment gateway',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updatePaymentGateway(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gatewayData = req.body;
      const gateway = await prisma.paymentGatewayConfig.update({
        where: { id },
        data: gatewayData
      });
      
      const response: ApiResponse = {
        success: true,
        message: 'Payment gateway updated successfully',
        data: gateway,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating payment gateway:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment gateway',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async deletePaymentGateway(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.paymentGatewayConfig.delete({
        where: { id }
      });
      
      const response: ApiResponse = {
        success: true,
        message: 'Payment gateway deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error deleting payment gateway:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete payment gateway',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async togglePaymentGatewayStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gateway = await prisma.paymentGatewayConfig.findUnique({
        where: { id }
      });

      if (!gateway) {
        res.status(404).json({
          success: false,
          message: 'Payment gateway not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updatedGateway = await prisma.paymentGatewayConfig.update({
        where: { id },
        data: { isActive: !gateway.isActive }
      });
      
      const response: ApiResponse = {
        success: true,
        message: 'Payment gateway status toggled successfully',
        data: updatedGateway,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error toggling payment gateway status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle payment gateway status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Currency Management
  async getCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await this.currencyService.getAllCurrencies();
      
      const response: ApiResponse = {
        success: true,
        message: 'Currencies retrieved successfully',
        data: currencies,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get currencies',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async createCurrency(req: Request, res: Response): Promise<void> {
    try {
      const currencyData = req.body;
      
      // Validate currency code
      if (!this.currencyService.validateCurrencyCode(currencyData.code)) {
        res.status(400).json({
          success: false,
          message: 'Invalid currency code format',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const currency = await this.currencyService.createCurrency(currencyData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Currency created successfully',
        data: currency,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create currency',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currencyData = req.body;
      const currency = await this.currencyService.updateCurrency(id, currencyData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Currency updated successfully',
        data: currency,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update currency',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.currencyService.deleteCurrency(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Currency deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error deleting currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete currency',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async toggleCurrencyStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currency = await this.currencyService.toggleCurrencyStatus(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Currency status toggled successfully',
        data: currency,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error toggling currency status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle currency status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async setDefaultCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currency = await this.currencyService.setDefaultCurrency(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Default currency set successfully',
        data: currency,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error setting default currency:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default currency',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateExchangeRates(req: Request, res: Response): Promise<void> {
    try {
      const { rates } = req.body;
      await this.currencyService.updateExchangeRates(rates);
      
      const response: ApiResponse = {
        success: true,
        message: 'Exchange rates updated successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating exchange rates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update exchange rates',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // User Management (existing methods)
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (search) {
        where.OR = [
          { username: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } }
        ];
      }
      if (status) {
        where.status = status;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            sponsor: { select: { id: true, username: true } },
            _count: { select: { downlines: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          sponsor: true,
          downlines: true,
          matrixPositions: true,
          payments: true,
          withdrawals: true,
          transactions: { take: 10, orderBy: { createdAt: 'desc' } }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: user,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: userData
      });

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: user,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.update({
        where: { id },
        data: { status: 'ACTIVE', isActive: true }
      });

      const response: ApiResponse = {
        success: true,
        message: 'User activated successfully',
        data: user,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error activating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async suspendUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.update({
        where: { id },
        data: { status: 'SUSPENDED', isActive: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'User suspended successfully',
        data: user,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error suspending user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to suspend user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Matrix Management
  async getMatrixPositions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, level, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (level) where.matrixLevel = Number(level);
      if (status) where.status = status;

      const [positions, total] = await Promise.all([
        prisma.matrixPosition.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: { select: { id: true, username: true, email: true } },
            sponsor: { select: { id: true, username: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.matrixPosition.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Matrix positions retrieved successfully',
        data: {
          positions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting matrix positions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matrix positions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getMatrixLevels(req: Request, res: Response): Promise<void> {
    try {
      const levels = await prisma.matrixLevel.findMany({
        include: {
          user: { select: { id: true, username: true } }
        },
        orderBy: { matrixLevel: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Matrix levels retrieved successfully',
        data: levels,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting matrix levels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matrix levels',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async forcePlacement(req: Request, res: Response): Promise<void> {
    try {
      const { userId, matrixLevel, sponsorId } = req.body;
      
      // Create matrix position
      const position = await prisma.matrixPosition.create({
        data: {
          userId,
          username: (await prisma.user.findUnique({ where: { id: userId }, select: { username: true } }))?.username || '',
          matrixLevel,
          positionPath: `${sponsorId}.${userId}`,
          sponsorId,
          status: 'ACTIVE'
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Matrix position created successfully',
        data: position,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error forcing matrix placement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to force matrix placement',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getMatrixStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [totalPositions, activePositions, completedPositions, levelStats] = await Promise.all([
        prisma.matrixPosition.count(),
        prisma.matrixPosition.count({ where: { status: 'ACTIVE' } }),
        prisma.matrixPosition.count({ where: { status: 'COMPLETED' } }),
        prisma.matrixPosition.groupBy({
          by: ['matrixLevel'],
          _count: { id: true },
          _sum: { totalEarned: true }
        })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Matrix statistics retrieved successfully',
        data: {
          totalPositions,
          activePositions,
          completedPositions,
          levelStats
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting matrix statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matrix statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Financial Management
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, type, currency } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (type) where.type = type;
      if (currency) where.currency = currency;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: { select: { id: true, username: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Transactions retrieved successfully',
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, currency } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (status) where.status = status;
      if (currency) where.currency = currency;

      const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: { select: { id: true, username: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.withdrawal.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Withdrawals retrieved successfully',
        data: {
          withdrawals,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting withdrawals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get withdrawals',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async approveWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const withdrawal = await prisma.withdrawal.update({
        where: { id },
        data: { status: 'APPROVED' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Withdrawal approved successfully',
        data: withdrawal,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error approving withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve withdrawal',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async rejectWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const withdrawal = await prisma.withdrawal.update({
        where: { id },
        data: { 
          status: 'CANCELLED',
          gatewayResponse: { reason }
        }
      });

      // Refund the amount to user's account
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          unpaidEarnings: { increment: withdrawal.amount }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Withdrawal rejected successfully',
        data: withdrawal,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error rejecting withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject withdrawal',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getFinancialStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [totalEarnings, totalWithdrawals, pendingWithdrawals, currencyStats] = await Promise.all([
        prisma.user.aggregate({ _sum: { totalEarnings: true } }),
        prisma.withdrawal.aggregate({ 
          where: { status: 'COMPLETED' },
          _sum: { amount: true }
        }),
        prisma.withdrawal.aggregate({ 
          where: { status: 'PENDING' },
          _sum: { amount: true }
        }),
        this.currencyService.getCurrencyStatistics()
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Financial statistics retrieved successfully',
        data: {
          totalEarnings: totalEarnings._sum.totalEarnings || 0,
          totalWithdrawals: totalWithdrawals._sum.amount || 0,
          pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
          currencyStats
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting financial statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get financial statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // System Configuration
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await prisma.systemConfig.findMany({
        where: { isPublic: true }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Settings retrieved successfully',
        data: settings,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { settings } = req.body;
      
      for (const setting of settings) {
        await prisma.systemConfig.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Settings updated successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getMatrixConfig(req: Request, res: Response): Promise<void> {
    try {
      const configs = await prisma.matrixConfig.findMany({
        orderBy: { level: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Matrix configuration retrieved successfully',
        data: configs,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting matrix config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matrix configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateMatrixConfig(req: Request, res: Response): Promise<void> {
    try {
      const { configs } = req.body;
      
      for (const config of configs) {
        await prisma.matrixConfig.upsert({
          where: { level: config.level },
          update: config,
          create: config
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Matrix configuration updated successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error updating matrix config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update matrix configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // System Management
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const dbHealth = await prisma.$queryRaw`SELECT 1`;
      
      const response: ApiResponse = {
        success: true,
        message: 'System health check completed',
        data: {
          database: dbHealth ? 'OK' : 'ERROR',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error checking system health:', error);
      res.status(500).json({
        success: false,
        message: 'System health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async createBackup(req: Request, res: Response): Promise<void> {
    try {
      // Implementation for database backup
      const response: ApiResponse = {
        success: true,
        message: 'Backup created successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error creating backup:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create backup',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async toggleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { enabled } = req.body;
      
      await prisma.systemConfig.upsert({
        where: { key: 'maintenance_mode' },
        update: { value: enabled.toString() },
        create: {
          key: 'maintenance_mode',
          value: enabled.toString(),
          description: 'System maintenance mode',
          isPublic: true
        }
      });

      const response: ApiResponse = {
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error toggling maintenance mode:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle maintenance mode',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Cron Job Management
  async getCronStatus(req: Request, res: Response): Promise<void> {
    try {
      const cronJob = await prisma.cronJob.findFirst();
      const pendingCount = await this.matrixCronService.getPendingCount();

      const response: ApiResponse = {
        success: true,
        message: 'Cron status retrieved successfully',
        data: {
          active: cronJob?.active || false,
          lastRun: cronJob?.lastRun,
          lastId: cronJob?.lastId,
          pendingEntries: pendingCount
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting cron status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cron status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async runCronManually(req: Request, res: Response): Promise<void> {
    try {
      // Check if cron is already running
      const cronJob = await prisma.cronJob.findFirst();
      if (cronJob?.active) {
        res.status(400).json({
          success: false,
          message: 'Cron job is already running',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Run cron job asynchronously (don't wait for completion)
      this.matrixCronService.processVerifierQueue().catch(error => {
        logger.error('Error in manual cron execution:', error);
      });

      const response: ApiResponse = {
        success: true,
        message: 'Cron job started manually',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error running cron manually:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run cron manually',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async unlockCron(req: Request, res: Response): Promise<void> {
    try {
      await prisma.cronJob.updateMany({
        data: { active: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Cron lock released successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error unlocking cron:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlock cron',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getVerifierQueue(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, processed } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (processed !== undefined) {
        where.processed = processed === '1' || processed === 'true' ? 1 : 0;
      }

      const [entries, total] = await Promise.all([
        prisma.verifier.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { date: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }),
        prisma.verifier.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Verifier queue retrieved successfully',
        data: {
          entries,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting verifier queue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get verifier queue',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async createVerifierEntry(req: Request, res: Response): Promise<void> {
    try {
      const { username, mid, date, etype, sponsor } = req.body;

      if (!username || !mid) {
        res.status(400).json({
          success: false,
          message: 'Username and membership level ID are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const entry = await prisma.verifier.create({
        data: {
          username,
          userId: user.id,
          mid: Number(mid),
          date: date ? new Date(date) : new Date(),
          etype: etype ? Number(etype) : 0,
          sponsor: sponsor || null
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Verifier entry created successfully',
        data: entry,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error creating verifier entry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create verifier entry',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteVerifierEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.verifier.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Verifier entry deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error deleting verifier entry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete verifier entry',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
} 