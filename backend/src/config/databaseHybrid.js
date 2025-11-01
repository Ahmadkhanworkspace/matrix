// Hybrid database configuration - Supports both MySQL and Supabase (PostgreSQL)
require('dotenv').config();
const mysql = require('mysql2/promise');

// Check which database to use
const USE_SUPABASE = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');
const USE_PRISMA = process.env.USE_PRISMA === 'true' || USE_SUPABASE;

let pool = null;
let supabaseClient = null;
let prismaClient = null;

// Initialize MySQL pool (fallback)
const initMySQL = () => {
  if (pool) return pool;

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mlm_system',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };

  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool initialized');
  return pool;
};

// Initialize Supabase client
const initSupabase = () => {
  if (supabaseClient) return supabaseClient;

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase credentials not found. Using MySQL fallback.');
      return null;
    }

    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });

    console.log('✅ Supabase client initialized');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error.message);
    console.log('💡 Install: npm install @supabase/supabase-js');
    return null;
  }
};

// Initialize Prisma client
const initPrisma = () => {
  if (prismaClient) return prismaClient;

  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not found. Prisma disabled.');
      return null;
    }

    const { PrismaClient } = require('@prisma/client');
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    console.log('✅ Prisma client initialized');
    return prismaClient;
  } catch (error) {
    console.error('❌ Error initializing Prisma:', error.message);
    return null;
  }
};

// Get database instance based on configuration
const getDatabase = () => {
  if (USE_PRISMA) {
    return initPrisma() || { type: 'prisma' };
  }
  return { type: 'mysql', pool: initMySQL() };
};

// Get Supabase client
const getSupabase = () => {
  return initSupabase();
};

// Test database connection
const testConnection = async () => {
  try {
    if (USE_PRISMA) {
      const prisma = initPrisma();
      if (prisma) {
        await prisma.$connect();
        await prisma.$disconnect();
        console.log('✅ Prisma/PostgreSQL connected successfully');
        return true;
      }
    }

    // Fallback to MySQL
    const connection = await initMySQL().getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query (MySQL fallback)
const query = async (sql, params = []) => {
  if (USE_PRISMA) {
    // For Prisma, use Prisma methods instead of raw SQL
    console.warn('⚠️  Raw SQL queries not supported with Prisma. Use Prisma client methods.');
    return [];
  }

  try {
    const [rows] = await initMySQL().execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Execute query and return first row
const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
};

// Execute transaction (MySQL)
const transaction = async (callback) => {
  if (USE_PRISMA) {
    const prisma = initPrisma();
    if (prisma) {
      return await prisma.$transaction(callback);
    }
  }

  const connection = await initMySQL().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool: () => initMySQL(),
  prisma: () => initPrisma(),
  supabase: () => getSupabase(),
  query,
  queryOne,
  transaction,
  testConnection,
  getDatabase,
  USE_PRISMA,
  USE_SUPABASE
};

