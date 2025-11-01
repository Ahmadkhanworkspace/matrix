const express = require('express');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');
const crypto = require('crypto');

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

// Generate unique referral link code
const generateLinkCode = (userId, name) => {
  const hash = crypto.createHash('md5').update(`${userId}-${name}-${Date.now()}`).digest('hex');
  return hash.substring(0, 12).toUpperCase();
};

// Create referral link
router.post('/links', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Link name is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get user to build URL
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      });

      const linkCode = generateLinkCode(userId, name);
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const url = `${baseUrl}/register?ref=${linkCode}${utmSource ? `&utm_source=${utmSource}` : ''}${utmMedium ? `&utm_medium=${utmMedium}` : ''}${utmCampaign ? `&utm_campaign=${utmCampaign}` : ''}${utmTerm ? `&utm_term=${utmTerm}` : ''}${utmContent ? `&utm_content=${utmContent}` : ''}`;

      const link = await prisma.referralLink.create({
        data: {
          userId,
          name,
          linkCode,
          url,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmTerm: utmTerm || null,
          utmContent: utmContent || null
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Referral link created successfully',
        data: {
          id: link.id,
          name: link.name,
          linkCode: link.linkCode,
          url: link.url,
          clicks: link.clicks,
          signups: link.signups,
          conversions: link.conversions,
          totalEarnings: parseFloat(link.totalEarnings.toString())
        }
      });
    } catch (error) {
      console.error('Create referral link error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create referral link'
      });
    }
  } catch (error) {
    console.error('Create referral link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create referral link'
    });
  }
});

// Get user's referral links
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const links = await prisma.referralLink.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: links.map(link => ({
          id: link.id,
          name: link.name,
          linkCode: link.linkCode,
          url: link.url,
          clicks: link.clicks,
          signups: link.signups,
          conversions: link.conversions,
          totalEarnings: parseFloat(link.totalEarnings.toString()),
          isActive: link.isActive,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt
        }))
      });
    } catch (error) {
      console.error('Get referral links error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get referral links error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral links'
    });
  }
});

// Get referral link stats
router.get('/links/:id/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const link = await prisma.referralLink.findFirst({
        where: { id, userId },
        include: {
          clickRecords: {
            orderBy: { clickedAt: 'desc' },
            take: 100
          },
          conversionRecords: {
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
              click: true
            }
          }
        }
      });

      if (!link) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Referral link not found'
        });
      }

      // Calculate conversion rate
      const conversionRate = link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0;

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          link: {
            id: link.id,
            name: link.name,
            linkCode: link.linkCode,
            url: link.url,
            clicks: link.clicks,
            signups: link.signups,
            conversions: link.conversions,
            totalEarnings: parseFloat(link.totalEarnings.toString()),
            conversionRate: parseFloat(conversionRate.toFixed(2))
          },
          recentClicks: link.clickRecords.map(click => ({
            id: click.id,
            visitorIp: click.visitorIp,
            userAgent: click.userAgent,
            referrer: click.referrer,
            clickedAt: click.clickedAt,
            converted: click.converted
          })),
          recentConversions: link.conversionRecords.map(conv => ({
            id: conv.id,
            newUserId: conv.newUserId,
            conversionType: conv.conversionType,
            amount: parseFloat(conv.amount.toString()),
            commission: parseFloat(conv.commission.toString()),
            createdAt: conv.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Get link stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get link stats'
      });
    }
  } catch (error) {
    console.error('Get link stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get link stats'
    });
  }
});

// Get referral dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get all user's referral links
      const links = await prisma.referralLink.findMany({
        where: { userId, isActive: true }
      });

      // Get total stats
      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const totalSignups = links.reduce((sum, link) => sum + link.signups, 0);
      const totalConversions = links.reduce((sum, link) => sum + link.conversions, 0);
      const totalEarnings = links.reduce((sum, link) => sum + parseFloat(link.totalEarnings.toString()), 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Get active referrals (users referred by this user)
      const activeReferrals = await prisma.user.count({
        where: {
          sponsorId: userId,
          isActive: true
        }
      });

      // Get total referrals
      const totalReferrals = await prisma.user.count({
        where: { sponsorId: userId }
      });

      // Get conversion funnel data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const clicks30d = await prisma.referralClick.count({
        where: {
          link: { userId },
          clickedAt: { gte: thirtyDaysAgo }
        }
      });

      const signups30d = await prisma.user.count({
        where: {
          sponsorId: userId,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const active30d = await prisma.user.count({
        where: {
          sponsorId: userId,
          createdAt: { gte: thirtyDaysAgo },
          isActive: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          totalLinks: links.length,
          totalClicks,
          totalSignups,
          totalReferrals,
          activeReferrals,
          totalConversions,
          totalEarnings,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          funnel: {
            visitors: clicks30d,
            signups: signups30d,
            active: active30d
          }
        }
      });
    } catch (error) {
      console.error('Get referral dashboard error:', error);
      res.json({
        success: true,
        data: {
          totalLinks: 0,
          totalClicks: 0,
          totalSignups: 0,
          totalReferrals: 0,
          activeReferrals: 0,
          totalConversions: 0,
          totalEarnings: 0,
          conversionRate: 0,
          funnel: {
            visitors: 0,
            signups: 0,
            active: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Get referral dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral dashboard'
    });
  }
});

// Get referral leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      let dateFilter = {};
      if (period === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { gte: today } };
      } else if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { createdAt: { gte: weekAgo } };
      } else if (period === 'monthly') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { createdAt: { gte: monthAgo } };
      }

      // Get top referrers by total referrals
      const topReferrers = await prisma.user.groupBy({
        by: ['sponsorId'],
        where: {
          sponsorId: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: parseInt(limit)
      });

      // Get user details for top referrers
      const leaderboard = await Promise.all(
        topReferrers.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.sponsorId },
            select: {
              id: true,
              username: true,
              email: true,
              totalEarnings: true
            }
          });

          // Get total earnings from referrals
          const referralEarnings = await prisma.referralLink.aggregate({
            where: { userId: item.sponsorId },
            _sum: {
              totalEarnings: true
            }
          });

          return {
            rank: 0, // Will be set below
            userId: user?.id,
            username: user?.username,
            email: user?.email,
            totalReferrals: item._count.id,
            totalEarnings: parseFloat(referralEarnings._sum.totalEarnings?.toString() || '0'),
            userTotalEarnings: parseFloat(user?.totalEarnings.toString() || '0')
          };
        })
      );

      // Add rank numbers
      leaderboard.forEach((item, index) => {
        item.rank = index + 1;
      });

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

// Get downline tree
router.get('/downline-tree', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { depth = 5 } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const buildTree = async (parentId, currentDepth) => {
        if (currentDepth >= parseInt(depth)) return null;

        const children = await prisma.user.findMany({
          where: { sponsorId: parentId },
          select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            totalEarnings: true,
            createdAt: true,
            memberType: true
          }
        });

        const tree = await Promise.all(
          children.map(async (child) => {
            const childTree = await buildTree(child.id, currentDepth + 1);
            return {
              id: child.id,
              username: child.username,
              email: child.email,
              isActive: child.isActive,
              totalEarnings: parseFloat(child.totalEarnings.toString()),
              memberType: child.memberType,
              joinDate: child.createdAt,
              children: childTree || []
            };
          })
        );

        return tree;
      };

      const tree = await buildTree(userId, 0);

      await prisma.$disconnect();

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      console.error('Get downline tree error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get downline tree error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get downline tree'
    });
  }
});

// Get commission breakdown
router.get('/commission-breakdown', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { startDate, endDate } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where = {
        userId,
        commission: { gt: 0 }
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const conversions = await prisma.referralConversion.findMany({
        where,
        include: {
          link: {
            select: {
              name: true,
              linkCode: true
            }
          },
          click: {
            select: {
              clickedAt: true,
              referrer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group by referral user
      const breakdown = {};
      conversions.forEach(conv => {
        const key = conv.newUserId || 'unknown';
        if (!breakdown[key]) {
          breakdown[key] = {
            userId: conv.newUserId,
            totalCommission: 0,
            totalAmount: 0,
            conversions: 0,
            referrals: []
          };
        }

        breakdown[key].totalCommission += parseFloat(conv.commission.toString());
        breakdown[key].totalAmount += parseFloat(conv.amount.toString());
        breakdown[key].conversions += 1;
        breakdown[key].referrals.push({
          id: conv.id,
          linkName: conv.link.name,
          linkCode: conv.link.linkCode,
          conversionType: conv.conversionType,
          amount: parseFloat(conv.amount.toString()),
          commission: parseFloat(conv.commission.toString()),
          date: conv.createdAt
        });
      });

      const result = Object.values(breakdown).map((item, index) => ({
        rank: index + 1,
        ...item
      }));

      await prisma.$disconnect();

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get commission breakdown error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get commission breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get commission breakdown'
    });
  }
});

// Track referral click (public endpoint, but can be authenticated)
router.post('/track-click', async (req, res) => {
  try {
    const { linkCode, visitorIp, userAgent, referrer } = req.body;

    if (!linkCode) {
      return res.status(400).json({
        success: false,
        error: 'Link code is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Find link by code
      const link = await prisma.referralLink.findUnique({
        where: { linkCode: linkCode.toUpperCase() }
      });

      if (!link) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Referral link not found'
        });
      }

      // Create click record
      const click = await prisma.referralClick.create({
        data: {
          linkId: link.id,
          visitorIp: visitorIp || req.ip,
          userAgent: userAgent || req.headers['user-agent'],
          referrer: referrer || req.headers.referer
        }
      });

      // Update link click count
      await prisma.referralLink.update({
        where: { id: link.id },
        data: {
          clicks: {
            increment: 1
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Click tracked',
        data: {
          clickId: click.id,
          linkId: link.id
        }
      });
    } catch (error) {
      console.error('Track click error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track click'
      });
    }
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
});

module.exports = router;

