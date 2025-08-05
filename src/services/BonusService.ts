import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { EmailService } from './EmailService';

export class BonusService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Distribute referral bonus
   */
  async distributeReferralBonus(userId: string, sponsorId: string, amount: number): Promise<void> {
    try {
      // Get matrix configuration for referral bonus
      const config = await prisma.matrixConfig.findFirst({
        where: { level: 1 } // Level 1 referral bonus
      });

      if (!config) {
        logger.warn('No matrix configuration found for referral bonus');
        return;
      }

      const bonusAmount = amount * (config.referralBonus / 100);

      // Create bonus record
      const bonus = await prisma.bonus.create({
        data: {
          userId: sponsorId,
          type: 'REFERRAL',
          amount: bonusAmount,
          currency: 'USD',
          description: `Referral bonus for user ${userId}`,
          status: 'PENDING'
        }
      });

      // Update user earnings
      await prisma.user.update({
        where: { id: sponsorId },
        data: {
          totalEarnings: { increment: bonusAmount },
          unpaidEarnings: { increment: bonusAmount }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: sponsorId,
          type: 'REFERRAL_BONUS',
          amount: bonusAmount,
          currency: 'USD',
          description: `Referral bonus earned`,
          referenceId: bonus.id,
          referenceType: 'BONUS',
          balance: 0 // Will be calculated
        }
      });

      logger.info(`Referral bonus of $${bonusAmount} distributed to user ${sponsorId}`);
    } catch (error) {
      logger.error('Error distributing referral bonus:', error);
      throw error;
    }
  }

  /**
   * Distribute matrix bonus
   */
  async distributeMatrixBonus(userId: string, matrixLevel: number, positionId: string): Promise<void> {
    try {
      // Get matrix configuration
      const config = await prisma.matrixConfig.findUnique({
        where: { level: matrixLevel }
      });

      if (!config) {
        logger.warn(`No matrix configuration found for level ${matrixLevel}`);
        return;
      }

      const bonusAmount = config.matrixBonus;

      // Create bonus record
      const bonus = await prisma.bonus.create({
        data: {
          userId,
          type: 'MATRIX',
          amount: bonusAmount,
          currency: 'USD',
          matrixLevel,
          positionId,
          description: `Matrix completion bonus for level ${matrixLevel}`,
          status: 'PENDING'
        }
      });

      // Update user earnings
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: { increment: bonusAmount },
          unpaidEarnings: { increment: bonusAmount }
        }
      });

      // Update matrix position
      await prisma.matrixPosition.update({
        where: { id: positionId },
        data: {
          totalEarned: { increment: bonusAmount },
          cycleCount: { increment: 1 }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'MATRIX_BONUS',
          amount: bonusAmount,
          currency: 'USD',
          description: `Matrix completion bonus for level ${matrixLevel}`,
          referenceId: bonus.id,
          referenceType: 'BONUS',
          balance: 0 // Will be calculated
        }
      });

      // Send email notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (user) {
        await this.emailService.sendMatrixBonusNotification(user.email, bonusAmount, matrixLevel);
      }

      logger.info(`Matrix bonus of $${bonusAmount} distributed to user ${userId} for level ${matrixLevel}`);
    } catch (error) {
      logger.error('Error distributing matrix bonus:', error);
      throw error;
    }
  }

  /**
   * Distribute matching bonus
   */
  async distributeMatchingBonus(userId: string, sponsorId: string, amount: number): Promise<void> {
    try {
      // Get matrix configuration for matching bonus
      const config = await prisma.matrixConfig.findFirst({
        where: { level: 1 } // Level 1 matching bonus
      });

      if (!config) {
        logger.warn('No matrix configuration found for matching bonus');
        return;
      }

      const bonusAmount = amount * (config.matchingBonus / 100);

      // Create bonus record
      const bonus = await prisma.bonus.create({
        data: {
          userId: sponsorId,
          type: 'MATCHING',
          amount: bonusAmount,
          currency: 'USD',
          description: `Matching bonus for user ${userId}`,
          status: 'PENDING'
        }
      });

      // Update user earnings
      await prisma.user.update({
        where: { id: sponsorId },
        data: {
          totalEarnings: { increment: bonusAmount },
          unpaidEarnings: { increment: bonusAmount }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: sponsorId,
          type: 'MATCHING_BONUS',
          amount: bonusAmount,
          currency: 'USD',
          description: `Matching bonus earned`,
          referenceId: bonus.id,
          referenceType: 'BONUS',
          balance: 0 // Will be calculated
        }
      });

      logger.info(`Matching bonus of $${bonusAmount} distributed to user ${sponsorId}`);
    } catch (error) {
      logger.error('Error distributing matching bonus:', error);
      throw error;
    }
  }

  /**
   * Distribute cycle bonus
   */
  async distributeCycleBonus(userId: string, matrixLevel: number, positionId: string): Promise<void> {
    try {
      // Get matrix configuration
      const config = await prisma.matrixConfig.findUnique({
        where: { level: matrixLevel }
      });

      if (!config) {
        logger.warn(`No matrix configuration found for level ${matrixLevel}`);
        return;
      }

      const bonusAmount = config.cycleBonus;

      // Create bonus record
      const bonus = await prisma.bonus.create({
        data: {
          userId,
          type: 'CYCLE',
          amount: bonusAmount,
          currency: 'USD',
          matrixLevel,
          positionId,
          description: `Cycle completion bonus for level ${matrixLevel}`,
          status: 'PENDING'
        }
      });

      // Update user earnings
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: { increment: bonusAmount },
          unpaidEarnings: { increment: bonusAmount }
        }
      });

      // Update matrix position
      await prisma.matrixPosition.update({
        where: { id: positionId },
        data: {
          totalEarned: { increment: bonusAmount },
          cycleCount: { increment: 1 }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'CYCLE_BONUS',
          amount: bonusAmount,
          currency: 'USD',
          description: `Cycle completion bonus for level ${matrixLevel}`,
          referenceId: bonus.id,
          referenceType: 'BONUS',
          balance: 0 // Will be calculated
        }
      });

      logger.info(`Cycle bonus of $${bonusAmount} distributed to user ${userId} for level ${matrixLevel}`);
    } catch (error) {
      logger.error('Error distributing cycle bonus:', error);
      throw error;
    }
  }

  /**
   * Distribute level completion bonus
   */
  async distributeLevelBonus(userId: string, matrixLevel: number): Promise<void> {
    try {
      // Get matrix configuration
      const config = await prisma.matrixConfig.findUnique({
        where: { level: matrixLevel }
      });

      if (!config) {
        logger.warn(`No matrix configuration found for level ${matrixLevel}`);
        return;
      }

      const bonusAmount = config.matrixBonus * 2; // Double bonus for level completion

      // Create bonus record
      const bonus = await prisma.bonus.create({
        data: {
          userId,
          type: 'LEVEL',
          amount: bonusAmount,
          currency: 'USD',
          matrixLevel,
          description: `Level ${matrixLevel} completion bonus`,
          status: 'PENDING'
        }
      });

      // Update user earnings
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEarnings: { increment: bonusAmount },
          unpaidEarnings: { increment: bonusAmount }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'MATRIX_BONUS',
          amount: bonusAmount,
          currency: 'USD',
          description: `Level ${matrixLevel} completion bonus`,
          referenceId: bonus.id,
          referenceType: 'BONUS',
          balance: 0 // Will be calculated
        }
      });

      logger.info(`Level completion bonus of $${bonusAmount} distributed to user ${userId} for level ${matrixLevel}`);
    } catch (error) {
      logger.error('Error distributing level bonus:', error);
      throw error;
    }
  }

  /**
   * Process pending bonuses
   */
  async processPendingBonuses(): Promise<void> {
    try {
      const pendingBonuses = await prisma.bonus.findMany({
        where: { status: 'PENDING' },
        include: {
          user: true
        }
      });

      for (const bonus of pendingBonuses) {
        try {
          // Mark bonus as paid
          await prisma.bonus.update({
            where: { id: bonus.id },
            data: {
              status: 'PAID',
              paidAt: new Date()
            }
          });

          // Update user paid earnings
          await prisma.user.update({
            where: { id: bonus.userId },
            data: {
              paidEarnings: { increment: bonus.amount },
              unpaidEarnings: { decrement: bonus.amount }
            }
          });

          logger.info(`Processed pending bonus of $${bonus.amount} for user ${bonus.userId}`);
        } catch (error) {
          logger.error(`Error processing bonus ${bonus.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error processing pending bonuses:', error);
      throw error;
    }
  }

  /**
   * Get user bonus summary
   */
  async getUserBonusSummary(userId: string): Promise<any> {
    try {
      const [
        totalBonuses,
        pendingBonuses,
        paidBonuses,
        bonusByType
      ] = await Promise.all([
        prisma.bonus.aggregate({
          where: { userId },
          _sum: { amount: true }
        }),
        prisma.bonus.aggregate({
          where: { userId, status: 'PENDING' },
          _sum: { amount: true }
        }),
        prisma.bonus.aggregate({
          where: { userId, status: 'PAID' },
          _sum: { amount: true }
        }),
        prisma.bonus.groupBy({
          by: ['type'],
          where: { userId },
          _sum: { amount: true }
        })
      ]);

      return {
        totalBonuses: totalBonuses._sum.amount || 0,
        pendingBonuses: pendingBonuses._sum.amount || 0,
        paidBonuses: paidBonuses._sum.amount || 0,
        bonusByType
      };
    } catch (error) {
      logger.error('Error getting user bonus summary:', error);
      throw error;
    }
  }

  /**
   * Get system bonus statistics
   */
  async getBonusStatistics(): Promise<any> {
    try {
      const [
        totalBonuses,
        pendingBonuses,
        paidBonuses,
        bonusByType,
        bonusByLevel
      ] = await Promise.all([
        prisma.bonus.aggregate({
          _sum: { amount: true }
        }),
        prisma.bonus.aggregate({
          where: { status: 'PENDING' },
          _sum: { amount: true }
        }),
        prisma.bonus.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true }
        }),
        prisma.bonus.groupBy({
          by: ['type'],
          _sum: { amount: true }
        }),
        prisma.bonus.groupBy({
          by: ['matrixLevel'],
          _sum: { amount: true }
        })
      ]);

      return {
        totalBonuses: totalBonuses._sum.amount || 0,
        pendingBonuses: pendingBonuses._sum.amount || 0,
        paidBonuses: paidBonuses._sum.amount || 0,
        bonusByType,
        bonusByLevel
      };
    } catch (error) {
      logger.error('Error getting bonus statistics:', error);
      throw error;
    }
  }
} 