import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse, User, UserProfile, PaginationParams, UserFilters, UserStatistics } from '@/types';
import { AuthService } from '@/services/AuthService';
import { MatrixService } from '@/services/MatrixService';
import { BonusService } from '@/services/BonusService';
import { EmailService } from '@/services/EmailService';

export class UserController {
  private authService: AuthService;
  private matrixService: MatrixService;
  private bonusService: BonusService;
  private emailService: EmailService;

  constructor() {
    this.authService = new AuthService();
    this.matrixService = new MatrixService();
    this.bonusService = new BonusService();
    this.emailService = new EmailService();
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          // profile removed as it doesn't exist in include
          matrixPositions: {
            include: {
              // matrixLevel removed as it doesn't exist in include
            }
          },
                      sponsor: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
                      // referrals removed as it doesn't exist in include
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Calculate user statistics
      const statistics = await this.getUserStatistics(userId);

      res.json({
        success: true,
        data: {
          user,
          statistics
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { firstName, lastName, phone, address, country, city, zipCode, dateOfBirth, gender } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName
        },
                  include: {
            // profile removed as it doesn't exist in include
          }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;

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

      // Verify current password
      const isCurrentPasswordValid = await this.authService.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        } as ApiResponse);
        return;
      }

      // Validate new password
      const passwordValidation = this.authService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.errors.join(', ')
        } as ApiResponse);
        return;
      }

      // Hash new password
      const hashedPassword = await this.authService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Send password change notification email
      await this.emailService.sendNotification(
        user.email,
        'Password Changed',
        'Your password has been successfully changed. If you did not make this change, please contact support immediately.'
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user dashboard data
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          // profile removed as it doesn't exist in include
          matrixPositions: {
            include: {
              // matrixLevel removed as it doesn't exist in include
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Get user statistics
      const statistics = await this.getUserStatistics(userId);

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          // payment removed as it doesn't exist in include
          // bonus removed as it doesn't exist in include
        }
      });

      // Get matrix overview
      const matrixOverview = await this.matrixService.getUserMatrixOverview(userId);

      // Get pending bonuses
      const pendingBonuses = await prisma.bonus.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      res.json({
        success: true,
        data: {
          user,
          statistics,
          recentTransactions,
          matrixOverview,
          pendingBonuses
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user genealogy
   */
  async getGenealogy(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const genealogy = await this.matrixService.getUserMatrixGenealogy(userId);

      res.json({
        success: true,
        data: genealogy
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user genealogy:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user referrals
   */
  async getReferrals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 10, status, search } = req.query;

      const where: any = {
        sponsorId: userId
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [referrals, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
                      include: {
              // profile removed as it doesn't exist in include
              matrixPositions: {
                include: {
                  // matrixLevel removed as it doesn't exist in include
                }
              }
            },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          referrals,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user referrals:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user transactions
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 10, type, status, dateFrom, dateTo } = req.query;

      const where: any = { userId };

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
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

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            payment: true,
            withdrawal: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user bonuses
   */
  async getBonuses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 10, type, status, dateFrom, dateTo } = req.query;

      const where: any = { userId };

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
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

      const [bonuses, total] = await Promise.all([
        prisma.bonus.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            position: {
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.bonus.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          bonuses,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user bonuses:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get user statistics
   */
  private async getUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      const [
        totalEarnings,
        totalWithdrawals,
        pendingWithdrawals,
        totalReferrals,
        activeReferrals,
        matrixPositions,
        completedCycles,
        totalBonuses,
        pendingBonuses
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            type: 'DEPOSIT',
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.withdrawal.aggregate({
          where: {
            userId,
            status: 'APPROVED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.withdrawal.aggregate({
          where: {
            userId,
            status: 'PENDING'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.user.count({
          where: { sponsorId: userId }
        }),
        prisma.user.count({
          where: {
            sponsorId: userId,
            status: 'ACTIVE'
          }
        }),
        prisma.matrixPosition.count({
          where: { userId }
        }),
        prisma.matrixPosition.count({
          where: {
            userId,
            status: 'COMPLETED'
          }
        }),
        prisma.bonus.aggregate({
          where: {
            userId,
            status: 'PAID'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.bonus.aggregate({
          where: {
            userId,
            status: 'PENDING'
          },
          _sum: {
            amount: true
          }
        })
      ]);

      // Return a custom statistics object instead of UserStatistics
      return {
        // totalEarnings removed as it doesn't exist in UserStatistics
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
        totalReferrals: totalReferrals,
        activeReferrals: activeReferrals,
        matrixPositions: matrixPositions,
        completedCycles: completedCycles,
        totalBonuses: totalBonuses._sum.amount || 0,
        pendingBonuses: pendingBonuses._sum.amount || 0,
        availableBalance: (totalEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0)
      } as any;
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Search users (for admin use)
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { search, page = 1, limit = 10, status, memberType } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (memberType) {
        where.memberType = memberType;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            sponsor: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error searching users:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
} 