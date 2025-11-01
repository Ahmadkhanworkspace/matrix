// Supabase configuration and client setup
require('dotenv').config();

let supabaseClient = null;

/**
 * Initialize Supabase client
 * Supabase uses PostgreSQL database with REST and Realtime APIs
 */
const initSupabase = () => {
  try {
    // Check if Supabase credentials are provided
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase not configured. Using MySQL fallback.');
      return null;
    }

    // Dynamically import @supabase/supabase-js
    const { createClient } = require('@supabase/supabase-js');

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-client-info': 'matrix-mlm-backend'
        }
      }
    });

    console.log('✅ Supabase client initialized');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error.message);
    console.log('💡 Install Supabase: npm install @supabase/supabase-js');
    return null;
  }
};

/**
 * Get Supabase client instance
 */
const getSupabase = () => {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
};

/**
 * Test Supabase connection
 */
const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return { connected: false, error: 'Supabase not configured' };
    }

    // Test connection by querying a table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      // Table might not exist, but connection works
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { connected: true, message: 'Supabase connected (tables may need migration)' };
      }
      return { connected: false, error: error.message };
    }

    return { connected: true, message: 'Supabase connected successfully' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

/**
 * Execute query using Supabase (PostgreSQL via Supabase REST API)
 */
const supabaseQuery = async (table, operation = 'select', options = {}) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    switch (operation) {
      case 'select':
        return await supabase
          .from(table)
          .select(options.select || '*')
          .match(options.where || {})
          .limit(options.limit || 1000)
          .order(options.orderBy || 'created_at', { ascending: options.ascending !== false });

      case 'insert':
        return await supabase
          .from(table)
          .insert(options.data)
          .select();

      case 'update':
        return await supabase
          .from(table)
          .update(options.data)
          .match(options.where)
          .select();

      case 'delete':
        return await supabase
          .from(table)
          .delete()
          .match(options.where);

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Supabase query error (${table}):`, error);
    throw error;
  }
};

module.exports = {
  initSupabase,
  getSupabase,
  testSupabaseConnection,
  supabaseQuery
};

