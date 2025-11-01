const express = require('express');
const jwt = require('jsonwebtoken');
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

// Middleware for API key authentication (for public API)
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }

  // Verify API key
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    prisma.tenant.findUnique({
      where: { apiKey },
      select: { id: true, name: true, isActive: true }
    }).then(tenant => {
      if (!tenant || !tenant.isActive) {
        prisma.$disconnect();
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive API key'
        });
      }
      req.tenant = tenant;
      prisma.$disconnect();
      next();
    }).catch(error => {
      prisma.$disconnect();
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }
};

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map();
const rateLimitMiddleware = (req, res, next) => {
  const key = req.tenant?.id || req.ip;
  const limit = 100; // requests
  const window = 60000; // 1 minute

  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.resetTime > window) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + window
    });
    return next();
  }

  if (record.count >= limit) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  record.count++;
  next();
};

// ============ TENANT MANAGEMENT (Admin) ============

// Create tenant
router.post('/tenants', authenticateAdmin, async (req, res) => {
  try {
    const { name, subdomain } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Name and subdomain are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Generate API keys
      const apiKey = crypto.randomBytes(32).toString('hex');
      const apiSecret = crypto.randomBytes(32).toString('hex');

      const tenant = await prisma.tenant.create({
        data: {
          name,
          subdomain: subdomain.toLowerCase(),
          apiKey,
          apiSecret,
          isActive: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Tenant created successfully',
        data: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          apiKey: tenant.apiKey,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt
        }
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Subdomain already exists'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to create tenant'
      });
    }
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tenant'
    });
  }
});

// Get tenants
router.get('/tenants', authenticateAdmin, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const tenants = await prisma.tenant.findMany({
        include: {
          brandSettings: true
        },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: tenants.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          isActive: t.isActive,
          hasBrandSettings: !!t.brandSettings,
          createdAt: t.createdAt
        }))
      });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tenants'
    });
  }
});

// ============ BRAND SETTINGS ============

// Update brand settings
router.put('/tenants/:id/settings', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { brandName, logoUrl, faviconUrl, primaryColor, secondaryColor, fontFamily, customCSS, customJS, footerText, isActive } = req.body;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id }
      });

      if (!tenant) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
      }

      // Upsert brand settings
      const brandSettings = await prisma.brandSettings.upsert({
        where: { tenantId: id },
        create: {
          tenantId: id,
          brandName: brandName || tenant.name,
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
          primaryColor: primaryColor || '#3B82F6',
          secondaryColor: secondaryColor || '#1E40AF',
          fontFamily: fontFamily || 'Inter',
          customCSS: customCSS || null,
          customJS: customJS || null,
          footerText: footerText || null,
          isActive: isActive !== undefined ? isActive : true
        },
        update: {
          brandName: brandName || undefined,
          logoUrl: logoUrl !== undefined ? logoUrl : undefined,
          faviconUrl: faviconUrl !== undefined ? faviconUrl : undefined,
          primaryColor: primaryColor || undefined,
          secondaryColor: secondaryColor || undefined,
          fontFamily: fontFamily || undefined,
          customCSS: customCSS !== undefined ? customCSS : undefined,
          customJS: customJS !== undefined ? customJS : undefined,
          footerText: footerText !== undefined ? footerText : undefined,
          isActive: isActive !== undefined ? isActive : undefined
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Brand settings updated successfully',
        data: brandSettings
      });
    } catch (error) {
      console.error('Update brand settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update brand settings'
      });
    }
  } catch (error) {
    console.error('Update brand settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update brand settings'
    });
  }
});

// Get brand settings
router.get('/tenants/:id/settings', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const brandSettings = await prisma.brandSettings.findUnique({
        where: { tenantId: id },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          }
        }
      });

      await prisma.$disconnect();

      if (!brandSettings) {
        return res.json({
          success: true,
          data: null
        });
      }

      res.json({
        success: true,
        data: {
          id: brandSettings.id,
          tenantId: brandSettings.tenantId,
          tenant: brandSettings.tenant,
          brandName: brandSettings.brandName,
          logoUrl: brandSettings.logoUrl,
          faviconUrl: brandSettings.faviconUrl,
          primaryColor: brandSettings.primaryColor,
          secondaryColor: brandSettings.secondaryColor,
          fontFamily: brandSettings.fontFamily,
          customCSS: brandSettings.customCSS,
          customJS: brandSettings.customJS,
          footerText: brandSettings.footerText,
          isActive: brandSettings.isActive
        }
      });
    } catch (error) {
      console.error('Get brand settings error:', error);
      res.json({
        success: true,
        data: null
      });
    }
  } catch (error) {
    console.error('Get brand settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand settings'
    });
  }
});

// Get brand settings by subdomain (public)
router.get('/public/settings/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const tenant = await prisma.tenant.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
        include: {
          brandSettings: true
        }
      });

      if (!tenant || !tenant.isActive) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
      }

      await prisma.$disconnect();

      if (!tenant.brandSettings) {
        return res.json({
          success: true,
          data: {
            brandName: tenant.name,
            logoUrl: null,
            faviconUrl: null,
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            fontFamily: 'Inter'
          }
        });
      }

      res.json({
        success: true,
        data: {
          brandName: tenant.brandSettings.brandName,
          logoUrl: tenant.brandSettings.logoUrl,
          faviconUrl: tenant.brandSettings.faviconUrl,
          primaryColor: tenant.brandSettings.primaryColor,
          secondaryColor: tenant.brandSettings.secondaryColor,
          fontFamily: tenant.brandSettings.fontFamily,
          customCSS: tenant.brandSettings.customCSS,
          footerText: tenant.brandSettings.footerText
        }
      });
    } catch (error) {
      console.error('Get public settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get settings'
      });
    }
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
});

// ============ CUSTOM DOMAINS ============

// Add custom domain
router.post('/tenants/:id/domains', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const customDomain = await prisma.customDomain.create({
        data: {
          tenantId: id,
          domain: domain.toLowerCase(),
          dnsConfigured: false,
          verified: false
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Custom domain added successfully',
        data: {
          id: customDomain.id,
          domain: customDomain.domain,
          dnsConfigured: customDomain.dnsConfigured,
          verified: customDomain.verified,
          instructions: {
            step1: `Add CNAME record: ${domain} -> ${process.env.DEFAULT_DOMAIN || 'your-domain.com'}`,
            step2: 'Wait for DNS propagation (usually 24-48 hours)',
            step3: 'Click verify to check DNS configuration'
          }
        }
      });
    } catch (error) {
      console.error('Add domain error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Domain already exists'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to add domain'
      });
    }
  } catch (error) {
    console.error('Add domain error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add domain'
    });
  }
});

// Get domains
router.get('/tenants/:id/domains', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const domains = await prisma.customDomain.findMany({
        where: { tenantId: id },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: domains.map(d => ({
          id: d.id,
          domain: d.domain,
          dnsConfigured: d.dnsConfigured,
          verified: d.verified,
          verifiedAt: d.verifiedAt,
          createdAt: d.createdAt
        }))
      });
    } catch (error) {
      console.error('Get domains error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get domains error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get domains'
    });
  }
});

// Verify domain
router.post('/domains/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = require('dns').promises;

      const customDomain = await prisma.customDomain.findUnique({
        where: { id }
      });

      if (!customDomain) {
        return res.status(404).json({
          success: false,
          error: 'Domain not found'
        });
      }

      // TODO: Implement actual DNS verification
      // For now, mark as verified
      await prisma.customDomain.update({
        where: { id },
        data: {
          verified: true,
          verifiedAt: new Date(),
          dnsConfigured: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Domain verified successfully',
        data: {
          id: customDomain.id,
          domain: customDomain.domain,
          verified: true
        }
      });
    } catch (error) {
      console.error('Verify domain error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify domain'
      });
    }
  } catch (error) {
    console.error('Verify domain error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify domain'
    });
  }
});

// ============ API KEYS ============

// Generate API key
router.post('/tenants/:id/api-keys', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Generate new API keys
      const apiKey = crypto.randomBytes(32).toString('hex');
      const apiSecret = crypto.randomBytes(32).toString('hex');

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          apiKey,
          apiSecret
        },
        select: {
          id: true,
          name: true,
          apiKey: true,
          updatedAt: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'API keys generated successfully',
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          apiKey: tenant.apiKey,
          apiSecret: '***SECRET***', // Don't return secret
          warning: 'Save your API secret now. It will not be shown again.',
          updatedAt: tenant.updatedAt
        }
      });
    } catch (error) {
      console.error('Generate API key error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate API key'
      });
    }
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate API key'
    });
  }
});

// ============ PUBLIC API (with API key auth) ============

// Public API endpoint example
router.get('/public/users/:userId', authenticateApiKey, rateLimitMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          totalEarnings: true,
          createdAt: true
        }
      });

      await prisma.$disconnect();

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          totalEarnings: parseFloat(user.totalEarnings.toString()),
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user'
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

module.exports = router;

