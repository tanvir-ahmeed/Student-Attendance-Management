// Test updating a student directly through a simple HTTP call
const http = require('http');

// Data to send
const updateData = {
  classIds: [
    "690cb73a8b9b52dd813c4ef9", // Mathematics 101
    "690cb73a8b9b52dd813c4efb"  // History of Art
  ],
  name: "John Doe",
  rollNumber: "001",
  email: "john.doe@example.com"
};

const postData = JSON.stringify(updateData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/students/690cb73a8b9b52dd813c4f02', // John Doe
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGNiMjA5ZDYwNDM1M2UwYzUxOWY4MyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMDkwNTY4OSwiZXhwIjoxNzMwOTEyODg5fQ.1N8VJ9X9K9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b' // This is a dummy token, we'll replace it
  }
};

// First, let's get a real token
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const loginReq = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.token);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    loginReq.on('error', (error) => {
      reject(error);
    });
    
    loginReq.write(loginData);
    loginReq.end();
  });
}

async function updateStudent() {
  try {
    const token = await getAuthToken();
    console.log('Got auth token:', token.substring(0, 20) + '...');
    
    options.headers['Authorization'] = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:');
        console.log(data);
        
        try {
          const response = JSON.parse(data);
          console.log('Parsed response:');
          console.log(JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('Failed to parse response as JSON');
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
}

updateStudent();