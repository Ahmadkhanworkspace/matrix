const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    next();
  });
};

// ============ ACHIEVEMENTS ============

// Get all achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: achievements.map(ach => ({
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          points: ach.points,
          requirementType: ach.requirementType,
          requirementValue: ach.requirementValue
        }))
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements'
    });
  }
});

// Get user achievements
router.get('/user-achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { earnedAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: userAchievements.map(ua => ({
          id: ua.id,
          achievement: {
            id: ua.achievement.id,
            name: ua.achievement.name,
            description: ua.achievement.description,
            icon: ua.achievement.icon,
            category: ua.achievement.category,
            points: ua.achievement.points
          },
          progress: ua.progress,
          isEarned: ua.isEarned,
          earnedAt: ua.earnedAt
        }))
      });
    } catch (error) {
      console.error('Get user achievements error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user achievements'
    });
  }
});

// Claim achievement
router.post('/achievements/:id/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if achievement exists
      const achievement = await prisma.achievement.findUnique({
        where: { id }
      });

      if (!achievement) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Achievement not found'
        });
      }

      // Check if already earned
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: id
          }
        }
      });

      if (existing && existing.isEarned) {
        await prisma.$disconnect();
        return res.json({
          success: false,
          error: 'Achievement already claimed'
        });
      }

      // Check if requirements met (simplified - in production, calculate from user data)
      const progress = 100; // TODO: Calculate actual progress

      if (progress < achievement.requirementValue) {
        await prisma.$disconnect();
        return res.status(400).json({
          success: false,
          error: 'Achievement requirements not met',
          progress
        });
      }

      // Award achievement
      const userAchievement = await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: id
          }
        },
        create: {
          userId,
          achievementId: id,
          progress: achievement.requirementValue,
          isEarned: true,
          earnedAt: new Date()
        },
        update: {
          progress: achievement.requirementValue,
          isEarned: true,
          earnedAt: new Date()
        }
      });

      // Award points
      await prisma.points.create({
        data: {
          userId,
          points: achievement.points,
          source: 'achievement',
          description: `Achievement: ${achievement.name}`,
          relatedId: id
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Achievement claimed successfully',
        data: {
          achievement: {
            id: achievement.id,
            name: achievement.name,
            points: achievement.points
          },
          pointsAwarded: achievement.points,
          earnedAt: userAchievement.earnedAt
        }
      });
    } catch (error) {
      console.error('Claim achievement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to claim achievement'
      });
    }
  } catch (error) {
    console.error('Claim achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim achievement'
    });
  }
});

// ============ POINTS ============

// Get user points
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const pointsHistory = await prisma.points.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const totalPoints = pointsHistory.reduce((sum, p) => sum + p.points, 0);

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          totalPoints,
          history: pointsHistory.map(p => ({
            id: p.id,
            points: p.points,
            source: p.source,
            description: p.description,
            createdAt: p.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Get points error:', error);
      res.json({
        success: true,
        data: {
          totalPoints: 0,
          history: []
        }
      });
    }
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get points'
    });
  }
});

// Award points (admin only)
router.post('/points/award', authenticateAdmin, async (req, res) => {
  try {
    const { userId, points, source, description, relatedId } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        error: 'User ID and points are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const pointsRecord = await prisma.points.create({
        data: {
          userId,
          points: parseInt(points),
          source: source || 'manual',
          description: description || 'Admin awarded points',
          relatedId: relatedId || null
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Points awarded successfully',
        data: pointsRecord
      });
    } catch (error) {
      console.error('Award points error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to award points'
      });
    }
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award points'
    });
  }
});

// ============ CHALLENGES ============

// Get challenges
router.get('/challenges', authenticateToken, async (req, res) => {
  try {
    const { type, active } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where = {
        isActive: active !== 'false',
        endDate: { gte: new Date() }
      };

      if (type) {
        where.type = type;
      }

      const challenges = await prisma.challenge.findMany({
        where,
        orderBy: { startDate: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: challenges.map(ch => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          type: ch.type,
          startDate: ch.startDate,
          endDate: ch.endDate,
          requirements: ch.requirements,
          reward: ch.reward
        }))
      });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get challenges'
    });
  }
});

// Join challenge
router.post('/challenges/:id/join', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if challenge exists and is active
      const challenge = await prisma.challenge.findUnique({
        where: { id }
      });

      if (!challenge || !challenge.isActive) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Challenge not found or inactive'
        });
      }

      // Check if already joined
      const existing = await prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: id
          }
        }
      });

      if (existing) {
        await prisma.$disconnect();
        return res.json({
          success: false,
          error: 'Already joined this challenge'
        });
      }

      // Join challenge
      const userChallenge = await prisma.userChallenge.create({
        data: {
          userId,
          challengeId: id,
          progress: 0,
          status: 'active'
        },
        include: {
          challenge: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Joined challenge successfully',
        data: {
          challenge: {
            id: userChallenge.challenge.id,
            name: userChallenge.challenge.name,
            type: userChallenge.challenge.type
          },
          progress: userChallenge.progress,
          status: userChallenge.status
        }
      });
    } catch (error) {
      console.error('Join challenge error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join challenge'
      });
    }
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join challenge'
    });
  }
});

// Get user challenges
router.get('/my-challenges', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const userChallenges = await prisma.userChallenge.findMany({
        where: { userId },
        include: {
          challenge: true
        },
        orderBy: { joinedAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: userChallenges.map(uc => ({
          id: uc.id,
          challenge: {
            id: uc.challenge.id,
            name: uc.challenge.name,
            description: uc.challenge.description,
            type: uc.challenge.type,
            startDate: uc.challenge.startDate,
            endDate: uc.challenge.endDate,
            requirements: uc.challenge.requirements,
            reward: uc.challenge.reward
          },
          progress: uc.progress,
          status: uc.status,
          completedAt: uc.completedAt,
          joinedAt: uc.joinedAt
        }))
      });
    } catch (error) {
      console.error('Get user challenges error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user challenges'
    });
  }
});

// ============ LEADERBOARDS ============

// Get leaderboard
router.get('/leaderboard/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const { period = 'all-time', limit = 50 } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      let leaderboard = [];

      switch (category) {
        case 'referrals':
          // Top referrers
          const topReferrers = await prisma.user.groupBy({
            by: ['sponsorId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: parseInt(limit)
          });

          leaderboard = await Promise.all(
            topReferrers.map(async (item, index) => {
              const user = await prisma.user.findUnique({
                where: { id: item.sponsorId },
                select: { id: true, username: true, email: true }
              });
              return {
                rank: index + 1,
                userId: user?.id,
                username: user?.username,
                score: item._count.id
              };
            })
          );
          break;

        case 'earnings':
          // Top earners
          const topEarners = await prisma.user.findMany({
            orderBy: { totalEarnings: 'desc' },
            take: parseInt(limit),
            select: {
              id: true,
              username: true,
              email: true,
              totalEarnings: true
            }
          });

          leaderboard = topEarners.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            username: user.username,
            score: parseFloat(user.totalEarnings.toString())
          }));
          break;

        case 'points':
          // Top points earners
          const pointsGroups = await prisma.points.groupBy({
            by: ['userId'],
            _sum: { points: true },
            orderBy: { _sum: { points: 'desc' } },
            take: parseInt(limit)
          });

          leaderboard = await Promise.all(
            pointsGroups.map(async (item, index) => {
              const user = await prisma.user.findUnique({
                where: { id: item.userId },
                select: { id: true, username: true, email: true }
              });
              return {
                rank: index + 1,
                userId: user?.id,
                username: user?.username,
                score: item._sum.points || 0
              };
            })
          );
          break;

        default:
          await prisma.$disconnect();
          return res.status(400).json({
            success: false,
            error: 'Invalid category'
          });
      }

      await prisma.$disconnect();

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
});

// ============ REWARDS SHOP ============

// Get rewards shop
router.get('/rewards', authenticateToken, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const rewards = await prisma.reward.findMany({
        where: { isActive: true },
        orderBy: { cost: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: rewards.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          cost: r.cost,
          type: r.type,
          quantity: r.quantity,
          remaining: r.remaining
        }))
      });
    } catch (error) {
      console.error('Get rewards error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rewards'
    });
  }
});

// Redeem reward
router.post('/rewards/:id/redeem', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get reward
      const reward = await prisma.reward.findUnique({
        where: { id }
      });

      if (!reward || !reward.isActive) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Reward not found or inactive'
        });
      }

      // Check availability
      if (reward.remaining === 0 && reward.quantity !== -1) {
        await prisma.$disconnect();
        return res.status(400).json({
          success: false,
          error: 'Reward out of stock'
        });
      }

      // Get user total points
      const pointsHistory = await prisma.points.findMany({
        where: { userId }
      });
      const totalPoints = pointsHistory.reduce((sum, p) => sum + p.points, 0);

      if (totalPoints < reward.cost) {
        await prisma.$disconnect();
        return res.status(400).json({
          success: false,
          error: 'Insufficient points',
          required: reward.cost,
          available: totalPoints
        });
      }

      // Create redemption
      const redemption = await prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId: id,
          pointsSpent: reward.cost,
          status: 'pending'
        },
        include: {
          reward: true
        }
      });

      // Deduct points
      await prisma.points.create({
        data: {
          userId,
          points: -reward.cost,
          source: 'reward_redemption',
          description: `Redeemed: ${reward.name}`,
          relatedId: id
        }
      });

      // Update reward quantity if not unlimited
      if (reward.quantity !== -1) {
        await prisma.reward.update({
          where: { id },
          data: {
            remaining: reward.remaining > 0 ? reward.remaining - 1 : 0
          }
        });
      }

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Reward redeemed successfully',
        data: {
          redemption: {
            id: redemption.id,
            reward: {
              id: redemption.reward.id,
              name: redemption.reward.name,
              type: redemption.reward.type
            },
            pointsSpent: redemption.pointsSpent,
            status: redemption.status,
            redeemedAt: redemption.redeemedAt
          },
          remainingPoints: totalPoints - reward.cost
        }
      });
    } catch (error) {
      console.error('Redeem reward error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to redeem reward'
      });
    }
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem reward'
    });
  }
});

// ============ LOGIN STREAK ============

// Get login streak
router.get('/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get user's last login dates (simplified - in production, track in User model)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          lastLogin: true,
          loginStreak: true
        }
      });

      // Calculate streak (simplified logic)
      let currentStreak = 0;
      let longestStreak = user?.loginStreak || 0;

      // TODO: Implement actual streak calculation based on login history

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          currentStreak,
          longestStreak,
          lastLogin: user?.lastLogin
        }
      });
    } catch (error) {
      console.error('Get streak error:', error);
      res.json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastLogin: null
        }
      });
    }
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streak'
    });
  }
});

module.exports = router;

