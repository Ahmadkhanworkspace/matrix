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

// Get Global PIF stats and contributions
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const pools = await prisma.globalPIFPool.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const totalAmount = pools.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalContributions = pools.length;
      const activeUsers = new Set(pools.map(p => p.userId)).size;

      // Get this month stats
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thisMonthPools = pools.filter(p => p.createdAt >= monthAgo);
      const thisMonthContributions = thisMonthPools.length;
      const thisMonthAmount = thisMonthPools.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Get top contributor
      const userContributions = {};
      pools.forEach(p => {
        if (!userContributions[p.userId]) {
          userContributions[p.userId] = 0;
        }
        userContributions[p.userId] += parseFloat(p.amount || 0);
      });

      const topContributorId = Object.keys(userContributions).reduce((a, b) => 
        userContributions[a] > userContributions[b] ? a : b, Object.keys(userContributions)[0]
      );

      const topContributor = topContributorId 
        ? await prisma.user.findUnique({ where: { id: topContributorId }, select: { username: true } })
        : null;

      const averageContribution = totalContributions > 0 ? totalAmount / totalContributions : 0;
      const goalAmount = 100000; // Default goal
      const goalProgress = (totalAmount / goalAmount) * 100;

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          totalContributions: totalContributions,
          totalAmount: totalAmount,
          activeUsers: activeUsers,
          thisMonthContributions: thisMonthContributions,
          thisMonthAmount: thisMonthAmount,
          topContributor: topContributor?.username || '',
          topAmount: topContributorId ? userContributions[topContributorId] : 0,
          averageContribution: averageContribution,
          goalAmount: goalAmount,
          goalProgress: Math.min(goalProgress, 100)
        }
      });
    } catch {
      // MySQL fallback
      try {
        const totalResult = await queryOne(
          'SELECT COUNT(*) as total, SUM(Amount) as totalAmount FROM globalpifpool'
        );
        const activeUsersResult = await queryOne(
          'SELECT COUNT(DISTINCT Username) as total FROM globalpifpool'
        );
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const thisMonthResult = await queryOne(
          'SELECT COUNT(*) as total, SUM(Amount) as totalAmount FROM globalpifpool WHERE Date >= ?',
          [monthAgo]
        );
        const topContributorResult = await queryOne(
          'SELECT Username, SUM(Amount) as total FROM globalpifpool GROUP BY Username ORDER BY total DESC LIMIT 1'
        );

        const totalContributions = totalResult?.total || 0;
        const totalAmount = parseFloat(totalResult?.totalAmount || 0);
        const activeUsers = activeUsersResult?.total || 0;
        const thisMonthContributions = thisMonthResult?.total || 0;
        const thisMonthAmount = parseFloat(thisMonthResult?.totalAmount || 0);
        const topContributor = topContributorResult?.Username || '';
        const topAmount = parseFloat(topContributorResult?.total || 0);
        const averageContribution = totalContributions > 0 ? totalAmount / totalContributions : 0;
        const goalAmount = 100000;
        const goalProgress = (totalAmount / goalAmount) * 100;

        res.json({
          success: true,
          data: {
            totalContributions: totalContributions,
            totalAmount: totalAmount,
            activeUsers: activeUsers,
            thisMonthContributions: thisMonthContributions,
            thisMonthAmount: thisMonthAmount,
            topContributor: topContributor,
            topAmount: topAmount,
            averageContribution: averageContribution,
            goalAmount: goalAmount,
            goalProgress: Math.min(goalProgress, 100)
          }
        });
      } catch {
        // Return default stats if table doesn't exist
        res.json({
          success: true,
          data: {
            totalContributions: 0,
            totalAmount: 0,
            activeUsers: 0,
            thisMonthContributions: 0,
            thisMonthAmount: 0,
            topContributor: '',
            topAmount: 0,
            averageContribution: 0,
            goalAmount: 100000,
            goalProgress: 0
          }
        });
      }
    }
  } catch (error) {
    console.error('Get PIF stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Global PIF stats'
    });
  }
});

// Get Global PIF contributions
router.get('/contributions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const [contributions, total] = await Promise.all([
        prisma.globalPIFPool.findMany({
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip: offset,
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }),
        prisma.globalPIFPool.count()
      ]);

      await prisma.$disconnect();

      res.json({
        success: true,
        data: contributions.map(c => ({
          id: c.id,
          username: c.user.username,
          amount: parseFloat(c.amount || 0),
          date: c.createdAt,
          status: 'completed'
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
      try {
        const contributions = await query(
          `SELECT Username, Amount, Date FROM globalpifpool 
           ORDER BY Date DESC LIMIT ? OFFSET ?`,
          [parseInt(limit), offset]
        );
        const totalResult = await queryOne('SELECT COUNT(*) as total FROM globalpifpool');

        res.json({
          success: true,
          data: contributions.map((c, idx) => ({
            id: idx + 1,
            username: c.Username,
            amount: parseFloat(c.Amount || 0),
            date: c.Date,
            status: 'completed'
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult?.total || 0,
            totalPages: Math.ceil((totalResult?.total || 0) / limit)
          }
        });
      } catch {
        res.json({
          success: true,
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          }
        });
      }
    }
  } catch (error) {
    console.error('Get PIF contributions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Global PIF contributions'
    });
  }
});

module.exports = router;

