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
      console.log('   Current env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PRISMA')).join(', '));
      return null;
    }

    console.log('🔧 Attempting to initialize Prisma client...');
    console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Try to require Prisma client - check multiple paths
    let PrismaClient;
    let resolvedPrismaClientPath = null;
    
    // Get current working directory and module paths for debugging
    const cwd = process.cwd();
    console.log(`   Current working directory: ${cwd}`);
    console.log(`   __dirname: ${__dirname}`);
    if (typeof require.resolve.paths === 'function') {
      const paths = require.resolve.paths('@prisma/client') || [];
      console.log(`   Node module search paths (first 3):`, paths.slice(0, 3).join(', '));
    }
    
    const pathsToTry = [
      '@prisma/client',
      '../../node_modules/@prisma/client',
      '../../../node_modules/@prisma/client',
      '/app/node_modules/@prisma/client',
      '/app/backend/node_modules/@prisma/client'
    ];
    
    let lastError;
    for (const path of pathsToTry) {
      try {
        const resolved = require.resolve(path);
        console.log(`   ✅ Resolved Prisma client path: ${resolved}`);
        resolvedPrismaClientPath = resolved;
        PrismaClient = require(path).PrismaClient;
        console.log(`   ✅ Successfully required Prisma client from: ${path}`);
        break;
      } catch (requireError) {
        lastError = requireError;
        // Only log if it's not a "module not found" error to reduce noise
        if (!requireError.message.includes('Cannot find module')) {
          console.log(`   ⚠️  Failed to require from ${path}: ${requireError.message}`);
        }
        continue;
      }
    }
    
    // Determine where Prisma will look for generated client
    // Prisma looks for .prisma/client in the same node_modules as @prisma/client
    if (resolvedPrismaClientPath) {
      const prismaClientDir = require('path').dirname(resolvedPrismaClientPath);
      const expectedGeneratedPath = require('path').join(prismaClientDir, '..', '..', '.prisma', 'client');
      console.log(`   Prisma will look for generated client at: ${expectedGeneratedPath}`);
      const fs = require('fs');
      const generatedExists = fs.existsSync(expectedGeneratedPath);
      console.log(`   Generated client exists at expected location: ${generatedExists}`);
      if (!generatedExists) {
        // Try to copy/link it there
        const sourceGeneratedPath = require('path').join(cwd, 'node_modules', '.prisma', 'client');
        if (fs.existsSync(sourceGeneratedPath)) {
          const targetDir = require('path').join(prismaClientDir, '..', '..', '.prisma');
          try {
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            // Use recursive copy with fs
            const copyRecursiveSync = (src, dest) => {
              const exists = fs.existsSync(src);
              const stats = exists && fs.statSync(src);
              const isDirectory = exists && stats.isDirectory();
              if (isDirectory) {
                if (!fs.existsSync(dest)) {
                  fs.mkdirSync(dest, { recursive: true });
                }
                fs.readdirSync(src).forEach(childItemName => {
                  copyRecursiveSync(
                    require('path').join(src, childItemName),
                    require('path').join(dest, childItemName)
                  );
                });
              } else {
                fs.copyFileSync(src, dest);
              }
            };
            copyRecursiveSync(sourceGeneratedPath, expectedGeneratedPath);
            console.log(`   ✅ Copied generated client to expected location`);
          } catch (copyError) {
            console.error(`   ⚠️  Failed to copy generated client: ${copyError.message}`);
          }
        }
      }
    }
    
    if (!PrismaClient) {
      console.error('❌ Cannot require @prisma/client from any path');
      console.error('   Last error:', lastError?.message);
      console.error('   Last error code:', lastError?.code);
      console.error('   Tried paths:', pathsToTry.join(', '));
      console.error('   This usually means Prisma client was not generated.');
      console.error('   Expected location: node_modules/@prisma/client');
      
      // Try to list what's in node_modules to help debug
      try {
        const fs = require('fs');
        const path = require('path');
        const rootNodeModules = path.join(cwd, 'node_modules');
        const backendNodeModules = path.join(cwd, 'backend', 'node_modules');
        console.error(`   Root node_modules exists: ${fs.existsSync(rootNodeModules)}`);
        console.error(`   Backend node_modules exists: ${fs.existsSync(backendNodeModules)}`);
        if (fs.existsSync(rootNodeModules)) {
          const prismaDir = path.join(rootNodeModules, '@prisma');
          console.error(`   @prisma directory exists: ${fs.existsSync(prismaDir)}`);
          if (fs.existsSync(prismaDir)) {
            const contents = fs.readdirSync(prismaDir);
            console.error(`   Contents of @prisma: ${contents.join(', ')}`);
          }
        }
      } catch (debugError) {
        console.error('   Could not check node_modules:', debugError.message);
      }
      
      return null;
    }

    console.log('   ✅ PrismaClient class found, attempting to instantiate...');
    
    try {
      // Validate DATABASE_URL format before creating client
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('://')) {
        console.error('❌ DATABASE_URL appears to be invalid (missing protocol)');
        return null;
      }
      
      // Check if generated Prisma client exists
      const fs = require('fs');
      const path = require('path');
      const generatedClientPath = path.join(cwd, 'node_modules', '.prisma', 'client');
      const backendGeneratedClientPath = path.join(cwd, 'backend', 'node_modules', '.prisma', 'client');
      
      console.log(`   Checking for generated client at: ${generatedClientPath}`);
      console.log(`   Or at: ${backendGeneratedClientPath}`);
      
      const generatedExists = fs.existsSync(generatedClientPath);
      const backendGeneratedExists = fs.existsSync(backendGeneratedClientPath);
      
      console.log(`   Root .prisma/client exists: ${generatedExists}`);
      console.log(`   Backend .prisma/client exists: ${backendGeneratedExists}`);
      
      if (!generatedExists && !backendGeneratedExists) {
        console.error('❌ Prisma generated client not found');
        console.error(`   Expected at: ${generatedClientPath}`);
        console.error(`   Or: ${backendGeneratedClientPath}`);
        console.error('   Run: npx prisma generate --schema=./prisma/schema.prisma');
        return null;
      }
      
      console.log('   ✅ Generated Prisma client found, creating instance...');
      console.log(`   DATABASE_URL length: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0}`);
      
      // Try to create PrismaClient with explicit error handling
      let clientInstance;
      try {
        console.log('   Attempting new PrismaClient()...');
        clientInstance = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
        console.log('   ✅ PrismaClient constructor succeeded');
        console.log(`   Client instance type: ${typeof clientInstance}`);
        console.log(`   Has $connect: ${typeof clientInstance.$connect === 'function'}`);
      } catch (constructorErr) {
        console.error('❌ PrismaClient constructor threw error:', constructorErr.message);
        console.error('   Error name:', constructorErr.name);
        console.error('   Error code:', constructorErr.code);
        console.error('   Full stack:', constructorErr.stack);
        return null;
      }
      
      // Verify the client is actually functional (not just created)
      if (!clientInstance) {
        console.error('❌ PrismaClient constructor returned undefined/null');
        return null;
      }
      
      if (typeof clientInstance.$connect !== 'function') {
        console.error('❌ PrismaClient instance created but appears invalid');
        console.error(`   Instance keys: ${Object.keys(clientInstance).join(', ')}`);
        prismaClient = null;
        return null;
      }
      
      prismaClient = clientInstance;
      console.log('   ✅ PrismaClient instance created and validated successfully');
      console.log('✅ Prisma client initialized successfully');
      return prismaClient;
    } catch (constructorError) {
      console.error('❌ Error creating PrismaClient instance:', constructorError.message);
      console.error('   Error name:', constructorError.name);
      console.error('   Error code:', constructorError.code);
      console.error('   Error stack:', constructorError.stack);
      console.error('   DATABASE_URL format check:', process.env.DATABASE_URL ? 'URL exists' : 'URL missing');
      
      // Additional diagnostics
      try {
        const fs = require('fs');
        const path = require('path');
        const generatedClientPath = path.join(cwd, 'node_modules', '.prisma', 'client');
        console.error('   Generated client exists:', fs.existsSync(generatedClientPath));
      } catch (diagError) {
        // Ignore diagnostic errors
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Error initializing Prisma:', error.message);
    console.error('   Stack:', error.stack);
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

