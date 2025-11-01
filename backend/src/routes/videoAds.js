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
    // Check if user is admin (you may need to adjust this based on your auth system)
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

// Get all active video ad plans (for users)
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const plans = await prisma.videoAdPlan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: plans.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price.toString()),
          currency: p.currency,
          duration: p.duration,
          maxFileSize: p.maxFileSize,
          maxResolutions: p.maxResolutions,
          allowedFormats: p.allowedFormats,
          impressions: p.impressions,
          clicks: p.clicks,
          targetAudience: p.targetAudience,
          placement: p.placement,
          priority: p.priority,
          isPopular: p.isPopular
        }))
      });
    } catch {
      // MySQL fallback
      try {
        const plans = await query(
          'SELECT * FROM video_ad_plans WHERE isActive = 1 ORDER BY sortOrder ASC'
        );

        res.json({
          success: true,
          data: plans.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: parseFloat(p.price || 0),
            currency: p.currency || 'USD',
            duration: p.duration || 30,
            maxFileSize: p.maxFileSize || 50,
            maxResolutions: JSON.parse(p.maxResolutions || '[]'),
            allowedFormats: JSON.parse(p.allowedFormats || '[]'),
            impressions: p.impressions || 0,
            clicks: p.clicks || 0,
            targetAudience: JSON.parse(p.targetAudience || '[]'),
            placement: JSON.parse(p.placement || '[]'),
            priority: p.priority || 'medium',
            isPopular: p.isPopular || false
          }))
        });
      } catch {
        res.json({
          success: true,
          data: []
        });
      }
    }
  } catch (error) {
    console.error('Get video ad plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get video ad plans'
    });
  }
});

// Purchase video ad plan
router.post('/plans/:planId/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { planId } = req.params;

    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get plan
      const plan = await prisma.videoAdPlan.findUnique({
        where: { id: planId }
      });

      if (!plan || !plan.isActive) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Video ad plan not found'
        });
      }

      // Create purchase record
      const purchase = await prisma.videoAdPurchase.create({
        data: {
          userId: userId,
          planId: planId,
          status: 'pending'
        },
        include: {
          plan: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Video ad plan purchased successfully',
        data: {
          id: purchase.id,
          planId: purchase.planId,
          planName: purchase.plan.name,
          price: parseFloat(purchase.plan.price.toString()),
          currency: purchase.plan.currency,
          status: purchase.status
        }
      });
    } catch (error) {
      console.error('Purchase video ad plan error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to purchase video ad plan'
      });
    }
  } catch (error) {
    console.error('Purchase video ad plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase video ad plan'
    });
  }
});

// Get user's video ad purchases
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const purchases = await prisma.videoAdPurchase.findMany({
        where: { userId: userId },
        include: {
          plan: true
        },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: purchases.map(p => ({
          id: p.id,
          planId: p.planId,
          planName: p.plan.name,
          status: p.status,
          videoUrl: p.videoUrl,
          startDate: p.startDate,
          endDate: p.endDate,
          impressions: p.impressions,
          clicks: p.clicks,
          ctr: parseFloat(p.ctr.toString()),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))
      });
    } catch {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get video ad purchases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get video ad purchases'
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// Get all video ad plans (admin)
router.get('/admin/plans', authenticateAdmin, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const plans = await prisma.videoAdPlan.findMany({
        orderBy: { sortOrder: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: plans
      });
    } catch {
      const plans = await query('SELECT * FROM video_ad_plans ORDER BY sortOrder ASC');
      res.json({
        success: true,
        data: plans
      });
    }
  } catch (error) {
    console.error('Get video ad plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get video ad plans'
    });
  }
});

// Create video ad plan (admin)
router.post('/admin/plans', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, currency, duration, maxFileSize, maxResolutions, allowedFormats, impressions, clicks, targetAudience, placement, priority, isActive, isPopular, sortOrder } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const plan = await prisma.videoAdPlan.create({
        data: {
          name,
          description: description || null,
          price: parseFloat(price),
          currency: currency || 'USD',
          duration: duration || 30,
          maxFileSize: maxFileSize || 50,
          maxResolutions: maxResolutions || [],
          allowedFormats: allowedFormats || ['mp4'],
          impressions: impressions || 0,
          clicks: clicks || 0,
          targetAudience: targetAudience || [],
          placement: placement || [],
          priority: priority || 'medium',
          isActive: isActive !== undefined ? isActive : true,
          isPopular: isPopular || false,
          sortOrder: sortOrder || 0
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Video ad plan created successfully',
        data: plan
      });
    } catch (error) {
      console.error('Create video ad plan error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create video ad plan'
      });
    }
  } catch (error) {
    console.error('Create video ad plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create video ad plan'
    });
  }
});

// Update video ad plan (admin)
router.put('/admin/plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert price to float if present
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const plan = await prisma.videoAdPlan.update({
        where: { id },
        data: updateData
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Video ad plan updated successfully',
        data: plan
      });
    } catch (error) {
      console.error('Update video ad plan error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update video ad plan'
      });
    }
  } catch (error) {
    console.error('Update video ad plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update video ad plan'
    });
  }
});

// Delete video ad plan (admin)
router.delete('/admin/plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.videoAdPlan.delete({
        where: { id }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Video ad plan deleted successfully'
      });
    } catch (error) {
      console.error('Delete video ad plan error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete video ad plan'
      });
    }
  } catch (error) {
    console.error('Delete video ad plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video ad plan'
    });
  }
});

// Get all video ad purchases (admin)
router.get('/admin/purchases', authenticateAdmin, async (req, res) => {
  try {
    const { status, userId } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;

      const purchases = await prisma.videoAdPurchase.findMany({
        where,
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: purchases
      });
    } catch {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get video ad purchases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get video ad purchases'
    });
  }
});

module.exports = router;

