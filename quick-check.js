const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function check() {
  console.log('\n🔍 Checking Backend Status...\n');
  
  // Check health
  try {
    const health = await makeRequest('https://considerate-adventure-production.up.railway.app/api/health');
    console.log('Health Check Status:', health.status);
    console.log('Health Response:', health.data.substring(0, 500));
    
    if (health.status === 200) {
      const parsed = JSON.parse(health.data);
      console.log('\n✅ Database:', parsed.database || 'unknown');
      console.log('✅ Status:', parsed.status || 'unknown');
    }
  } catch (e) {
    console.log('Health Error:', e.message);
  }
  
  // Check login
  console.log('\n---\n');
  try {
    const login = await makeRequest('https://considerate-adventure-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    console.log('Login Status:', login.status);
    console.log('Login Response:', login.data.substring(0, 500));
    
    if (login.status === 200) {
      const parsed = JSON.parse(login.data);
      if (parsed.success) {
        console.log('\n✅ LOGIN SUCCESS!');
        console.log('Token:', parsed.data?.token?.substring(0, 30) + '...');
      } else {
        console.log('\n❌ Login failed:', parsed.error);
      }
    }
  } catch (e) {
    console.log('Login Error:', e.message);
  }
  
  console.log('\n');
}

check();

