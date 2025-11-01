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

// Get user statistics for dashboard
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Get total users count
    const totalUsersResult = await queryOne('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalUsersResult.total || 0;

    // Get active users count (status = 1)
    const activeUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE status = 1');
    const activeUsers = activeUsersResult.total || 0;

    // Get pro users count (membership_level = 2)
    const proUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE membership_level = 2');
    const proUsers = proUsersResult.total || 0;

    // Get pending users count (status = 0)
    const pendingUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE status = 0');
    const pendingUsers = pendingUsersResult.total || 0;

    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeekResult = await queryOne(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= ?',
      [weekAgo]
    );
    const newUsersThisWeek = newUsersThisWeekResult.total || 0;

    // Get new users this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsersThisMonthResult = await queryOne(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= ?',
      [monthAgo]
    );
    const newUsersThisMonth = newUsersThisMonthResult.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers: 0, // Set to zero for live testing
        activeUsers: 0, // Set to zero for live testing
        proUsers: 0, // Set to zero for live testing
        pendingUsers: 0, // Set to zero for live testing
        newUsersThisWeek: 0, // Set to zero for live testing
        newUsersThisMonth: 0 // Set to zero for live testing
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

// Get all users (with pagination and filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, level, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Add filters
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (level) {
      whereClause += ' AND membership_level = ?';
      params.push(level);
    }

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    // Get users
    const users = await query(
      `SELECT id, username, email, first_name, last_name, phone, status, membership_level, 
       balance, sponsor, ref_by, join_date, last_login, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await queryOne(
      'SELECT id, username, email, first_name, last_name, phone, status, membership_level, balance, sponsor, ref_by, join_date, last_login FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, status, membership_level } = req.body;

    // Check if user exists
    const existingUser = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    await query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, status = ?, membership_level = ? WHERE id = ?',
      [first_name, last_name, phone, status, membership_level, id]
    );

    // Broadcast update to specific user and all admins
    const io = req.app.get('io');
    const notifyUser = req.app.get('notifyUser');
    const broadcastAdminUpdate = req.app.get('broadcastAdminUpdate');
    
    if (io && notifyUser) {
      notifyUser(id, 'profile_updated', { id, first_name, last_name, phone, status, membership_level });
    }
    if (io && broadcastAdminUpdate) {
      broadcastAdminUpdate('user_updated', { id, first_name, last_name, phone, status, membership_level });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Search users
router.get('/search/:term', authenticateToken, async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;

    const users = await query(
      `SELECT id, username, email, first_name, last_name, status, membership_level, balance, join_date 
       FROM users 
       WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
       ORDER BY created_at DESC 
       LIMIT ?`,
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, parseInt(limit)]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

// ============ USER PANEL ENDPOINTS ============

// Get user profile (current user)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const user = await queryOne(
      'SELECT id, username, email, first_name, last_name, phone, status, membership_level, balance, sponsor, ref_by, join_date, last_login, Unpaid as unpaidEarnings, Paid as paidEarnings, Total as totalEarnings FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Get user stats (for Stats page and Dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Check if using Prisma
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    
    if (USE_PRISMA) {
      // Use Prisma for Supabase
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Get user data
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            totalEarnings: true,
            unpaidEarnings: true,
            paidEarnings: true,
            username: true
          }
        });

        if (!user) {
          await prisma.$disconnect();
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Get withdrawals
        const withdrawals = await prisma.withdrawalTransaction.findMany({
          where: {
            userId: userId,
            approved: 1
          }
        });
        const totalWithdrawals = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

        // Get referrals count
        const totalReferrals = await prisma.user.count({
          where: {
            sponsorId: userId
          }
        });

        // Get active referrals
        const activeReferrals = await prisma.user.count({
          where: {
            sponsorId: userId,
            status: 'ACTIVE'
          }
        });

        // Get matrix positions count
        const matrixPositions = await prisma.matrixPosition.count({
          where: { userId: userId }
        });

        // Get completed cycles
        const completedCycles = await prisma.matrixPosition.count({
          where: {
            userId: userId,
            status: 'COMPLETED'
          }
        });

        // Get pending cycles (active positions)
        const pendingCycles = await prisma.matrixPosition.count({
          where: {
            userId: userId,
            status: 'ACTIVE'
          }
        });

        // Get total bonuses
        const bonuses = await prisma.bonus.findMany({
          where: { userId: userId }
        });
        const totalBonuses = bonuses.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

        // Get this month earnings (from transactions)
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const thisMonthTransactions = await prisma.transaction.findMany({
          where: {
            userId: userId,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            createdAt: { gte: monthAgo }
          }
        });
        const thisMonthEarnings = thisMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        // Get last month earnings
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const lastMonthTransactions = await prisma.transaction.findMany({
          where: {
            userId: userId,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            createdAt: {
              gte: twoMonthsAgo,
              lt: monthAgo
            }
          }
        });
        const lastMonthEarnings = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        // Calculate earnings growth
        const earningsGrowth = lastMonthEarnings > 0 
          ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
          : 0;

        await prisma.$disconnect();

        res.json({
          success: true,
          data: {
            totalEarnings: parseFloat(user.totalEarnings || 0),
            totalWithdrawals: totalWithdrawals,
            availableBalance: parseFloat(user.unpaidEarnings || 0),
            purchaseBalance: 0, // Add if you have this field
            totalReferrals: totalReferrals,
            activeReferrals: activeReferrals,
            matrixPositions: matrixPositions,
            totalPositions: matrixPositions,
            completedCycles: completedCycles,
            pendingCycles: pendingCycles,
            activeCycles: pendingCycles,
            totalBonuses: totalBonuses,
            thisMonthEarnings: thisMonthEarnings,
            lastMonthEarnings: lastMonthEarnings,
            earningsGrowth: earningsGrowth,
            totalPaid: parseFloat(user.paidEarnings || 0)
          }
        });
      } catch (prismaError) {
        console.error('Prisma error in user stats:', prismaError);
        // Fallback to MySQL if Prisma fails
        throw prismaError;
      }
    } else {
      // Fallback to MySQL queries
      const user = await queryOne(
        'SELECT Total as totalEarnings, Unpaid as unpaidEarnings, Paid as paidEarnings FROM users WHERE id = ?',
        [userId]
      );

      const withdrawalsResult = await queryOne(
        'SELECT SUM(Amount) as total FROM wtransaction WHERE Username = (SELECT username FROM users WHERE id = ?) AND approved = 1',
        [userId]
      );
      const totalWithdrawals = parseFloat(withdrawalsResult?.total || 0);

      const referralsResult = await queryOne(
        'SELECT COUNT(*) as total FROM users WHERE ref_by = (SELECT username FROM users WHERE id = ?)',
        [userId]
      );
      const totalReferrals = referralsResult?.total || 0;

      const activeReferralsResult = await queryOne(
        'SELECT COUNT(*) as total FROM users WHERE ref_by = (SELECT username FROM users WHERE id = ?) AND status = 1',
        [userId]
      );
      const activeReferrals = activeReferralsResult?.total || 0;

      const positionsResult = await queryOne(
        'SELECT COUNT(*) as total FROM matrix_positions WHERE userId = ?',
        [userId]
      );
      const matrixPositions = positionsResult?.total || 0;

      const completedCyclesResult = await queryOne(
        'SELECT COUNT(*) as total FROM matrix_positions WHERE userId = ? AND status = ?',
        [userId, 'COMPLETED']
      );
      const completedCycles = completedCyclesResult?.total || 0;

      const pendingCyclesResult = await queryOne(
        'SELECT COUNT(*) as total FROM matrix_positions WHERE userId = ? AND status = ?',
        [userId, 'ACTIVE']
      );
      const pendingCycles = pendingCyclesResult?.total || 0;

      const bonusesResult = await queryOne(
        'SELECT SUM(amount) as total FROM bonuses WHERE userId = ?',
        [userId]
      );
      const totalBonuses = parseFloat(bonusesResult?.total || 0);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thisMonthResult = await queryOne(
        'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = ? AND status = ? AND created_at >= ?',
        [userId, 'DEPOSIT', 'COMPLETED', monthAgo]
      );
      const thisMonthEarnings = parseFloat(thisMonthResult?.total || 0);

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const lastMonthResult = await queryOne(
        'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = ? AND status = ? AND created_at >= ? AND created_at < ?',
        [userId, 'DEPOSIT', 'COMPLETED', twoMonthsAgo, monthAgo]
      );
      const lastMonthEarnings = parseFloat(lastMonthResult?.total || 0);

      const earningsGrowth = lastMonthEarnings > 0 
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
        : 0;

      res.json({
        success: true,
        data: {
          totalEarnings: parseFloat(user?.totalEarnings || 0),
          totalWithdrawals: totalWithdrawals,
          availableBalance: parseFloat(user?.unpaidEarnings || 0),
          totalReferrals: totalReferrals,
          activeReferrals: activeReferrals,
          matrixPositions: matrixPositions,
          completedCycles: completedCycles,
          pendingCycles: pendingCycles,
          totalBonuses: totalBonuses,
          thisMonthEarnings: thisMonthEarnings,
          lastMonthEarnings: lastMonthEarnings,
          earningsGrowth: earningsGrowth
        }
      });
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats',
      details: error.message
    });
  }
});

// Get user transactions (for Wallet page)
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 50, type, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type.toUpperCase());
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status.toUpperCase());
    }

    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            userId: userId,
            ...(type && { type: type.toUpperCase() }),
            ...(status && { status: status.toUpperCase() })
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip: offset,
          include: {
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }),
        prisma.transaction.count({
          where: {
            userId: userId,
            ...(type && { type: type.toUpperCase() }),
            ...(status && { status: status.toUpperCase() })
          }
        })
      ]);

      await prisma.$disconnect();

      res.json({
        success: true,
        data: transactions.map(t => ({
          id: t.id,
          type: t.type.toLowerCase(),
          amount: t.amount,
          currency: t.currency,
          description: t.description || `${t.type} transaction`,
          date: t.createdAt,
          status: t.status.toLowerCase(),
          reference: t.transactionId || t.id
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch {
      // MySQL fallback
      const countResult = await queryOne(
        `SELECT COUNT(*) as total FROM transactions ${whereClause}`,
        params
      );

      const transactions = await query(
        `SELECT id, type, amount, currency, description, status, transaction_id, created_at 
         FROM transactions ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      res.json({
        success: true,
        data: transactions.map(t => ({
          id: t.id,
          type: t.type.toLowerCase(),
          amount: parseFloat(t.amount || 0),
          currency: t.currency || 'USD',
          description: t.description || `${t.type} transaction`,
          date: t.created_at,
          status: t.status.toLowerCase(),
          reference: t.transaction_id || t.id.toString()
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total || 0,
          totalPages: Math.ceil((countResult.total || 0) / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { firstName, lastName, email, phone, address } = req.body;

    await query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [firstName, lastName, email, phone, address, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router; 