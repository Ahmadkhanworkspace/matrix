// Quick API Test Script
// Run: node test-api.js

const https = require('https');

const BASE_URL = 'https://considerate-adventure-production.up.railway.app';

async function test(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, error: 'Invalid JSON' });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Testing Railway Backend API...\n');
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(50) + '\n');
  
  try {
    // Test 1: Supabase Connection
    console.log('1️⃣  Testing Supabase connection...');
    try {
      const supabaseTest = await test('/api/supabase/test');
      if (supabaseTest.success && supabaseTest.connected) {
        console.log('   ✅ Supabase connected successfully');
      } else {
        console.log('   ⚠️  Supabase:', supabaseTest.message || supabaseTest.error || 'Not connected');
      }
      console.log('   Response:', JSON.stringify(supabaseTest, null, 2));
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 2: System Status
    console.log('2️⃣  Testing system status...');
    try {
      const status = await test('/api/system/status');
      console.log('   Database Type:', status.database?.type || 'Unknown');
      if (status.database?.supabase) {
        console.log('   Supabase Status:', status.database.supabase.connected ? '✅ Connected' : '❌ Not connected');
      }
      console.log('   Cron Jobs:', Object.keys(status.cronJobs || {}).length, 'jobs');
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 3: Health Check
    console.log('3️⃣  Testing health check...');
    try {
      const health = await test('/api/health');
      console.log('   Status:', health.status || health.message || 'Unknown');
      if (health.database) {
        console.log('   Database:', health.database);
      }
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 4: Supabase Status
    console.log('4️⃣  Testing Supabase configuration...');
    try {
      const supabaseStatus = await test('/api/supabase/status');
      console.log('   Configured:', supabaseStatus.configured ? '✅ Yes' : '❌ No');
      console.log('   Using Prisma:', supabaseStatus.usePrisma ? '✅ Yes' : '❌ No');
      console.log('   Has Database URL:', supabaseStatus.hasDatabaseUrl ? '✅ Yes' : '❌ No');
      console.log('   Has Supabase URL:', supabaseStatus.hasSupabaseUrl ? '✅ Yes' : '❌ No');
      console.log('   Has Supabase Key:', supabaseStatus.hasSupabaseKey ? '✅ Yes' : '❌ No');
    } catch (e) {
      console.log('   ⚠️  Endpoint requires authentication or not available');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!\n');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runTests();

