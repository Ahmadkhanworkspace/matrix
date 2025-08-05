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
    // Get total matrix positions
    const totalPositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions');
    const totalPositions = totalPositionsResult.total || 0;

    // Get active matrix positions (status = 'active')
    const activePositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions WHERE status = "active"');
    const activePositions = activePositionsResult.total || 0;

    // Get pending matrix positions (status = 'pending')
    const pendingPositionsResult = await queryOne('SELECT COUNT(*) as total FROM matrix_positions WHERE status = "pending"');
    const pendingPositions = pendingPositionsResult.total || 0;

    // Get completed cycles
    const completedCyclesResult = await queryOne('SELECT COUNT(*) as total FROM matrix_cycles WHERE status = "completed"');
    const completedCycles = completedCyclesResult.total || 0;

    res.json({
      success: true,
      data: {
        totalPositions: 0, // Set to zero for live testing
        activePositions: 0, // Set to zero for live testing
        pendingPositions: 0, // Set to zero for live testing
        completedCycles: 0 // Set to zero for live testing
      }
    });
  } catch (error) {
    console.error('Get matrix level stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix level statistics'
    });
  }
});

// Get all matrix configurations
router.get('/configs', authenticateToken, async (req, res) => {
  try {
    const configs = await query(
      'SELECT * FROM matrix_configs ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Get matrix configs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get matrix configurations'
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
  } catch (error) {
    console.error('Create matrix config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create matrix configuration'
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

module.exports = router; 