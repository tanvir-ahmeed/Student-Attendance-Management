const http = require('http');

// Test data
const studentData = {
  name: "John Doe",
  rollNumber: "STU001",
  email: "john.doe@example.com",
  classIds: [
    "690cb73a8b9b52dd813c4ef9",
    "690cb73a8b9b52dd813c4efb"
  ]
};

const postData = JSON.stringify(studentData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/students/690cb73a8b9b52dd813c4f02',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGNiNzNhOGI5YjUyZGQ4MTNjNGVmNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjQ0MTQ0MywiZXhwIjoxNzY1MDMzNDQzfQ.JQTxSrpmr7PhNA6Azopef5eu2B2M7_l808wErE5EvbU',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response body:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check if classIds are strings or objects
      if (result.classIds) {
        console.log('\n=== classIds Analysis ===');
        result.classIds.forEach((classId, index) => {
          console.log(`classId[${index}]:`, classId);
          console.log(`typeof classId[${index}]:`, typeof classId);
          if (typeof classId === 'object') {
            console.log(`classId[${index}] keys:`, Object.keys(classId));
          }
        });
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