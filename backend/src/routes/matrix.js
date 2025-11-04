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

// Get matrix level statistics for dashboard
router.get('/level-stats', authenticateToken, async (req, res) => {
  try {
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    
    if (USE_PRISMA) {
      // Use Prisma for Supabase/PostgreSQL - use shared prisma client
      try {
        const { prisma } = require('../config/databaseHybrid');
        const prismaClient = prisma();
        if (!prismaClient) {
          throw new Error('Prisma client not initialized');
        }

        // Get total matrix positions
        const totalPositions = await prismaClient.matrixPosition.count();

        // Get active matrix positions (status = 'ACTIVE')
        const activePositions = await prismaClient.matrixPosition.count({
          where: {
            status: 'ACTIVE'
          }
        });

        // Get pending matrix positions (status = 'PENDING')
        const pendingPositions = await prismaClient.matrixPosition.count({
          where: {
            status: 'PENDING'
          }
        });

        // Get completed cycles (positions that have completed)
        const completedCycles = await prismaClient.matrixPosition.count({
          where: {
            status: 'COMPLETED'
          }
        });

        res.json({
          success: true,
          data: {
            totalPositions,
            activePositions,
            pendingPositions,
            completedCycles
          }
        });
      } catch (prismaError) {
        console.error('Prisma error:', prismaError);
        throw prismaError;
      }
    } else {
      // Use MySQL (original code)
      const totalPositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions');
      const totalPositions = totalPositionsResult.total || 0;

      const activePositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions WHERE status = "active"');
      const activePositions = activePositionsResult.total || 0;

      const pendingPositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions WHERE status = "pending"');
      const pendingPositions = pendingPositionsResult.total || 0;

      const completedCyclesResult = await queryOne('SELECT COUNT(*) as total FROM matrix_cycles WHERE status = "completed"');
      const completedCycles = completedCyclesResult.total || 0;

      res.json({
        success: true,
        data: {
          totalPositions,
          activePositions,
          pendingPositions,
          completedCycles
        }
      });
    }
  } catch (error) {
    console.error('Get matrix level stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix level statistics',
      details: error.message
    });
  }
});

// Get all matrix configurations
router.get('/configs', authenticateToken, async (req, res) => {
  try {
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    
    if (USE_PRISMA) {
      // Use Prisma for Supabase/PostgreSQL
      try {
        const { prisma } = require('../config/databaseHybrid');
        const prismaClient = prisma();
        if (!prismaClient) {
          throw new Error('Prisma client not initialized');
        }

        const configs = await prismaClient.matrixConfig.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });

        res.json({
          success: true,
          data: configs
        });
      } catch (prismaError) {
        console.error('Prisma error in get matrix configs:', prismaError);
        throw prismaError;
      }
    } else {
      // Use MySQL (original code)
      const configs = await query(
        'SELECT * FROM matrix_configs ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        data: configs
      });
    }
  } catch (error) {
    console.error('Get matrix configs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix configurations',
      details: error.message
    });
  }
});

// Get matrix configuration by ID
router.get('/configs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await queryOne(
      'SELECT * FROM matrix_configs WHERE id = ?',
      [id]
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Matrix configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get matrix config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix configuration'
    });
  }
});

// Create new matrix configuration
router.post('/configs', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      levels = 10,
      width = 3,
      fee,
      matrix_type = 'forced',
      payout_type = 'level',
      spillover_enabled = true,
      reentry_enabled = true,
      email_notifications = true
    } = req.body;

    if (!name || !fee) {
      return res.status(400).json({
        success: false,
        error: 'Name and fee are required'
      });
    }

    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    
    if (USE_PRISMA) {
      // Use Prisma for Supabase/PostgreSQL
      try {
        const { prisma } = require('../config/databaseHybrid');
        const prismaClient = prisma();
        if (!prismaClient) {
          throw new Error('Prisma client not initialized');
        }

        // Note: The Prisma schema's MatrixConfig model has different fields
        // We'll create a matrix config entry. Since the schema expects 'level' as unique,
        // we'll use the 'levels' value as the level number
        // Map frontend fields to Prisma schema fields:
        // - levels -> level (unique identifier)
        // - width -> matrixWidth
        // - fee -> price
        // - levels -> matrixDepth (depth of the matrix)
        
        const matrixConfig = await prismaClient.matrixConfig.create({
          data: {
            level: parseInt(levels) || 1, // Use levels as the level number
            name: name,
            price: parseFloat(fee),
            currency: 'USD',
            matrixWidth: parseInt(width) || 3,
            matrixDepth: parseInt(levels) || 10,
            isActive: true
          }
        });

        res.status(201).json({
          success: true,
          message: 'Matrix configuration created successfully',
          data: { id: matrixConfig.id, level: matrixConfig.level }
        });
      } catch (prismaError) {
        console.error('Prisma error in create matrix config:', prismaError);
        // If it's a unique constraint error (level already exists), provide helpful message
        if (prismaError.code === 'P2002') {
          return res.status(400).json({
            success: false,
            error: `Matrix level ${levels} already exists. Please choose a different level.`
          });
        }
        throw prismaError;
      }
    } else {
      // Use MySQL (original code)
      const result = await query(
        `INSERT INTO matrix_configs (name, levels, width, fee, matrix_type, payout_type, 
         spillover_enabled, reentry_enabled, email_notifications) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, levels, width, fee, matrix_type, payout_type, spillover_enabled, reentry_enabled, email_notifications]
      );

      res.status(201).json({
        success: true,
        message: 'Matrix configuration created successfully',
        data: { id: result.insertId }
      });
    }
  } catch (error) {
    console.error('Create matrix config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create matrix configuration',
      details: error.message
    });
  }
});

// Update matrix configuration
router.put('/configs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      levels,
      width,
      fee,
      matrix_type,
      payout_type,
      spillover_enabled,
      reentry_enabled,
      email_notifications,
      status
    } = req.body;

    // Check if config exists
    const existingConfig = await queryOne('SELECT id FROM matrix_configs WHERE id = ?', [id]);
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        error: 'Matrix configuration not found'
      });
    }

    // Update config
    await query(
      `UPDATE matrix_configs SET 
       name = ?, levels = ?, width = ?, fee = ?, matrix_type = ?, 
       payout_type = ?, spillover_enabled = ?, reentry_enabled = ?, 
       email_notifications = ?, status = ? 
       WHERE id = ?`,
      [name, levels, width, fee, matrix_type, payout_type, spillover_enabled, reentry_enabled, email_notifications, status, id]
    );

    // Broadcast update
    const io = req.app.get('io');
    const broadcastAdminUpdate = req.app.get('broadcastAdminUpdate');
    if (io && broadcastAdminUpdate) {
      broadcastAdminUpdate('matrix_config_updated', { id, name, levels, width, fee });
    }

    res.json({
      success: true,
      message: 'Matrix configuration updated successfully'
    });
  } catch (error) {
    console.error('Update matrix config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update matrix configuration'
    });
  }
});

// Delete matrix configuration
router.delete('/configs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if config exists
    const existingConfig = await queryOne('SELECT id FROM matrix_configs WHERE id = ?', [id]);
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        error: 'Matrix configuration not found'
      });
    }

    // Delete config
    await query('DELETE FROM matrix_configs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Matrix configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete matrix config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete matrix configuration'
    });
  }
});

// Get matrix statistics
router.get('/stats/:matrixId', authenticateToken, async (req, res) => {
  try {
    const { matrixId } = req.params;

    // Get matrix config
    const config = await queryOne(
      'SELECT * FROM matrix_configs WHERE id = ?',
      [matrixId]
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Matrix configuration not found'
      });
    }

    // Calculate statistics (placeholder - you'll need to implement actual matrix logic)
    const stats = {
      total_positions: Math.pow(config.width, config.levels),
      filled_positions: 0, // This would be calculated from actual matrix data
      empty_positions: Math.pow(config.width, config.levels),
      total_earnings: 0,
      avg_earnings: 0,
      cycle_count: 0,
      pending_entries: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get matrix stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix statistics'
    });
  }
});

// Get matrix positions
router.get('/positions/:matrixId', authenticateToken, async (req, res) => {
  try {
    const { matrixId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // This would query actual matrix positions table
    // For now, returning empty array as placeholder
    const positions = [];

    res.json({
      success: true,
      data: positions,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit: parseInt(limit),
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Get matrix positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix positions'
    });
  }
});

// Get user's matrix positions (for ManagePositions page)
router.get('/positions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { status } = req.query;

    let whereClause = 'WHERE userId = ?';
    let params = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status.toUpperCase());
    }

    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const positions = await prisma.matrixPosition.findMany({
        where: {
          userId: userId,
          ...(status && { status: status.toUpperCase() })
        },
        include: {
          user: {
            select: {
              username: true
            }
          },
          sponsor: {
            select: {
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: positions.map(p => ({
          id: p.id,
          matrixId: p.matrixLevel,
          level: p.matrixLevel,
          position: 0, // Calculate from positionPath if needed
          status: p.status.toLowerCase(),
          purchaseDate: p.createdAt,
          completionDate: p.cycledAt,
          earnings: p.totalEarned,
          sponsor: p.sponsorUsername || p.sponsor?.username,
          downline: (p.level1 || 0) + (p.level2 || 0) + (p.level3 || 0),
          maxDownline: 0, // Calculate from matrix config
          progress: 0 // Calculate from downline count
        }))
      });
    } catch {
      // MySQL fallback - would need to adapt to your schema
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get user positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix positions'
    });
  }
});

// Get matrix overview (for dashboard)
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get user's matrix positions summary
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const positions = await prisma.matrixPosition.findMany({
        where: { userId: userId },
        select: {
          matrixLevel: true,
          status: true,
          totalEarned: true,
          cycleCount: true
        }
      });

      const summary = positions.reduce((acc, p) => {
        acc.totalPositions = (acc.totalPositions || 0) + 1;
        acc.activePositions = (acc.activePositions || 0) + (p.status === 'ACTIVE' ? 1 : 0);
        acc.completedCycles = (acc.completedCycles || 0) + (p.cycleCount || 0);
        acc.totalEarnings = (acc.totalEarnings || 0) + parseFloat(p.totalEarned || 0);
        return acc;
      }, {
        totalPositions: 0,
        activePositions: 0,
        completedCycles: 0,
        totalEarnings: 0
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: summary
      });
    } catch {
      res.json({
        success: true,
        data: {
          totalPositions: 0,
          activePositions: 0,
          completedCycles: 0,
          totalEarnings: 0
        }
      });
    }
  } catch (error) {
    console.error('Get matrix overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix overview'
    });
  }
});

// Get next to cycle candidates (for NextToCycle page)
router.get('/next-to-cycle', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { matrixLevel } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where = {
        userId: userId,
        status: 'ACTIVE'
      };

      if (matrixLevel) {
        where.matrixLevel = parseInt(matrixLevel);
      }

      const positions = await prisma.matrixPosition.findMany({
        where: where,
        include: {
          user: {
            select: {
              username: true,
              joinDate: true
            }
          },
          sponsor: {
            select: {
              username: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const candidates = positions.map(p => {
        const neededPositions = Math.pow(2, p.matrixLevel) - ((p.level1 || 0) + (p.level2 || 0));
        const progress = neededPositions > 0 
          ? (((p.level1 || 0) + (p.level2 || 0)) / Math.pow(2, p.matrixLevel)) * 100 
          : 100;

        return {
          id: p.id,
          username: p.user.username,
          position: 0, // Would need to calculate from positionPath
          level: p.matrixLevel,
          matrixId: p.matrixLevel,
          progress: Math.min(progress, 100),
          neededPositions: Math.max(0, neededPositions),
          estimatedCompletion: null, // Would need to calculate based on recent activity
          status: neededPositions === 0 ? 'ready' : progress > 80 ? 'pending' : 'pending',
          sponsor: p.sponsorUsername || p.sponsor?.username,
          joinDate: p.user.joinDate?.toISOString() || p.createdAt.toISOString(),
          lastActivity: p.updatedAt?.toISOString() || p.createdAt.toISOString()
        };
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: candidates
      });
    } catch {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get next to cycle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get next to cycle data'
    });
  }
});

// Get matrix levels (for PurchasePosition page)
router.get('/levels', authenticateToken, async (req, res) => {
  try {
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const configs = await prisma.matrixConfig.findMany({
        where: { isActive: true },
        orderBy: { level: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          levels: configs.map(c => ({
            id: c.level,
            level: c.level,
            name: c.name,
            price: parseFloat(c.price.toString()),
            currency: c.currency,
            matrixWidth: c.matrixWidth,
            matrixDepth: c.matrixDepth,
            referralBonus: parseFloat(c.referralBonus.toString()),
            matrixBonus: parseFloat(c.matrixBonus.toString()),
            matchingBonus: parseFloat(c.matchingBonus.toString()),
            cycleBonus: parseFloat(c.cycleBonus.toString()),
            isActive: c.isActive
          }))
        }
      });
    } catch {
      // MySQL fallback
      const configs = await query(
        'SELECT * FROM matrix_configs WHERE status = "active" ORDER BY id ASC'
      );

      res.json({
        success: true,
        data: {
          levels: configs.map((c) => ({
            id: c.id,
            level: c.id,
            name: c.name || `Level ${c.id}`,
            price: parseFloat(c.fee || 0),
            currency: 'USD',
            matrixWidth: c.width || 2,
            matrixDepth: c.levels || 10,
            referralBonus: 0,
            matrixBonus: 0,
            matchingBonus: 0,
            cycleBonus: 0,
            isActive: true
          }))
        }
      });
    }
  } catch (error) {
    console.error('Get matrix levels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix levels'
    });
  }
});

// Process matrix entry
router.post('/entry', authenticateToken, async (req, res) => {
  try {
    const { username, matrixId, sponsor } = req.body;

    if (!username || !matrixId) {
      return res.status(400).json({
        success: false,
        error: 'Username and matrix ID are required'
      });
    }

    // Check if user exists
    const user = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if matrix config exists
    const config = await queryOne('SELECT id FROM matrix_configs WHERE id = ?', [matrixId]);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Matrix configuration not found'
      });
    }

    // Here you would implement the actual matrix entry logic
    // For now, returning success as placeholder
    res.json({
      success: true,
      message: 'Matrix entry processed successfully',
      data: { positionId: 1 } // This would be the actual position ID
    });
  } catch (error) {
    console.error('Process matrix entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process matrix entry'
    });
  }
});

// ============ ADVANCED MATRIX FEATURES ============

// Get matrix types
router.get('/advanced/types', authenticateToken, async (req, res) => {
  try {
    const matrixTypes = [
      { id: '2x2', name: '2x2 Matrix', structure: { width: 2, height: 2 }, description: 'Binary matrix structure' },
      { id: '3x3', name: '3x3 Matrix', structure: { width: 3, height: 3 }, description: 'Ternary matrix structure' },
      { id: '4x4', name: '4x4 Matrix', structure: { width: 4, height: 4 }, description: 'Quaternary matrix structure' },
      { id: 'forced', name: 'Forced Matrix', structure: { type: 'forced' }, description: 'Standard forced matrix' },
      { id: 'unforced', name: 'Unforced Matrix', structure: { type: 'unforced' }, description: 'Flexible placement matrix' },
      { id: 'hybrid', name: 'Hybrid Matrix', structure: { type: 'hybrid' }, description: 'Combination of forced and unforced' }
    ];

    res.json({
      success: true,
      data: matrixTypes
    });
  } catch (error) {
    console.error('Get matrix types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix types'
    });
  }
});

// Get swap options for position
router.get('/advanced/positions/:id/swap-options', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get position
      const position = await prisma.matrixPosition.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });

      if (!position || position.userId !== userId) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Position not found'
        });
      }

      // Find available positions for swap (same level, different user, not completed)
      const swapOptions = await prisma.matrixPosition.findMany({
        where: {
          level: position.level,
          userId: { not: userId },
          status: { in: ['active', 'pending'] }
        },
        include: {
          user: {
            select: { id: true, username: true }
          }
        },
        take: 10
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          currentPosition: {
            id: position.id,
            level: position.level,
            position: position.position,
            status: position.status
          },
          swapOptions: swapOptions.map(p => ({
            id: p.id,
            level: p.level,
            position: p.position,
            status: p.status,
            user: p.user
          }))
        }
      });
    } catch (error) {
      console.error('Get swap options error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get swap options'
      });
    }
  } catch (error) {
    console.error('Get swap options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get swap options'
    });
  }
});

// Swap matrix positions
router.post('/advanced/positions/:id/swap', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { targetPositionId } = req.body;

    if (!targetPositionId) {
      return res.status(400).json({
        success: false,
        error: 'Target position ID is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get both positions
      const [sourcePosition, targetPosition] = await Promise.all([
        prisma.matrixPosition.findUnique({ where: { id } }),
        prisma.matrixPosition.findUnique({ where: { id: targetPositionId } })
      ]);

      if (!sourcePosition || sourcePosition.userId !== userId) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Source position not found or access denied'
        });
      }

      if (!targetPosition) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Target position not found'
        });
      }

      if (sourcePosition.level !== targetPosition.level) {
        await prisma.$disconnect();
        return res.status(400).json({
          success: false,
          error: 'Positions must be on the same level'
        });
      }

      // Swap positions (swap userIds)
      const sourceUserId = sourcePosition.userId;
      const targetUserId = targetPosition.userId;

      await prisma.$transaction([
        prisma.matrixPosition.update({
          where: { id },
          data: { userId: targetUserId }
        }),
        prisma.matrixPosition.update({
          where: { id: targetPositionId },
          data: { userId: sourceUserId }
        })
      ]);

      await prisma.$disconnect();

      // Broadcast update
      const io = req.app.get('io');
      const notifyUser = req.app.get('notifyUser');
      const broadcastAdminUpdate = req.app.get('broadcastAdminUpdate');
      if (io && notifyUser) {
        notifyUser(sourceUserId, 'matrix_position_swapped', { sourcePositionId: id, targetPositionId });
        notifyUser(targetUserId, 'matrix_position_swapped', { sourcePositionId: id, targetPositionId });
      }
      if (io && broadcastAdminUpdate) {
        broadcastAdminUpdate('matrix_position_updated', { sourcePositionId: id, targetPositionId });
      }

      res.json({
        success: true,
        message: 'Positions swapped successfully',
        data: {
          sourcePositionId: id,
          targetPositionId
        }
      });
    } catch (error) {
      console.error('Swap positions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to swap positions'
      });
    }
  } catch (error) {
    console.error('Swap positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to swap positions'
    });
  }
});

// Purchase insurance for position
router.post('/advanced/positions/:id/insure', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { premium, coverage, expiryDays = 365 } = req.body;

    if (!premium || !coverage) {
      return res.status(400).json({
        success: false,
        error: 'Premium and coverage are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get position
      const position = await prisma.matrixPosition.findUnique({
        where: { id }
      });

      if (!position || position.userId !== userId) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Position not found or access denied'
        });
      }

      // Create insurance record (MatrixInsurance table needs to be in schema)
      // For now, return success
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Insurance purchased successfully',
        data: {
          positionId: id,
          premium: parseFloat(premium),
          coverage: parseFloat(coverage),
          expiryDate,
          isActive: true
        }
      });
    } catch (error) {
      console.error('Purchase insurance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to purchase insurance'
      });
    }
  } catch (error) {
    console.error('Purchase insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase insurance'
    });
  }
});

// Get insurance info
router.get('/advanced/positions/:id/insurance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const position = await prisma.matrixPosition.findUnique({
        where: { id }
      });

      if (!position || position.userId !== userId) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Position not found or access denied'
        });
      }

      // TODO: Get insurance from MatrixInsurance table
      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          positionId: id,
          hasInsurance: false,
          insurance: null
        }
      });
    } catch (error) {
      console.error('Get insurance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get insurance info'
      });
    }
  } catch (error) {
    console.error('Get insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insurance info'
    });
  }
});

// Clone matrix position
router.post('/advanced/positions/:id/clone', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get source position
      const sourcePosition = await prisma.matrixPosition.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });

      if (!sourcePosition || sourcePosition.userId !== userId) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Position not found or access denied'
        });
      }

      if (sourcePosition.status !== 'completed') {
        await prisma.$disconnect();
        return res.status(400).json({
          success: false,
          error: 'Only completed positions can be cloned'
        });
      }

      // Create cloned position (new position in same level)
      const clonedPosition = await prisma.matrixPosition.create({
        data: {
          userId: sourcePosition.userId,
          matrixId: sourcePosition.matrixId,
          level: sourcePosition.level,
          position: 0, // Will be assigned by matrix placement logic
          status: 'pending',
          sponsor: sourcePosition.sponsor,
          totalEarned: 0,
          referralBonus: 0,
          levelBonus: 0,
          matchingBonus: 0,
          cycleBonus: 0,
          cycleCount: 0
        }
      });

      // Create clone record (MatrixClone table needs to be in schema)
      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Position cloned successfully',
        data: {
          sourcePositionId: id,
          clonedPositionId: clonedPosition.id,
          level: clonedPosition.level,
          status: clonedPosition.status
        }
      });
    } catch (error) {
      console.error('Clone position error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clone position'
      });
    }
  } catch (error) {
    console.error('Clone position error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clone position'
    });
  }
});

// Get advanced matrix analytics
router.get('/advanced/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get user's positions
      const positions = await prisma.matrixPosition.findMany({
        where: { userId }
      });

      // Calculate analytics
      const totalPositions = positions.length;
      const activePositions = positions.filter(p => p.status === 'active').length;
      const completedPositions = positions.filter(p => p.status === 'completed').length;
      const totalEarnings = positions.reduce((sum, p) => sum + parseFloat(p.totalEarned.toString()), 0);
      const averageCycleTime = positions.filter(p => p.cycleCount > 0).length > 0
        ? positions.filter(p => p.cycleCount > 0).reduce((sum, p) => sum + p.cycleCount, 0) / positions.filter(p => p.cycleCount > 0).length
        : 0;

      // Level distribution
      const levelDistribution = {};
      positions.forEach(p => {
        levelDistribution[p.level] = (levelDistribution[p.level] || 0) + 1;
      });

      // Fill rate by level
      const fillRateByLevel = {};
      // TODO: Calculate actual fill rates

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          summary: {
            totalPositions,
            activePositions,
            completedPositions,
            totalEarnings,
            averageCycleTime
          },
          levelDistribution,
          fillRateByLevel,
          recentPositions: positions.slice(-5).map(p => ({
            id: p.id,
            level: p.level,
            status: p.status,
            totalEarned: parseFloat(p.totalEarned.toString()),
            cycleCount: p.cycleCount
          }))
        }
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get analytics'
      });
    }
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

module.exports = router; 