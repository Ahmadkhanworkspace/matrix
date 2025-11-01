import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { BonusService } from './BonusService';

export interface MatrixPosition {
  id: string;
  userId: string;
  matrixLevel: number;
  positionPath: string;
  sponsorId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  cycleCount: number;
  totalEarned: number;
  createdAt: Date;
  cycledAt?: Date;
}

export interface MatrixLevel {
  id: string;
  userId: string;
  matrixLevel: number;
  positionsFilled: number;
  totalPositions: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  completionDate?: Date;
}

export class MatrixService {
  private bonusService: BonusService;

  constructor() {
    this.bonusService = new BonusService();
  }

  /**
   * Place user in matrix position
   */
  async placeUserInMatrix(userId: string, matrixLevel: number, sponsorId?: string): Promise<MatrixPosition> {
    try {
      // Find available position in the matrix level
      const position = await this.findAvailablePosition(matrixLevel, sponsorId);
      
      if (!position) {
        throw new Error(`No available position in matrix level ${matrixLevel}`);
      }

      // Get username for the position
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
      
      // Create matrix position
      const matrixPosition = await prisma.matrixPosition.create({
        data: {
          userId,
          username: user?.username || '',
          matrixLevel,
          positionPath: position.path,
          sponsorId: position.sponsorId,
          status: 'ACTIVE'
        }
      });

      // Update matrix level
      await this.updateMatrixLevel(userId, matrixLevel);

      // Check for cycle completion
      await this.checkCycleCompletion(matrixPosition.id);

      logger.info(`User ${userId} placed in matrix level ${matrixLevel} at position ${position.path}`);

      return matrixPosition;
    } catch (error) {
      logger.error('Error placing user in matrix:', error);
      throw error;
    }
  }

  /**
   * Find available position in matrix level
   */
  private async findAvailablePosition(matrixLevel: number, sponsorId?: string): Promise<{ path: string; sponsorId?: string } | null> {
    try {
      // Get matrix configuration
      const config = await prisma.matrixConfig.findUnique({
        where: { level: matrixLevel }
      });

      if (!config) {
        throw new Error(`Matrix level ${matrixLevel} not configured`);
      }

      // Find the sponsor's position if provided
      let sponsorPosition: MatrixPosition | null = null;
      if (sponsorId) {
        sponsorPosition = await prisma.matrixPosition.findFirst({
          where: {
            userId: sponsorId,
            matrixLevel,
            status: 'ACTIVE'
          }
        });
      }

      // If no sponsor or sponsor not found, find any available position
      if (!sponsorPosition) {
        const availablePosition = await this.findAnyAvailablePosition(matrixLevel);
        return availablePosition;
      }

      // Find position under sponsor
      const sponsorPath = sponsorPosition.positionPath;
      const childPositions = await this.findChildPositions(sponsorPath, matrixLevel);

      for (const childPath of childPositions) {
        const isOccupied = await this.isPositionOccupied(childPath, matrixLevel);
        if (!isOccupied) {
          return { path: childPath, sponsorId: sponsorId };
        }
      }

      // If no position under sponsor, find any available position
      return await this.findAnyAvailablePosition(matrixLevel);
    } catch (error) {
      logger.error('Error finding available position:', error);
      throw error;
    }
  }

  /**
   * Find any available position in matrix level
   */
  private async findAnyAvailablePosition(matrixLevel: number): Promise<{ path: string; sponsorId?: string } | null> {
    try {
      // Get all positions in the level
      const positions = await this.getAllPositionsInLevel(matrixLevel);
      
      for (const position of positions) {
        const isOccupied = await this.isPositionOccupied(position, matrixLevel);
        if (!isOccupied) {
          // Find the sponsor for this position
          const sponsor = await this.findSponsorForPosition(position, matrixLevel);
          return { path: position, sponsorId: sponsor?.userId };
        }
      }

      return null;
    } catch (error) {
      logger.error('Error finding any available position:', error);
      throw error;
    }
  }

  /**
   * Get all positions in a matrix level
   */
  private async getAllPositionsInLevel(matrixLevel: number): Promise<string[]> {
    const positions: string[] = [];
    const maxPositions = Math.pow(2, matrixLevel - 1); // 2^(level-1) positions per level

    for (let i = 0; i < maxPositions; i++) {
      positions.push(`${matrixLevel}.${i + 1}`);
    }

    return positions;
  }

  /**
   * Check if position is occupied
   */
  private async isPositionOccupied(positionPath: string, matrixLevel: number): Promise<boolean> {
    const position = await prisma.matrixPosition.findFirst({
      where: {
        positionPath,
        matrixLevel,
        status: 'ACTIVE'
      }
    });

    return !!position;
  }

  /**
   * Find child positions of a parent position
   */
  private async findChildPositions(parentPath: string, matrixLevel: number): Promise<string[]> {
    const children: string[] = [];
    const childLevel = matrixLevel + 1;
    const maxChildren = 2; // 2 children per position

    for (let i = 0; i < maxChildren; i++) {
      children.push(`${childLevel}.${parentPath.split('.').pop()}.${i + 1}`);
    }

    return children;
  }

  /**
   * Find sponsor for a position
   */
  private async findSponsorForPosition(positionPath: string, matrixLevel: number): Promise<MatrixPosition | null> {
    if (matrixLevel === 1) {
      return null; // Level 1 has no sponsor
    }

    const parentLevel = matrixLevel - 1;
    const parentPath = positionPath.split('.').slice(0, -1).join('.');

    return await prisma.matrixPosition.findFirst({
      where: {
        positionPath: parentPath,
        matrixLevel: parentLevel,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Update matrix level for user
   */
  private async updateMatrixLevel(userId: string, matrixLevel: number): Promise<void> {
    try {
      const existingLevel = await prisma.matrixLevel.findUnique({
        where: {
          userId_matrixLevel: {
            userId,
            matrixLevel
          }
        }
      });

      if (existingLevel) {
        await prisma.matrixLevel.update({
          where: { id: existingLevel.id },
          data: {
            positionsFilled: existingLevel.positionsFilled + 1
          }
        });
      } else {
        await prisma.matrixLevel.create({
          data: {
            userId,
            matrixLevel,
            positionsFilled: 1,
            totalPositions: 2, // 2 positions per level
            status: 'IN_PROGRESS'
          }
        });
      }
    } catch (error) {
      logger.error('Error updating matrix level:', error);
      throw error;
    }
  }

  /**
   * Check for cycle completion
   */
  private async checkCycleCompletion(positionId: string): Promise<void> {
    try {
      const position = await prisma.matrixPosition.findUnique({
        where: { id: positionId },
        include: {
          user: true
        }
      });

      if (!position) return;

      // Check if all positions in the level are filled
      const levelPositions = await prisma.matrixPosition.findMany({
        where: {
          matrixLevel: position.matrixLevel,
          status: 'ACTIVE'
        }
      });

      const maxPositions = Math.pow(2, position.matrixLevel - 1);
      
      if (levelPositions.length >= maxPositions) {
        // Level is complete, distribute bonuses
        await this.completeMatrixLevel(position.matrixLevel);
      }
    } catch (error) {
      logger.error('Error checking cycle completion:', error);
      throw error;
    }
  }

  /**
   * Complete matrix level and distribute bonuses
   */
  private async completeMatrixLevel(matrixLevel: number): Promise<void> {
    try {
      // Get all positions in the level
      const positions = await prisma.matrixPosition.findMany({
        where: {
          matrixLevel,
          status: 'ACTIVE'
        },
        include: {
          user: true
        }
      });

      // Mark positions as completed
      await prisma.matrixPosition.updateMany({
        where: {
          matrixLevel,
          status: 'ACTIVE'
        },
        data: {
          status: 'COMPLETED',
          cycledAt: new Date()
        }
      });

      // Update matrix level status
      await prisma.matrixLevel.updateMany({
        where: {
          matrixLevel,
          status: 'IN_PROGRESS'
        },
        data: {
          status: 'COMPLETED',
          completionDate: new Date()
        }
      });

      // Distribute bonuses to all users in the level
      for (const position of positions) {
        await this.bonusService.distributeMatrixBonus(
          position.userId,
          matrixLevel,
          position.id
        );
      }

      logger.info(`Matrix level ${matrixLevel} completed with ${positions.length} positions`);
    } catch (error) {
      logger.error('Error completing matrix level:', error);
      throw error;
    }
  }

  /**
   * Get user's matrix genealogy
   */
  async getUserMatrixGenealogy(userId: string): Promise<any> {
    try {
      const positions = await prisma.matrixPosition.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { matrixLevel: 'asc' }
      });

      return positions;
    } catch (error) {
      logger.error('Error getting user matrix genealogy:', error);
      throw error;
    }
  }

  /**
   * Get matrix statistics
   */
  async getMatrixStatistics(): Promise<any> {
    try {
      const [
        totalPositions,
        activePositions,
        completedPositions,
        totalUsers,
        levelStats
      ] = await Promise.all([
        prisma.matrixPosition.count(),
        prisma.matrixPosition.count({ where: { status: 'ACTIVE' } }),
        prisma.matrixPosition.count({ where: { status: 'COMPLETED' } }),
        prisma.user.count(),
        prisma.matrixLevel.groupBy({
          by: ['matrixLevel'],
          _count: { id: true },
          _sum: { positionsFilled: true }
        })
      ]);

      return {
        totalPositions,
        activePositions,
        completedPositions,
        totalUsers,
        levelStats,
        completionRate: totalPositions > 0 ? (completedPositions / totalPositions) * 100 : 0
      };
    } catch (error) {
      logger.error('Error getting matrix statistics:', error);
      throw error;
    }
  }

  /**
   * Get user's matrix overview
   */
  async getUserMatrixOverview(userId: string): Promise<any> {
    try {
      const [
        positions,
        levels,
        totalEarnings,
        activePositions
      ] = await Promise.all([
        prisma.matrixPosition.findMany({
          where: { userId },
          orderBy: { matrixLevel: 'asc' }
        }),
        prisma.matrixLevel.findMany({
          where: { userId },
          orderBy: { matrixLevel: 'asc' }
        }),
        prisma.matrixPosition.aggregate({
          where: { userId },
          _sum: { totalEarned: true }
        }),
        prisma.matrixPosition.count({
          where: {
            userId,
            status: 'ACTIVE'
          }
        })
      ]);

      return {
        positions,
        levels,
        totalEarnings: totalEarnings._sum.totalEarned || 0,
        activePositions,
        totalPositions: positions.length
      };
    } catch (error) {
      logger.error('Error getting user matrix overview:', error);
      throw error;
    }
  }

  /**
   * Force placement in matrix (admin function)
   */
  async forcePlacement(userId: string, matrixLevel: number, positionPath: string): Promise<MatrixPosition> {
    try {
      // Check if position is already occupied
      const existingPosition = await prisma.matrixPosition.findFirst({
        where: {
          positionPath,
          matrixLevel,
          status: 'ACTIVE'
        }
      });

      if (existingPosition) {
        throw new Error(`Position ${positionPath} in level ${matrixLevel} is already occupied`);
      }

      // Get username for the position
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
      
      // Create matrix position
      const matrixPosition = await prisma.matrixPosition.create({
        data: {
          userId,
          username: user?.username || '',
          matrixLevel,
          positionPath,
          status: 'ACTIVE'
        }
      });

      // Update matrix level
      await this.updateMatrixLevel(userId, matrixLevel);

      // Check for cycle completion
      await this.checkCycleCompletion(matrixPosition.id);

      logger.info(`Admin force placed user ${userId} in matrix level ${matrixLevel} at position ${positionPath}`);

      return matrixPosition;
    } catch (error) {
      logger.error('Error in force placement:', error);
      throw error;
    }
  }
} 