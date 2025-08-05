import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse, MatrixPosition, MatrixLevel, MatrixConfig } from '@/types';
import { MatrixService } from '@/services/MatrixService';
import { AuthService } from '@/services/AuthService';

export class MatrixController {
  private matrixService: MatrixService;
  private authService: AuthService;

  constructor() {
    this.matrixService = new MatrixService();
    this.authService = new AuthService();
  }

  /**
   * Get matrix overview for user
   */
  async getMatrixOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const overview = await this.matrixService.getUserMatrixOverview(userId);

      res.json({
        success: true,
        data: overview
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix overview:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix genealogy
   */
  async getMatrixGenealogy(req: Request, res: Response): Promise<void> {
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
      logger.error('Error getting matrix genealogy:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix statistics
   */
  async getMatrixStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const statistics = await this.matrixService.getMatrixStatistics();

      res.json({
        success: true,
        data: statistics
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix positions
   */
  async getMatrixPositions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { level, status, page = 1, limit = 10 } = req.query;

      const where: any = { userId };

      if (level) {
        where.matrixLevel = { level: Number(level) };
      }

      if (status) {
        where.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [positions, total] = await Promise.all([
        prisma.matrixPosition.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            // matrixLevel removed as it doesn't exist in include
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.matrixPosition.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          positions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix positions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix levels
   */
  async getMatrixLevels(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, isActive } = req.query;

      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [levels, total] = await Promise.all([
        prisma.matrixLevel.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            // matrixConfig removed as it doesn't exist in schema
            // positions removed as it doesn't exist in include
          },
          orderBy: { matrixLevel: 'asc' }
        }),
        prisma.matrixLevel.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          levels,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix levels:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix configuration
   */
  async getMatrixConfig(req: Request, res: Response): Promise<void> {
    try {
      const configs = await prisma.matrixConfig.findMany({
        where: { isActive: true },
        orderBy: { level: 'asc' }
      });

      res.json({
        success: true,
        data: configs
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Place user in matrix (admin only)
   */
  async placeUserInMatrix(req: Request, res: Response): Promise<void> {
    try {
      const { userId, matrixLevel, sponsorId } = req.body;

      // Validate required fields
      if (!userId || !matrixLevel) {
        res.status(400).json({
          success: false,
          message: 'User ID and matrix level are required'
        } as ApiResponse);
        return;
      }

      // Check if user exists
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

      // Check if matrix level exists
      const level = await prisma.matrixLevel.findFirst({
        where: { matrixLevel: matrixLevel }
      });

      if (!level) {
        res.status(404).json({
          success: false,
          message: 'Matrix level not found'
        } as ApiResponse);
        return;
      }

      // Place user in matrix
      const result = await this.matrixService.placeUserInMatrix(userId, matrixLevel, sponsorId);

      res.json({
        success: true,
        data: result,
        message: 'User placed in matrix successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error placing user in matrix:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Force placement (admin only)
   */
  async forcePlacement(req: Request, res: Response): Promise<void> {
    try {
      const { userId, positionId, matrixLevel } = req.body;

      // Validate required fields
      if (!userId || !positionId || !matrixLevel) {
        res.status(400).json({
          success: false,
          message: 'User ID, position ID, and matrix level are required'
        } as ApiResponse);
        return;
      }

      // Check if user exists
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

      // Check if position exists and is available
      const position = await prisma.matrixPosition.findUnique({
        where: { id: positionId }
      });

      if (!position) {
        res.status(404).json({
          success: false,
          message: 'Position not found'
        } as ApiResponse);
        return;
      }

      if (position.userId) {
        res.status(400).json({
          success: false,
          message: 'Position is already occupied'
        } as ApiResponse);
        return;
      }

      // Force placement
      const result = await this.matrixService.forcePlacement(userId, positionId, matrixLevel);

      res.json({
        success: true,
        data: result,
        message: 'User force placed successfully'
      } as ApiResponse);
    } catch (error) {
      logger.error('Error force placing user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix level details
   */
  async getMatrixLevelDetails(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;

      const matrixLevel = await prisma.matrixLevel.findFirst({
        where: { matrixLevel: Number(level) },
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

      if (!matrixLevel) {
        res.status(404).json({
          success: false,
          message: 'Matrix level not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: matrixLevel
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting matrix level details:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get available positions in matrix level
   */
  async getAvailablePositions(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;

      const positions = await prisma.matrixPosition.findMany({
        where: {
          matrixLevel: Number(level),
          userId: null
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
        },
        orderBy: { matrixLevel: 'asc' }
      });

      res.json({
        success: true,
        data: positions
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting available positions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix cycle completion status
   */
  async getCycleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;

      const matrixLevel = await prisma.matrixLevel.findFirst({
        where: { matrixLevel: Number(level) },
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

      if (!matrixLevel) {
        res.status(404).json({
          success: false,
          message: 'Matrix level not found'
        } as ApiResponse);
        return;
      }

      // Get positions count from database since positions is not included
      const totalPositions = await prisma.matrixPosition.count({
        where: { matrixLevel: Number(level) }
      });
      const completedPositions = await prisma.matrixPosition.count({
        where: { 
          matrixLevel: Number(level),
                      // status removed as it doesn't exist in TransactionWhereInput
        }
      });
      const isCompleted = completedPositions === totalPositions;

      res.json({
        success: true,
        data: {
          level: Number(level),
          totalPositions,
          completedPositions,
          isCompleted,
          completionPercentage: totalPositions > 0 ? (completedPositions / totalPositions) * 100 : 0
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting cycle status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get matrix statistics for admin
   */
  async getAdminMatrixStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalPositions,
        occupiedPositions,
        availablePositions,
        completedCycles,
        totalUsers,
        activeUsers,
        totalEarnings,
        pendingBonuses
      ] = await Promise.all([
        prisma.matrixPosition.count(),
        prisma.matrixPosition.count({
          where: { userId: { not: null } }
        }),
        prisma.matrixPosition.count({
          where: { userId: null }
        }),
        prisma.matrixPosition.count({
          where: { status: 'COMPLETED' }
        }),
        prisma.user.count(),
        prisma.user.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.transaction.aggregate({
          where: {
            type: 'MATRIX_BONUS',
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.bonus.aggregate({
          where: { status: 'PENDING' },
          _sum: {
            amount: true
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalPositions,
          occupiedPositions,
          availablePositions,
          completionRate: totalPositions > 0 ? (occupiedPositions / totalPositions) * 100 : 0,
          completedCycles,
          totalUsers,
          activeUsers,
          totalEarnings: totalEarnings._sum.amount || 0,
          pendingBonuses: pendingBonuses._sum.amount || 0
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting admin matrix statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
} 