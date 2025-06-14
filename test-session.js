const http = require('http');
const querystring = require('querystring');

// Test session function
async function testSession() {
  console.log('Testing session creation...');
  
  try {
    // First get the CSRF token
    const csrfResponse = await makeRequest('GET', 'http://localhost:3001/api/auth/csrf');
    const csrfData = JSON.parse(csrfResponse);
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // Prepare login data
    const postData = querystring.stringify({
      email: 'admin@example.com',
      password: 'admin123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3001',
      json: 'true'
    });
    
    // Make login request and capture cookies
    const loginResponse = await makeRequestWithCookies('POST', 'http://localhost:3001/api/auth/callback/credentials', postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    });
    
    console.log('Login Response Status:', loginResponse.statusCode);
    console.log('Login Response Headers:', loginResponse.headers);
    console.log('Cookies:', loginResponse.cookies);
    
    // Now try to get the session using the cookies
    if (loginResponse.cookies) {
      const sessionResponse = await makeRequest('GET', 'http://localhost:3001/api/auth/session', null, {
        'Cookie': loginResponse.cookies
      });
      
      console.log('Session Response:', sessionResponse);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Response:', error.response);
  }
}

// Helper function to make HTTP requests with cookie capture
function makeRequestWithCookies(method, url, data = null, headers = {}) {
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
        // Extract cookies from response headers
        const cookies = res.headers['set-cookie']?.join('; ') || '';
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData,
          cookies: cookies
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
testSession().catch(console.error); 