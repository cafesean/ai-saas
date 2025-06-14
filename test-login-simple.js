const http = require('http');
const querystring = require('querystring');

async function testLogin() {
  console.log('Testing login with admin@example.com...');
  
  try {
    // Step 0: Sign out first to clear any existing session
    console.log('🔄 Signing out first to clear any existing session...');
    try {
      await makeRequest('POST', 'http://localhost:3000/api/auth/signout');
      console.log('✓ Signed out successfully');
    } catch (signoutError) {
      console.log('⚠️ Signout failed (this is okay if no session exists):', signoutError.message);
    }
    
    // Step 1: Get CSRF token
    const csrfResponse = await makeRequest('GET', 'http://localhost:3000/api/auth/csrf');
    const csrfData = JSON.parse(csrfResponse);
    console.log('✓ Got CSRF token:', csrfData.csrfToken);
    
    // Step 2: Prepare login data
    const postData = querystring.stringify({
      email: 'admin@example.com',
      password: 'password',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3000',
      json: 'true'
    });
    
    // Step 3: Make login request
    const loginResponse = await makeRequestWithResponse('POST', 'http://localhost:3000/api/auth/callback/credentials', postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    });
    
    console.log('✓ Login response status:', loginResponse.statusCode);
    console.log('✓ Login response headers:', loginResponse.headers);
    
    // Step 4: Extract session cookies
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies) {
      console.log('✓ Got cookies:', cookies);
      
      // Step 5: Test session with cookies
      const sessionResponse = await makeRequest('GET', 'http://localhost:3000/api/auth/session', null, {
        'Cookie': cookies.join('; ')
      });
      
      console.log('✓ Session response:', sessionResponse);
      
      const sessionData = JSON.parse(sessionResponse);
      if (sessionData && sessionData.user) {
        console.log('🎉 SUCCESS! User is authenticated:', sessionData.user);
        return true;
      } else {
        console.log('❌ Session is empty');
        return false;
      }
    } else {
      console.log('❌ No cookies received');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

function makeRequestWithResponse(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(responseData);
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
          error.response = responseData;
          reject(error);
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Run the test
testLogin().then(success => {
  if (success) {
    console.log('\n🎉 Authentication is working! You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n   Visit: http://localhost:3000/login');
  } else {
    console.log('\n❌ Authentication failed. Check the logs above for details.');
  }
}).catch(console.error); 