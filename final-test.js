// Final test to verify the multiple class selection fix
const http = require('http');
const fs = require('fs');

// Read the token from the file
const token = fs.readFileSync('token.txt', 'utf8').trim();

// Test data with multiple classes
const studentData = {
  name: "Test Student",
  rollNumber: "TEST001",
  email: "test.student@example.com",
  classIds: [
    "690cb73a8b9b52dd813c4ef9",  // Mathematics 101
    "690cb73a8b9b52dd813c4efb"   // History of Art
  ]
};

console.log('Testing student creation with multiple classes...');
console.log('Token:', token.substring(0, 30) + '...');

const postData = JSON.stringify(studentData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/students',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response received:');
      
      // Check if classIds are strings
      if (result.classIds && Array.isArray(result.classIds)) {
        console.log('✅ SUCCESS: classIds is an array of strings');
        result.classIds.forEach((classId, index) => {
          console.log(`  classId[${index}]: ${classId} (type: ${typeof classId})`);
        });
        
        if (result.classIds.length === 2) {
          console.log('✅ SUCCESS: Both classes were assigned correctly');
        } else {
          console.log(`❌ ERROR: Expected 2 classes, got ${result.classIds.length}`);
        }
      } else {
        console.log('❌ ERROR: classIds is not an array');
        console.log('Result:', result);
      }
    } catch (err) {
      console.error('Error parsing response:', err);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();