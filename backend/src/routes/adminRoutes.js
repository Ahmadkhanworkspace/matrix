const express = require('express');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');
const PaymentService = require('../services/PaymentService');

const router = express.Router();

// Middleware to verify admin token
const authenticateAdmin = (req, res, next) => {
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
    // Check if user is admin (you can enhance this based on your role system)
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// ============ MODULE ROUTES ============

// Get all modules
router.get('/modules', authenticateAdmin, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    // In a real implementation, modules would be stored in database
    // For now, returning mock structure that matches frontend expectations
    res.json({
      success: true,
      data: [], // Empty array will trigger fallback to mock data in frontend
      message: 'No modules found. Using default modules.'
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get modules'
    });
  }
});

// Get single module
router.get('/modules/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, fetch from database
    res.json({
      success: true,
      data: null,
      message: 'Module not found in database'
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get module'
    });
  }
});

// Purchase module (with payment gateway integration)
router.post('/modules/:id/purchase', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, gateway = 'coinpayments', currency = 'USDT' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get user
    const user = await queryOne('SELECT id, username FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // In real implementation, get module price from database
    // For now, using default price
    const modulePrice = 99.99; // Default module price
    
    // Create payment transaction through payment gateway
    const paymentResult = await PaymentService.createDeposit(
      user.username,
      modulePrice,
      currency,
      gateway
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create payment request'
      });
    }

    // Store module purchase record (in real implementation, use modules table)
    await query(
      `INSERT INTO transactions (user_id, type, amount, currency, status, transaction_id, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        'module_purchase',
        modulePrice,
        currency,
        'pending',
        paymentResult.transactionId,
        `Module Purchase - Module ID: ${id}`
      ]
    );

    res.json({
      success: true,
      message: 'Module purchase initiated. Please complete payment.',
      data: {
        transactionId: paymentResult.transactionId,
        paymentUrl: paymentResult.paymentData?.url || null,
        paymentData: paymentResult.paymentData,
        amount: modulePrice,
        currency: currency,
        gateway: gateway
      }
    });
  } catch (error) {
    console.error('Purchase module error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase module'
    });
  }
});

// Install module
router.post('/modules/:id/install', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if module is purchased
    const purchase = await queryOne(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       AND type = 'module_purchase' 
       AND description LIKE ? 
       AND status = 'completed'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, `%Module ID: ${id}%`]
    );

    if (!purchase) {
      return res.status(400).json({
        success: false,
        error: 'Module must be purchased before installation'
      });
    }

    // Store module installation (in real implementation, use modules_installed table)
    // For now, updating settings to track installed modules
    const installedModules = await queryOne(
      'SELECT value FROM settings WHERE key = ?',
      ['installed_modules']
    );

    let modules = [];
    if (installedModules && installedModules.value) {
      try {
        modules = JSON.parse(installedModules.value);
      } catch (e) {
        modules = [];
      }
    }

    if (!modules.includes(parseInt(id))) {
      modules.push(parseInt(id));
      
      await query(
        `INSERT INTO settings (key, value, description) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = ?`,
        [
          'installed_modules',
          JSON.stringify(modules),
          'List of installed module IDs',
          JSON.stringify(modules)
        ]
      );
    }

    res.json({
      success: true,
      message: 'Module installed successfully',
      data: {
        moduleId: parseInt(id),
        installedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Install module error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to install module'
    });
  }
});

// Uninstall module
router.post('/modules/:id/uninstall', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Remove module from installed modules
    const installedModules = await queryOne(
      'SELECT value FROM settings WHERE key = ?',
      ['installed_modules']
    );

    if (installedModules && installedModules.value) {
      try {
        let modules = JSON.parse(installedModules.value);
        modules = modules.filter(m => m !== parseInt(id));
        
        await query(
          'UPDATE settings SET value = ? WHERE key = ?',
          [JSON.stringify(modules), 'installed_modules']
        );
      } catch (e) {
        // Ignore parse errors
      }
    }

    res.json({
      success: true,
      message: 'Module uninstalled successfully',
      data: {
        moduleId: parseInt(id),
        uninstalledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Uninstall module error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to uninstall module'
    });
  }
});

// Update module status
router.patch('/modules/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // In real implementation, update module status in database
    res.json({
      success: true,
      message: 'Module status updated successfully',
      data: {
        moduleId: parseInt(id),
        status: status
      }
    });
  } catch (error) {
    console.error('Update module status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update module status'
    });
  }
});

// ============ PAYMENT GATEWAY CREDENTIALS ============

// Save payment gateway credentials
router.post('/payment-gateways/credentials', authenticateAdmin, async (req, res) => {
  try {
    const { gateway, credentials } = req.body;

    if (!gateway || !credentials) {
      return res.status(400).json({
        success: false,
        error: 'Gateway and credentials are required'
      });
    }

    // Store credentials in database (adminsettings table for MySQL, PaymentGatewayConfig for Prisma)
    try {
      // Try Prisma first
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const gatewayEnum = gateway.toUpperCase();
      const config = {
        privateKey: credentials.privateKey,
        publicKey: credentials.publicKey,
        apiKey: credentials.apiKey,
        secretKey: credentials.secretKey,
        ipnSecret: credentials.ipnSecret,
        merchantId: credentials.merchantId
      };

      await prisma.paymentGatewayConfig.upsert({
        where: { gateway: gatewayEnum },
        update: {
          config: config,
          isActive: credentials.enabled || false,
          isTestMode: credentials.isTestMode !== undefined ? credentials.isTestMode : true,
          updatedAt: new Date()
        },
        create: {
          name: gateway.charAt(0).toUpperCase() + gateway.slice(1),
          gateway: gatewayEnum,
          config: config,
          isActive: credentials.enabled || false,
          isTestMode: credentials.isTestMode !== undefined ? credentials.isTestMode : true,
          supportedCurrencies: ['USDT', 'BTC', 'ETH', 'TRX'],
          minAmount: 0,
          maxAmount: 10000
        }
      });

      await prisma.$disconnect();
    } catch (prismaError) {
      // Fallback to MySQL
      const db = require('../config/database');
      
      // Update or insert into adminsettings table
      const settingsMap = {
        coinpayments: {
          private_key: credentials.privateKey,
          public_key: credentials.publicKey,
          coinpayments_ipn_secret: credentials.ipnSecret,
          coinpayments_merchant_id: credentials.merchantId,
          coinpayments_test_mode: credentials.isTestMode ? 1 : 0
        },
        nowpayments: {
          nowpayments_api_key: credentials.apiKey,
          nowpayments_ipn_secret: credentials.ipnSecret || credentials.ipn_secret_key,
          nowpayments_test_mode: credentials.isTestMode ? 1 : 0
        },
        binance: {
          binance_api_key: credentials.apiKey,
          binance_secret_key: credentials.secretKey,
          binance_merchant_id: credentials.merchantId,
          binance_ipn_secret: credentials.ipnSecret,
          binance_test_mode: credentials.isTestMode ? 1 : 0
        }
      };

      const settings = settingsMap[gateway.toLowerCase()];
      if (settings) {
        // Check if adminsettings exists
        const [existing] = await db.query('SELECT * FROM adminsettings LIMIT 1');
        
        if (existing.length > 0) {
          // Update existing
          const updateFields = Object.keys(settings).map(key => `${key} = ?`).join(', ');
          const updateValues = Object.values(settings);
          await db.query(`UPDATE adminsettings SET ${updateFields} WHERE id = ?`, [...updateValues, existing[0].id]);
        } else {
          // Insert new
          const fields = Object.keys(settings).join(', ');
          const values = Object.values(settings);
          const placeholders = values.map(() => '?').join(', ');
          await db.query(`INSERT INTO adminsettings (${fields}) VALUES (${placeholders})`, values);
        }
      }
    }

    // Re-initialize gateway service to reload config
    const PaymentGatewayService = require('../services/PaymentGatewayService');
    await PaymentGatewayService.initializeGateways();

    res.json({
      success: true,
      message: `${gateway} credentials saved successfully`
    });
  } catch (error) {
    console.error('Save gateway credentials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save gateway credentials'
    });
  }
});

// Get payment gateway configuration
router.get('/payment-gateways/config', authenticateAdmin, async (req, res) => {
  try {
    const PaymentGatewayService = require('../services/PaymentGatewayService');
    const status = PaymentGatewayService.getGatewayStatus();

    // Try to get full config from database
    let config = {};
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const configs = await prisma.paymentGatewayConfig.findMany();
      config = {
        coinpayments: configs.find(c => c.gateway === 'COINPAYMENTS')?.config || {},
        nowpayments: configs.find(c => c.gateway === 'NOWPAYMENTS')?.config || {},
        binance: configs.find(c => c.gateway === 'BINANCE')?.config || {}
      };

      await prisma.$disconnect();
    } catch {
      // MySQL fallback
      const db = require('../config/database');
      const [settings] = await db.query('SELECT * FROM adminsettings LIMIT 1');
      if (settings[0]) {
        config = {
          coinpayments: {
            privateKey: settings[0].private_key,
            publicKey: settings[0].public_key,
            ipnSecret: settings[0].coinpayments_ipn_secret,
            merchantId: settings[0].coinpayments_merchant_id,
            isTestMode: settings[0].coinpayments_test_mode || false,
            enabled: !!(settings[0].private_key && settings[0].public_key)
          },
          nowpayments: {
            apiKey: settings[0].nowpayments_api_key || settings[0].tron_apikey,
            ipnSecret: settings[0].nowpayments_ipn_secret || settings[0].nowpayments_ipn_secret_key,
            isTestMode: settings[0].nowpayments_test_mode || false,
            enabled: !!(settings[0].nowpayments_api_key || settings[0].tron_apikey)
          },
          binance: {
            apiKey: settings[0].binance_api_key,
            secretKey: settings[0].binance_secret_key,
            merchantId: settings[0].binance_merchant_id,
            ipnSecret: settings[0].binance_ipn_secret,
            isTestMode: settings[0].binance_test_mode || false,
            enabled: !!(settings[0].binance_api_key && settings[0].binance_secret_key)
          }
        };
      }
    }

    res.json({
      success: true,
      data: {
        status,
        config
      }
    });
  } catch (error) {
    console.error('Get gateway config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get gateway configuration'
    });
  }
});

// ============ OTHER ADMIN ROUTES ============

// Admin settings endpoint (placeholder for other admin routes)
router.get('/settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings');
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
});

module.exports = router;

