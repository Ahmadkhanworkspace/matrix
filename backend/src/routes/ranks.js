const express = require('express');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');

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

// ============ USER ENDPOINTS ============

// Get all ranks
router.get('/', authenticateToken, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const ranks = await prisma.rank.findMany({
        where: { isActive: true },
        orderBy: { level: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: ranks.map(rank => ({
          id: rank.id,
          name: rank.name,
          level: rank.level,
          description: rank.description,
          icon: rank.icon,
          color: rank.color,
          requirements: rank.requirements,
          benefits: rank.benefits,
          bonuses: rank.bonuses,
          privileges: rank.privileges
        }))
      });
    } catch {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get ranks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ranks'
    });
  }
});

// Get current user rank
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const userRank = await prisma.userRank.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          rank: true
        },
        orderBy: {
          achievedAt: 'desc'
        }
      });

      await prisma.$disconnect();

      if (!userRank) {
        return res.json({
          success: true,
          data: {
            rank: null,
            progress: null
          }
        });
      }

      res.json({
        success: true,
        data: {
          rank: {
            id: userRank.rank.id,
            name: userRank.rank.name,
            level: userRank.rank.level,
            description: userRank.rank.description,
            icon: userRank.rank.icon,
            color: userRank.rank.color,
            benefits: userRank.rank.benefits,
            bonuses: userRank.rank.bonuses,
            privileges: userRank.rank.privileges,
            achievedAt: userRank.achievedAt
          },
          progress: userRank.qualificationData
        }
      });
    } catch (error) {
      console.error('Get user rank error:', error);
      res.json({
        success: true,
        data: {
          rank: null,
          progress: null
        }
      });
    }
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user rank'
    });
  }
});

// Get progress to next rank
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get current rank
      const currentRank = await prisma.userRank.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          rank: true
        },
        orderBy: {
          achievedAt: 'desc'
        }
      });

      if (!currentRank) {
        // User has no rank, get first rank
        const firstRank = await prisma.rank.findFirst({
          where: { isActive: true },
          orderBy: { level: 'asc' }
        });

        if (!firstRank) {
          await prisma.$disconnect();
          return res.json({
            success: true,
            data: {
              currentRank: null,
              nextRank: null,
              progress: null
            }
          });
        }

        // Calculate progress to first rank
        const progress = await calculateRankProgress(userId, firstRank.id, prisma);

        await prisma.$disconnect();

        return res.json({
          success: true,
          data: {
            currentRank: null,
            nextRank: {
              id: firstRank.id,
              name: firstRank.name,
              level: firstRank.level,
              requirements: firstRank.requirements
            },
            progress
          }
        });
      }

      // Get next rank
      const nextRank = await prisma.rank.findFirst({
        where: {
          level: { gt: currentRank.rank.level },
          isActive: true
        },
        orderBy: { level: 'asc' }
      });

      if (!nextRank) {
        await prisma.$disconnect();
        return res.json({
          success: true,
          data: {
            currentRank: {
              id: currentRank.rank.id,
              name: currentRank.rank.name,
              level: currentRank.rank.level
            },
            nextRank: null,
            progress: null
          }
        });
      }

      // Calculate progress to next rank
      const progress = await calculateRankProgress(userId, nextRank.id, prisma);

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          currentRank: {
            id: currentRank.rank.id,
            name: currentRank.rank.name,
            level: currentRank.rank.level
          },
          nextRank: {
            id: nextRank.id,
            name: nextRank.name,
            level: nextRank.level,
            requirements: nextRank.requirements
          },
          progress
        }
      });
    } catch (error) {
      console.error('Get rank progress error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get rank progress'
      });
    }
  } catch (error) {
    console.error('Get rank progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rank progress'
    });
  }
});

// Helper function to calculate rank progress
async function calculateRankProgress(userId, targetRankId, prisma) {
  const targetRank = await prisma.rank.findUnique({
    where: { id: targetRankId }
  });

  if (!targetRank || !targetRank.requirements) {
    return null;
  }

  const requirements = Array.isArray(targetRank.requirements) 
    ? targetRank.requirements 
    : JSON.parse(JSON.stringify(targetRank.requirements));

  const progress = [];

  for (const req of requirements) {
    let current = 0;
    let target = req.value || 0;
    let percentage = 0;

    switch (req.type) {
      case 'team_size':
        current = await prisma.user.count({
          where: { sponsorId: userId }
        });
        break;
      case 'active_team_size':
        current = await prisma.user.count({
          where: { 
            sponsorId: userId,
            isActive: true
          }
        });
        break;
      case 'team_volume':
        const downlineUsers = await prisma.user.findMany({
          where: { sponsorId: userId },
          select: { id: true }
        });
        const downlineIds = downlineUsers.map(u => u.id);
        
        current = await prisma.matrixPosition.aggregate({
          where: {
            userId: { in: downlineIds }
          },
          _sum: {
            totalEarned: true
          }
        });
        current = parseFloat(current._sum.totalEarned?.toString() || '0');
        break;
      case 'personal_purchases':
        current = await prisma.matrixPosition.count({
          where: { userId }
        });
        break;
      case 'personal_volume':
        const volumeResult = await prisma.matrixPosition.aggregate({
          where: { userId },
          _sum: {
            totalEarned: true
          }
        });
        current = parseFloat(volumeResult._sum.totalEarned?.toString() || '0');
        break;
      case 'time_in_system':
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { joinDate: true }
        });
        if (user?.joinDate) {
          const days = Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24));
          current = days;
        }
        break;
    }

    percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

    progress.push({
      type: req.type,
      name: req.name || req.type,
      current: parseFloat(current.toFixed(2)),
      target: parseFloat(target.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      completed: current >= target
    });
  }

  const overallProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length
    : 0;

  return {
    requirements: progress,
    overallProgress: parseFloat(overallProgress.toFixed(2)),
    allCompleted: progress.every(p => p.completed)
  };
}

// Auto-calculate user rank
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get all ranks sorted by level
      const allRanks = await prisma.rank.findMany({
        where: { isActive: true },
        orderBy: { level: 'desc' }
      });

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          joinDate: true,
          isActive: true
        }
      });

      // Get current rank
      const currentUserRank = await prisma.userRank.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          rank: true
        }
      });

      let newRankId = null;
      let newRankLevel = 0;

      // Check each rank from highest to lowest
      for (const rank of allRanks) {
        const progress = await calculateRankProgress(userId, rank.id, prisma);
        
        if (progress && progress.allCompleted) {
          // User qualifies for this rank
          if (!currentUserRank || rank.level > currentUserRank.rank.level) {
            newRankId = rank.id;
            newRankLevel = rank.level;
            break;
          }
        }
      }

      if (!newRankId) {
        await prisma.$disconnect();
        return res.json({
          success: true,
          message: 'No rank advancement available',
          data: {
            currentRank: currentUserRank?.rank || null,
            newRank: null,
            advanced: false
          }
        });
      }

      const newRank = await prisma.rank.findUnique({
        where: { id: newRankId }
      });

      // Create new user rank
      const userRank = await prisma.userRank.create({
        data: {
          userId,
          rankId: newRankId,
          isActive: true,
          qualificationData: await calculateRankProgress(userId, newRankId, prisma)
        },
        include: {
          rank: true
        }
      });

      // Deactivate old rank
      if (currentUserRank) {
        await prisma.userRank.update({
          where: { id: currentUserRank.id },
          data: { isActive: false }
        });

        // Create rank history
        await prisma.rankHistory.create({
          data: {
            userId,
            oldRankId: currentUserRank.rankId,
            newRankId,
            reason: 'auto',
            changedBy: 'system'
          }
        });
      }

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Rank advanced successfully',
        data: {
          currentRank: currentUserRank?.rank || null,
          newRank: {
            id: userRank.rank.id,
            name: userRank.rank.name,
            level: userRank.rank.level,
            benefits: userRank.rank.benefits,
            bonuses: userRank.rank.bonuses,
            privileges: userRank.rank.privileges
          },
          advanced: true,
          achievedAt: userRank.achievedAt
        }
      });
    } catch (error) {
      console.error('Calculate rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate rank'
      });
    }
  } catch (error) {
    console.error('Calculate rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate rank'
    });
  }
});

// Get rank history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const history = await prisma.rankHistory.findMany({
        where: { userId },
        include: {
          oldRank: {
            select: {
              id: true,
              name: true,
              level: true
            }
          },
          newRank: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        },
        orderBy: { changedAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: history.map(h => ({
          id: h.id,
          oldRank: h.oldRank ? {
            id: h.oldRank.id,
            name: h.oldRank.name,
            level: h.oldRank.level
          } : null,
          newRank: {
            id: h.newRank.id,
            name: h.newRank.name,
            level: h.newRank.level
          },
          changedAt: h.changedAt,
          reason: h.reason,
          changedBy: h.changedBy
        }))
      });
    } catch (error) {
      console.error('Get rank history error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get rank history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rank history'
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// Get all ranks (admin)
router.get('/admin/ranks', authenticateAdmin, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const ranks = await prisma.rank.findMany({
        orderBy: { level: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: ranks
      });
    } catch {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get ranks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ranks'
    });
  }
});

// Create rank (admin)
router.post('/admin/ranks', authenticateAdmin, async (req, res) => {
  try {
    const { name, level, description, icon, color, requirements, benefits, bonuses, privileges, isActive, sortOrder } = req.body;

    if (!name || level === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name and level are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const rank = await prisma.rank.create({
        data: {
          name,
          level: parseInt(level),
          description: description || null,
          icon: icon || null,
          color: color || null,
          requirements: requirements || [],
          benefits: benefits || [],
          bonuses: bonuses || {},
          privileges: privileges || [],
          isActive: isActive !== undefined ? isActive : true,
          sortOrder: sortOrder || 0
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Rank created successfully',
        data: rank
      });
    } catch (error) {
      console.error('Create rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create rank'
      });
    }
  } catch (error) {
    console.error('Create rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rank'
    });
  }
});

// Update rank (admin)
router.put('/admin/ranks/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert level to int if present
    if (updateData.level !== undefined) {
      updateData.level = parseInt(updateData.level);
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const rank = await prisma.rank.update({
        where: { id },
        data: updateData
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Rank updated successfully',
        data: rank
      });
    } catch (error) {
      console.error('Update rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update rank'
      });
    }
  } catch (error) {
    console.error('Update rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rank'
    });
  }
});

// Delete rank (admin)
router.delete('/admin/ranks/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.rank.delete({
        where: { id }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Rank deleted successfully'
      });
    } catch (error) {
      console.error('Delete rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete rank'
      });
    }
  } catch (error) {
    console.error('Delete rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rank'
    });
  }
});

// Manually assign rank (admin)
router.post('/admin/assign', authenticateAdmin, async (req, res) => {
  try {
    const { userId, rankId, reason } = req.body;

    if (!userId || !rankId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Rank ID are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Deactivate current rank
      const currentRank = await prisma.userRank.findFirst({
        where: {
          userId,
          isActive: true
        }
      });

      if (currentRank) {
        await prisma.userRank.update({
          where: { id: currentRank.id },
          data: { isActive: false }
        });

        // Create history
        await prisma.rankHistory.create({
          data: {
            userId,
            oldRankId: currentRank.rankId,
            newRankId: rankId,
            reason: reason || 'manual',
            changedBy: req.user.userId || req.user.id
          }
        });
      }

      // Create new rank
      const userRank = await prisma.userRank.create({
        data: {
          userId,
          rankId,
          isActive: true
        },
        include: {
          rank: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Rank assigned successfully',
        data: {
          rank: {
            id: userRank.rank.id,
            name: userRank.rank.name,
            level: userRank.rank.level
          },
          achievedAt: userRank.achievedAt
        }
      });
    } catch (error) {
      console.error('Assign rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign rank'
      });
    }
  } catch (error) {
    console.error('Assign rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign rank'
    });
  }
});

module.exports = router;

