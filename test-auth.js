// Authentication Test Script for Admin Panel and User Panel
// Run with: node test-auth.js

const https = require('https');
const http = require('http');

// Configuration
const ADMIN_PANEL_URL = 'https://admin-panel-phi-hazel.vercel.app';
const USER_PANEL_URL = 'https://userpanel-lac.vercel.app';
const BACKEND_API_URL = 'https://considerate-adventure-production.up.railway.app/api';

// Test credentials
const TEST_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  user: {
    username: 'user',
    password: 'user123'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: res.responseUrl || url
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendLogin(credentials) {
  log(`\n🔐 Testing Backend API Login: ${credentials.username}`, 'cyan');
  
  try {
    const response = await makeRequest(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (response.status === 200) {
      const data = JSON.parse(response.data);
      if (data.success && data.data?.token) {
        log(`  ✅ Backend login successful`, 'green');
        log(`  Token: ${data.data.token.substring(0, 20)}...`, 'blue');
        return { success: true, token: data.data.token, user: data.data.user };
      } else {
        log(`  ❌ Backend login failed: ${data.error || 'Unknown error'}`, 'red');
        return { success: false, error: data.error };
      }
    } else {
      log(`  ❌ Backend login failed: HTTP ${response.status}`, 'red');
      const errorData = JSON.parse(response.data);
      log(`  Error: ${errorData.error || 'Unknown error'}`, 'red');
      return { success: false, error: errorData.error };
    }
  } catch (error) {
    log(`  ❌ Backend login error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testAdminPanelAccess() {
  log(`\n🔒 Testing Admin Panel Access Protection`, 'cyan');
  
  try {
    const response = await makeRequest(`${ADMIN_PANEL_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Check if redirected to login or if dashboard is accessible
    const isRedirected = response.status === 302 || 
                         response.status === 301 ||
                         response.url.includes('/login') ||
                         response.data.includes('login') ||
                         response.data.includes('Login');
    
    if (isRedirected || response.status === 401) {
      log(`  ✅ Admin panel is PROTECTED (redirected to login)`, 'green');
      return { protected: true };
    } else {
      log(`  ⚠️  Admin panel may be ACCESSIBLE without auth (HTTP ${response.status})`, 'yellow');
      log(`  Response URL: ${response.url}`, 'yellow');
      return { protected: false, status: response.status };
    }
  } catch (error) {
    log(`  ❌ Error testing admin panel: ${error.message}`, 'red');
    return { protected: false, error: error.message };
  }
}

async function testUserPanelAccess() {
  log(`\n🔒 Testing User Panel Access Protection`, 'cyan');
  
  try {
    const response = await makeRequest(`${USER_PANEL_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const isRedirected = response.status === 302 || 
                         response.status === 301 ||
                         response.url.includes('/login') ||
                         response.data.includes('login') ||
                         response.data.includes('Login');
    
    if (isRedirected || response.status === 401) {
      log(`  ✅ User panel is PROTECTED (redirected to login)`, 'green');
      return { protected: true };
    } else {
      log(`  ⚠️  User panel may be ACCESSIBLE without auth (HTTP ${response.status})`, 'yellow');
      log(`  Response URL: ${response.url}`, 'yellow');
      return { protected: false, status: response.status };
    }
  } catch (error) {
    log(`  ❌ Error testing user panel: ${error.message}`, 'red');
    return { protected: false, error: error.message };
  }
}

async function testAdminPanelLogin(credentials) {
  log(`\n🔐 Testing Admin Panel Login: ${credentials.username}`, 'cyan');
  
  try {
    // First, get login page to see if it exists
    const loginPageResponse = await makeRequest(`${ADMIN_PANEL_URL}/login`);
    
    // Try to login (this will depend on how the admin panel implements login)
    // Since it's client-side, we can't easily test the actual login flow
    // But we can check if the backend API works
    log(`  ℹ️  Admin panel login page exists (HTTP ${loginPageResponse.status})`, 'blue');
    log(`  ⚠️  Cannot test client-side login flow directly`, 'yellow');
    log(`  ✅ Testing backend API instead...`, 'blue');
    
    const backendResult = await testBackendLogin(credentials);
    return backendResult;
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testUserPanelLogin(credentials) {
  log(`\n🔐 Testing User Panel Login: ${credentials.username}`, 'cyan');
  
  try {
    const loginPageResponse = await makeRequest(`${USER_PANEL_URL}/login`);
    log(`  ℹ️  User panel login page exists (HTTP ${loginPageResponse.status})`, 'blue');
    log(`  ⚠️  Cannot test client-side login flow directly`, 'yellow');
    log(`  ✅ Testing backend API instead...`, 'blue');
    
    const backendResult = await testBackendLogin(credentials);
    return backendResult;
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 Authentication Test Suite', 'cyan');
  log('='.repeat(60), 'blue');
  
  // Test 1: Backend API Login
  log('\n📋 Test 1: Backend API Authentication', 'yellow');
  const adminBackend = await testBackendLogin(TEST_CREDENTIALS.admin);
  const userBackend = await testBackendLogin(TEST_CREDENTIALS.user);
  
  // Test 2: Admin Panel Protection
  log('\n📋 Test 2: Admin Panel Route Protection', 'yellow');
  const adminProtection = await testAdminPanelAccess();
  
  // Test 3: User Panel Protection
  log('\n📋 Test 3: User Panel Route Protection', 'yellow');
  const userProtection = await testUserPanelAccess();
  
  // Test 4: Admin Panel Login Flow
  log('\n📋 Test 4: Admin Panel Login Flow', 'yellow');
  const adminLogin = await testAdminPanelLogin(TEST_CREDENTIALS.admin);
  
  // Test 5: User Panel Login Flow
  log('\n📋 Test 5: User Panel Login Flow', 'yellow');
  const userLogin = await testUserPanelLogin(TEST_CREDENTIALS.user);
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'cyan');
  log('='.repeat(60), 'blue');
  
  log(`\n✅ Backend Admin Login: ${adminBackend.success ? 'PASS' : 'FAIL'}`, 
      adminBackend.success ? 'green' : 'red');
  log(`✅ Backend User Login: ${userBackend.success ? 'PASS' : 'FAIL'}`, 
      userBackend.success ? 'green' : 'red');
  log(`🔒 Admin Panel Protected: ${adminProtection.protected ? 'YES ✅' : 'NO ❌'}`, 
      adminProtection.protected ? 'green' : 'red');
  log(`🔒 User Panel Protected: ${userProtection.protected ? 'YES ✅' : 'NO ❌'}`, 
      userProtection.protected ? 'green' : 'red');
  
  // Critical issue warning
  if (!adminProtection.protected) {
    log('\n⚠️  CRITICAL: Admin panel is NOT protected!', 'red');
    log('   Anyone can access /admin/dashboard without login!', 'red');
    log('   This is a security vulnerability!', 'red');
  }
  
  if (!userProtection.protected) {
    log('\n⚠️  WARNING: User panel may not be protected!', 'yellow');
  }
  
  if (!adminBackend.success || !userBackend.success) {
    log('\n⚠️  WARNING: Backend login is not working!', 'yellow');
    log('   Check if users exist in database.', 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'blue');
  log('✅ Tests completed!', 'green');
  log('='.repeat(60), 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

