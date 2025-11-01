const express = require('express');
const router = express.Router();
const supabaseConfig = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// Test Supabase connection
router.get('/test', async (req, res) => {
  try {
    const result = await supabaseConfig.testSupabaseConnection();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Supabase client status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const supabase = supabaseConfig.getSupabase();
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    
    res.json({
      success: true,
      configured: !!supabase,
      usePrisma: USE_PRISMA,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Query Supabase table (admin only)
router.get('/query/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const supabase = supabaseConfig.getSupabase();
    
    if (!supabase) {
      return res.status(400).json({
        success: false,
        error: 'Supabase not configured'
      });
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

