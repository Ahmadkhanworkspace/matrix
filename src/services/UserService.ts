import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { AuthService } from './AuthService';
import { EmailService } from './EmailService';
import { MatrixService } from './MatrixService';
import { BonusService } from './BonusService';
import { User, UserStatus, MemberType, ApiResponse } from '@/types';

export class UserService {
  private authService: AuthService;
  private emailService: EmailService;
  private matrixService: MatrixService;
  private bonusService: BonusService;

  constructor() {
    this.authService = new AuthService();
    this.emailService = new EmailService();
    this.matrixService = new MatrixService();
    this.bonusService = new BonusService();
  }

  /**
   * Register a new user
   */
  async registerUser(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    sponsorId?: string;
  }): Promise<ApiResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email or username already exists',
          timestamp: new Date().toISOString()
        };
      }

      // Validate sponsor if provided
      if (userData.sponsorId) {
        const sponsor = await prisma.user.findUnique({
          where: { id: userData.sponsorId }
        });

        if (!sponsor) {
          return {
            success: false,
            message: 'Invalid sponsor ID',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Hash password
      const hashedPassword = await this.authService.hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
          sponsorId: userData.sponsorId,
          status: UserStatus.PENDING,
          memberType: MemberType.FREE
        }
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.id);

      logger.info(`User registered: ${user.id}`);

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status
        },
        message: 'User registered successfully. Please check your email for verification.',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      return {
        success: false,
        message: 'Failed to register user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          matrixPositions: {
            where: { status: 'ACTIVE' },
            orderBy: { matrixLevel: 'asc' }
          },
          matrixLevels: {
            orderBy: { matrixLevel: 'asc' }
          },
          payments: {
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          withdrawals: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          bonuses: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      return {
        success: false,
        message: 'Failed to get user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error updating user profile:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.authService.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
          timestamp: new Date().toISOString()
        };
      }

      // Validate new password
      const passwordValidation = this.authService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', ') || 'Password validation failed',
          timestamp: new Date().toISOString()
        };
      }

      // Hash new password
      const hashedPassword = await this.authService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error changing password:', error);
      return {
        success: false,
        message: 'Failed to change password',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user dashboard data
   */
  async getUserDashboard(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          matrixPositions: {
            where: { status: 'ACTIVE' },
            orderBy: { matrixLevel: 'asc' }
          },
          matrixLevels: {
            orderBy: { matrixLevel: 'asc' }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        };
      }

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Get recent bonuses
      const recentBonuses = await prisma.bonus.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Get matrix statistics
      const matrixStats = await this.matrixService.getUserMatrixOverview(userId);

      // Get bonus summary
      const bonusSummary = await this.bonusService.getUserBonusSummary(userId);

      const dashboardData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          memberType: user.memberType,
          totalEarnings: user.totalEarnings,
          paidEarnings: user.paidEarnings,
          unpaidEarnings: user.unpaidEarnings,
          joinDate: user.joinDate,
          lastLogin: user.lastLogin
        },
        matrix: {
          positions: user.matrixPositions,
          levels: user.matrixLevels,
          statistics: matrixStats
        },
        bonuses: {
          summary: bonusSummary,
          recent: recentBonuses
        },
        transactions: {
          recent: recentTransactions
        }
      };

      return {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user dashboard:', error);
      return {
        success: false,
        message: 'Failed to get dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user referrals
   */
  async getUserReferrals(userId: string): Promise<ApiResponse> {
    try {
      const referrals = await prisma.user.findMany({
        where: { sponsorId: userId },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          memberType: true,
          joinDate: true,
          totalEarnings: true
        },
        orderBy: { joinDate: 'desc' }
      });

      return {
        success: true,
        data: {
          referrals,
          count: referrals.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user referrals:', error);
      return {
        success: false,
        message: 'Failed to get referrals',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user genealogy
   */
  async getUserGenealogy(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          sponsor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              status: true
            }
          },
          downlines: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              status: true,
              joinDate: true
            },
            orderBy: { joinDate: 'asc' }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status
          },
          sponsor: user.sponsor,
          downlines: user.downlines
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user genealogy:', error);
      return {
        success: false,
        message: 'Failed to get genealogy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<ApiResponse> {
    try {
      const [
        totalReferrals,
        totalEarnings,
        totalBonuses,
        totalTransactions,
        activeMatrixPositions
      ] = await Promise.all([
        prisma.user.count({ where: { sponsorId: userId } }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { totalEarnings: true, paidEarnings: true, unpaidEarnings: true }
        }),
        prisma.bonus.aggregate({
          where: { userId },
          _sum: { amount: true },
          _count: true
        }),
        prisma.transaction.count({ where: { userId } }),
        prisma.matrixPosition.count({
          where: { userId, status: 'ACTIVE' }
        })
      ]);

      const statistics = {
        referrals: {
          total: totalReferrals
        },
        earnings: {
          total: totalEarnings?.totalEarnings || 0,
          paid: totalEarnings?.paidEarnings || 0,
          unpaid: totalEarnings?.unpaidEarnings || 0
        },
        bonuses: {
          total: totalBonuses._sum.amount || 0,
          count: totalBonuses._count
        },
        transactions: {
          total: totalTransactions
        },
        matrix: {
          activePositions: activeMatrixPositions
        }
      };

      return {
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      return {
        success: false,
        message: 'Failed to get user statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(filters: {
    search?: string;
    status?: UserStatus;
    memberType?: MemberType;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    try {
      const { search, status, memberType, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (memberType) {
        where.memberType = memberType;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            memberType: true,
            joinDate: true,
            lastLogin: true,
            totalEarnings: true,
            emailVerified: true,
            isActive: true
          },
          orderBy: { joinDate: 'desc' },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error searching users:', error);
      return {
        success: false,
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status }
      });

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          status: user.status
        },
        message: `User status updated to ${status}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error updating user status:', error);
      return {
        success: false,
        message: 'Failed to update user status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });

      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
} 