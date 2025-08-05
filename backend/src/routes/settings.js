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

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await query(
      'SELECT * FROM settings ORDER BY setting_key'
    );

    // Convert to key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });

    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
});

// Get setting by key
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await queryOne(
      'SELECT * FROM settings WHERE setting_key = ?',
      [key]
    );

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: {
        key: setting.setting_key,
        value: setting.setting_value,
        description: setting.description
      }
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setting'
    });
  }
});

// Update setting
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }

    // Check if setting exists
    const existingSetting = await queryOne(
      'SELECT id FROM settings WHERE setting_key = ?',
      [key]
    );

    if (existingSetting) {
      // Update existing setting
      await query(
        'UPDATE settings SET setting_value = ?, description = ? WHERE setting_key = ?',
        [value, description, key]
      );
    } else {
      // Create new setting
      await query(
        'INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    }

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setting'
    });
  }
});

// Delete setting
router.delete('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    // Check if setting exists
    const existingSetting = await queryOne(
      'SELECT id FROM settings WHERE setting_key = ?',
      [key]
    );

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    // Delete setting
    await query('DELETE FROM settings WHERE setting_key = ?', [key]);

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete setting'
    });
  }
});

// Initialize default settings
router.post('/init', authenticateToken, async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'Matrix MLM System',
        description: 'Website name'
      },
      {
        key: 'site_description',
        value: 'Professional Multi-Level Marketing Platform',
        description: 'Website description'
      },
      {
        key: 'primary_currency',
        value: 'TRX',
        description: 'Primary currency for the system'
      },
      {
        key: 'supported_currencies',
        value: 'TRX,BTC,ETH,USDT',
        description: 'Supported cryptocurrencies'
      },
      {
        key: 'min_withdrawal',
        value: '10',
        description: 'Minimum withdrawal amount'
      },
      {
        key: 'max_withdrawal',
        value: '10000',
        description: 'Maximum withdrawal amount'
      },
      {
        key: 'withdrawal_fee',
        value: '2',
        description: 'Withdrawal fee percentage'
      },
      {
        key: 'registration_bonus',
        value: '5',
        description: 'Registration bonus amount'
      },
      {
        key: 'referral_bonus',
        value: '10',
        description: 'Referral bonus percentage'
      },
      {
        key: 'matrix_levels',
        value: '10',
        description: 'Number of matrix levels'
      },
      {
        key: 'matrix_width',
        value: '3',
        description: 'Matrix width (positions per level)'
      },
      {
        key: 'email_notifications',
        value: 'true',
        description: 'Enable email notifications'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Maintenance mode status'
      },
      {
        key: 'admin_email',
        value: 'admin@matrixmlm.com',
        description: 'Admin contact email'
      },
      {
        key: 'support_email',
        value: 'support@matrixmlm.com',
        description: 'Support contact email'
      }
    ];

    for (const setting of defaultSettings) {
      // Check if setting already exists
      const existingSetting = await queryOne(
        'SELECT id FROM settings WHERE setting_key = ?',
        [setting.key]
      );

      if (!existingSetting) {
        // Insert new setting
        await query(
          'INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.description]
        );
      }
    }

    res.json({
      success: true,
      message: 'Default settings initialized successfully'
    });
  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize settings'
    });
  }
});

module.exports = router; 