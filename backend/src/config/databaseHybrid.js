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
    
    // Import path and fs early
    const path = require('path');
    const fs = require('fs');
    
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
    
    // Try to load PrismaClient directly from generated client first, then fallback to @prisma/client
    const pathsToTry = [
      // Direct paths to generated client index.js (preferred - these should have real code)
      path.join(cwd, 'backend', 'node_modules', '.prisma', 'client', 'index.js'),
      path.join(cwd, 'node_modules', '.prisma', 'client', 'index.js'),
      '/app/backend/node_modules/.prisma/client/index.js',
      '/app/node_modules/.prisma/client/index.js',
      // Fallback to @prisma/client package (may have stub)
      '@prisma/client',
      '../../node_modules/@prisma/client',
      '../../../node_modules/@prisma/client',
      '/app/node_modules/@prisma/client',
      '/app/backend/node_modules/@prisma/client'
    ];
    
    let lastError;
    for (const tryPath of pathsToTry) {
      try {
        const resolved = require.resolve(tryPath, { paths: [cwd, path.join(cwd, 'backend')] });
        console.log(`   ✅ Resolved Prisma client path: ${resolved}`);
        resolvedPrismaClientPath = resolved;
        
        // Try to get PrismaClient from the resolved module
        const module = require(tryPath);
        if (module.PrismaClient) {
          PrismaClient = module.PrismaClient;
        } else if (module.default && module.default.PrismaClient) {
          PrismaClient = module.default.PrismaClient;
        } else if (typeof module === 'function') {
          // If the module itself is PrismaClient
          PrismaClient = module;
        }
        
        if (PrismaClient) {
          console.log(`   ✅ Successfully required Prisma client from: ${tryPath}`);
          // Verify it's not a stub by checking if it's a real constructor
          try {
            const testInstance = new PrismaClient();
            if (testInstance && typeof testInstance.$connect === 'function') {
              console.log(`   ✅ Verified PrismaClient is real (not stub)`);
            } else {
              console.log(`   ⚠️  PrismaClient may be stub, trying next path...`);
              PrismaClient = null;
              continue;
            }
          } catch (testError) {
            if (testError.message && testError.message.includes('did not initialize')) {
              console.log(`   ⚠️  PrismaClient is stub, trying next path...`);
              PrismaClient = null;
              continue;
            }
            // Other errors might be OK (e.g., connection errors)
          }
          break;
        }
      } catch (requireError) {
        lastError = requireError;
        // Only log if it's not a "module not found" error to reduce noise
        if (!requireError.message.includes('Cannot find module')) {
          console.log(`   ⚠️  Failed to require from ${tryPath}: ${requireError.message}`);
        }
        continue;
      }
    }
    
    // Determine where Prisma will look for generated client
    // Prisma looks for .prisma/client in the same node_modules as @prisma/client
    if (resolvedPrismaClientPath) {
      
      // require.resolve returns the main entry file, need to get the package directory
      // @prisma/client resolves to default.js, so go up to the package root
      let prismaClientPackageDir = path.dirname(resolvedPrismaClientPath);
      // If it's default.js, we're in the package, otherwise go up
      if (path.basename(prismaClientPackageDir) === 'client') {
        // We're in /app/backend/node_modules/@prisma/client
        // Prisma looks for .prisma/client in the same node_modules
        // So: /app/backend/node_modules/.prisma/client
        prismaClientPackageDir = path.dirname(prismaClientPackageDir); // Goes to @prisma
        prismaClientPackageDir = path.dirname(prismaClientPackageDir); // Goes to node_modules
      }
      
      const expectedGeneratedPath = path.join(prismaClientPackageDir, '.prisma', 'client');
      console.log(`   Resolved @prisma/client from: ${resolvedPrismaClientPath}`);
      console.log(`   Prisma will look for generated client at: ${expectedGeneratedPath}`);
      
      const generatedExists = fs.existsSync(expectedGeneratedPath);
      console.log(`   Generated client exists at expected location: ${generatedExists}`);
      
      if (!generatedExists) {
        // Try to copy/link it there
        const sourceGeneratedPath = path.join(cwd, 'node_modules', '.prisma', 'client');
        const backendGeneratedPath = path.join(cwd, 'backend', 'node_modules', '.prisma', 'client');
        
        let sourcePath = null;
        if (fs.existsSync(backendGeneratedPath)) {
          sourcePath = backendGeneratedPath;
        } else if (fs.existsSync(sourceGeneratedPath)) {
          sourcePath = sourceGeneratedPath;
        }
        
        if (sourcePath) {
          const targetDir = path.dirname(expectedGeneratedPath);
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
                    path.join(src, childItemName),
                    path.join(dest, childItemName)
                  );
                });
              } else {
                fs.copyFileSync(src, dest);
              }
            };
            copyRecursiveSync(sourcePath, expectedGeneratedPath);
            console.log(`   ✅ Copied generated client from ${sourcePath} to ${expectedGeneratedPath}`);
          } catch (copyError) {
            console.error(`   ⚠️  Failed to copy generated client: ${copyError.message}`);
            console.error(`   Stack: ${copyError.stack}`);
          }
        } else {
          console.error(`   ⚠️  No source generated client found to copy`);
          console.error(`   Checked: ${sourceGeneratedPath}`);
          console.error(`   And: ${backendGeneratedPath}`);
        }
      } else {
        console.log(`   ✅ Generated client already in correct location`);
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
      
      // Connection pooling format detection and conversion
      const originalDatabaseUrl = process.env.DATABASE_URL;
      const connectionUrls = [];
      
      // Check if URL is already in connection pooling format
      const isPoolingFormat = originalDatabaseUrl.includes('pooler.supabase.com') || 
                               originalDatabaseUrl.includes('postgres.ddpjrwoyjphumeenabyb');
      
      if (isPoolingFormat) {
        // Already in pooling format, use as-is (ensure SSL)
        const params = originalDatabaseUrl.includes('?') ? originalDatabaseUrl.split('?')[1] : '';
        const hasSsl = params.includes('sslmode');
        const poolingUrl = hasSsl 
          ? originalDatabaseUrl 
          : `${originalDatabaseUrl}${params ? '&' : '?'}sslmode=require`;
        
        connectionUrls.push({
          name: 'Connection Pooling (6543) - Original Format',
          url: poolingUrl,
          port: 6543
        });
      } else {
        // Convert from direct connection to pooling format
        // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
        // To: postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
        const urlMatch = originalDatabaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:(\d+)\/(.+)/);
        if (urlMatch) {
          const [, user, password, projectRef, port, database] = urlMatch;
          const params = originalDatabaseUrl.includes('?') ? originalDatabaseUrl.split('?')[1] : '';
          
          // Extract password (remove URL encoding if any)
          const decodedPassword = decodeURIComponent(password);
          
          // Construct pooling URL with correct format
          // Use the format: postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
          connectionUrls.push({
            name: 'Connection Pooling (6543) - Converted Format',
            url: `postgresql://postgres.${projectRef}:${decodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:6543/${database}?sslmode=require`,
            port: 6543
          });
        } else {
          // If parsing fails, try simple port change (fallback)
          const simpleMatch = originalDatabaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
          if (simpleMatch) {
            const [, user, password, host, port, database] = simpleMatch;
            const params = originalDatabaseUrl.includes('?') ? originalDatabaseUrl.split('?')[1] : '';
            connectionUrls.push({
              name: 'Connection Pooling (6543) - Simple Port Change',
              url: `postgresql://${user}:${password}@${host}:6543/${database}${params ? '?' + params : ''}${params ? '&' : '?'}sslmode=require`,
              port: 6543
            });
          } else {
            // If all parsing fails, use original URL as-is
            connectionUrls.push({
              name: 'Original URL',
              url: originalDatabaseUrl,
              port: 'unknown'
            });
          }
        }
      }
      
      // Try each connection URL - create client but don't test connection yet (lazy connection)
      let clientInstance = null;
      let workingUrl = null;
      
      for (const connInfo of connectionUrls) {
        try {
          console.log(`   🔄 Trying ${connInfo.name}...`);
          console.log(`      URL: ${connInfo.url.replace(/:[^:@]+@/, ':****@')}`); // Hide password
          
          // Temporarily set DATABASE_URL for this attempt
          process.env.DATABASE_URL = connInfo.url;
          
          // Create PrismaClient instance (don't test connection yet - lazy connection)
          clientInstance = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          });
          
          console.log(`   ✅ ${connInfo.name} client created successfully`);
          workingUrl = connInfo;
          break; // Use first successful client creation
          
        } catch (connError) {
          console.log(`   ❌ ${connInfo.name} failed: ${connError.message.substring(0, 100)}`);
          
          // Clean up failed client instance (if any was created)
          if (clientInstance) {
            // Disconnect will happen lazily, no need to await here
            clientInstance = null;
          }
          
          // Continue to next connection URL
          continue;
        }
      }
      
      // Restore original DATABASE_URL
      process.env.DATABASE_URL = originalDatabaseUrl;
      
      // If no connection worked, try one more time with original URL
      if (!clientInstance) {
        console.log('   ⚠️  All connection attempts failed, trying original DATABASE_URL...');
        try {
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
      } else {
        // Log which connection method is being used
        console.log(`   🎯 Using ${workingUrl.name} for database connection`);
        console.log(`   ✅ PrismaClient constructor succeeded`);
        console.log(`   Client instance type: ${typeof clientInstance}`);
        console.log(`   Has $connect: ${typeof clientInstance.$connect === 'function'}`);
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

// Get Prisma client (synchronous wrapper - returns client immediately, connection is lazy)
const prisma = () => {
  if (prismaClient) return prismaClient;
  return initPrisma();
};

module.exports = {
  pool: () => initMySQL(),
  prisma: prisma,
  supabase: () => getSupabase(),
  query,
  queryOne,
  transaction,
  testConnection,
  getDatabase,
  USE_PRISMA,
  USE_SUPABASE
};

