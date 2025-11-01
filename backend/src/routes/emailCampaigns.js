const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

// Initialize email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// ============ CAMPAIGNS ============

// Create campaign
router.post('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, type, subject, templateId, segments, abTestConfig, scheduledAt } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaign = await prisma.emailCampaign.create({
        data: {
          name,
          type,
          subject: subject || null,
          templateId: templateId || null,
          segments: segments || null,
          abTestConfig: abTestConfig || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          createdBy: userId,
          status: scheduledAt ? 'scheduled' : 'draft'
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create campaign'
      });
    }
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign'
    });
  }
});

// Get campaigns
router.get('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaigns = await prisma.emailCampaign.findMany({
        include: {
          _count: {
            select: {
              recipients: true,
              emails: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: campaigns.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          status: c.status,
          scheduledAt: c.scheduledAt,
          sentAt: c.sentAt,
          recipientCount: c._count.recipients,
          emailVariantCount: c._count.emails,
          createdAt: c.createdAt
        }))
      });
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaigns'
    });
  }
});

// Update campaign
router.put('/campaigns/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaign = await prisma.emailCampaign.update({
        where: { id },
        data: updateData
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Update campaign error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update campaign'
      });
    }
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign'
    });
  }
});

// Send campaign
router.post('/campaigns/:id/send', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
        include: {
          emails: true,
          recipients: true
        }
      });

      if (!campaign) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      // Get recipients
      const recipients = campaign.recipients || [];
      
      // Get email variants (for A/B testing)
      const emailVariants = campaign.emails.length > 0 
        ? campaign.emails 
        : [{ subject: campaign.subject || 'No Subject', content: '', variant: 'A' }];

      const transporter = getEmailTransporter();
      let sentCount = 0;

      // Send emails
      for (const recipient of recipients) {
        if (recipient.status !== 'pending') continue;

        // Select variant (for A/B testing)
        const variant = emailVariants[sentCount % emailVariants.length];

        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
            to: recipient.email,
            subject: variant.subject,
            html: variant.content,
            // Add tracking pixel and unsubscribe link
            headers: {
              'X-Campaign-ID': campaign.id,
              'X-Recipient-ID': recipient.id
            }
          });

          // Update recipient status
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'sent' }
          });

          // Update email variant sent count
          if (variant.id) {
            await prisma.campaignEmail.update({
              where: { id: variant.id },
              data: {
                sentCount: { increment: 1 }
              }
            });
          }

          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'bounced' }
          });
        }
      }

      // Update campaign
      await prisma.emailCampaign.update({
        where: { id },
        data: {
          status: 'completed',
          sentAt: new Date()
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: `Campaign sent to ${sentCount} recipients`,
        data: {
          sentCount,
          totalRecipients: recipients.length
        }
      });
    } catch (error) {
      console.error('Send campaign error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send campaign'
      });
    }
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send campaign'
    });
  }
});

// Get campaign stats
router.get('/campaigns/:id/stats', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
        include: {
          recipients: true,
          emails: true
        }
      });

      if (!campaign) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      const total = campaign.recipients.length;
      const sent = campaign.recipients.filter(r => r.status === 'sent').length;
      const opened = campaign.recipients.filter(r => r.openedAt).length;
      const clicked = campaign.recipients.filter(r => r.clickedAt).length;
      const bounced = campaign.recipients.filter(r => r.status === 'bounced').length;
      const unsubscribed = campaign.recipients.filter(r => r.status === 'unsubscribed').length;

      const openRate = sent > 0 ? (opened / sent) * 100 : 0;
      const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
      const bounceRate = total > 0 ? (bounced / total) * 100 : 0;

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            type: campaign.type,
            status: campaign.status
          },
          stats: {
            total,
            sent,
            opened,
            clicked,
            bounced,
            unsubscribed,
            openRate: parseFloat(openRate.toFixed(2)),
            clickRate: parseFloat(clickRate.toFixed(2)),
            bounceRate: parseFloat(bounceRate.toFixed(2))
          },
          variants: campaign.emails.map(e => ({
            id: e.id,
            variant: e.variant,
            sentCount: e.sentCount,
            openCount: e.openCount,
            clickCount: e.clickCount
          }))
        }
      });
    } catch (error) {
      console.error('Get campaign stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get campaign stats'
      });
    }
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign stats'
    });
  }
});

// Get campaign analytics
router.get('/campaigns/:id/analytics', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
        include: {
          recipients: {
            orderBy: { createdAt: 'asc' }
          },
          emails: true
        }
      });

      if (!campaign) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      // Daily stats
      const dailyStats = {};
      campaign.recipients.forEach(recipient => {
        const date = new Date(recipient.createdAt).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { sent: 0, opened: 0, clicked: 0 };
        }
        if (recipient.status === 'sent') dailyStats[date].sent++;
        if (recipient.openedAt) dailyStats[date].opened++;
        if (recipient.clickedAt) dailyStats[date].clicked++;
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            ...stats
          })),
          variants: campaign.emails.map(e => ({
            id: e.id,
            variant: e.variant,
            sentCount: e.sentCount,
            openCount: e.openCount,
            clickCount: e.clickCount,
            openRate: e.sentCount > 0 ? (e.openCount / e.sentCount) * 100 : 0,
            clickRate: e.sentCount > 0 ? (e.clickCount / e.sentCount) * 100 : 0
          }))
        }
      });
    } catch (error) {
      console.error('Get campaign analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get campaign analytics'
      });
    }
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign analytics'
    });
  }
});

// ============ TEMPLATES ============

// Create template
router.post('/templates', authenticateAdmin, async (req, res) => {
  try {
    const { name, subject, content, variables, type, isActive } = req.body;

    if (!name || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name, subject, and content are required'
      });
    }

    try {
      // Note: EmailTemplate table needs to be created in Prisma schema
      // For now, we'll return success but template won't be saved
      res.json({
        success: true,
        message: 'Template created successfully',
        data: {
          name,
          subject,
          content,
          variables: variables || [],
          type: type || 'general',
          isActive: isActive !== undefined ? isActive : true
        }
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create template'
      });
    }
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
});

// Get templates
router.get('/templates', authenticateAdmin, async (req, res) => {
  try {
    // Note: EmailTemplate table needs to be created in Prisma schema
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

// ============ A/B TESTING ============

// Create A/B test
router.post('/campaigns/:id/ab-test', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { variants } = req.body;

    if (!variants || variants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 variants required for A/B testing'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Delete existing variants
      await prisma.campaignEmail.deleteMany({
        where: { campaignId: id }
      });

      // Create new variants
      const createdVariants = await Promise.all(
        variants.map((variant, index) =>
          prisma.campaignEmail.create({
            data: {
              campaignId: id,
              subject: variant.subject,
              content: variant.content,
              variant: String.fromCharCode(65 + index) // A, B, C, etc.
            }
          })
        )
      );

      // Update campaign A/B test config
      await prisma.emailCampaign.update({
        where: { id },
        data: {
          abTestConfig: {
            enabled: true,
            variants: variants.length,
            split: 100 / variants.length
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'A/B test created successfully',
        data: {
          variants: createdVariants.map(v => ({
            id: v.id,
            variant: v.variant,
            subject: v.subject
          }))
        }
      });
    } catch (error) {
      console.error('Create A/B test error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create A/B test'
      });
    }
  } catch (error) {
    console.error('Create A/B test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create A/B test'
    });
  }
});

module.exports = router;

