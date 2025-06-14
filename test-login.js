const https = require('https');
const http = require('http');
const querystring = require('querystring');

// Test login function
async function testLogin() {
  console.log('Testing login with admin@example.com...');
  
  // First get the CSRF token
  const csrfResponse = await makeRequest('GET', 'http://localhost:3000/api/auth/csrf');
  const csrfData = JSON.parse(csrfResponse);
  console.log('CSRF Token:', csrfData.csrfToken);
  
  // Prepare login data
  const postData = querystring.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    csrfToken: csrfData.csrfToken,
    callbackUrl: 'http://localhost:3000',
    json: 'true'
  });
  
  // Make login request
  try {
    const loginResponse = await makeRequest('POST', 'http://localhost:3000/api/auth/callback/credentials', postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    });
    
    console.log('Login Response:', loginResponse);
  } catch (error) {
    console.error('Login Error:', error.message);
    console.error('Response:', error.response);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
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
testLogin().catch(console.error); 