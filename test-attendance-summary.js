// Test script to check attendance summary functionality
const API_BASE_URL = 'http://localhost:5000';

async function testAttendanceSummary() {
  try {
    console.log('Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful');
    
    // Test fetching attendance records
    console.log('Fetching attendance records...');
    const attendanceResponse = await fetch(`${API_BASE_URL}/api/attendance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!attendanceResponse.ok) {
      console.log('Failed to fetch attendance records:', await attendanceResponse.text());
      return;
    }
    
    const attendanceRecords = await attendanceResponse.json();
    console.log('Attendance records fetched:', attendanceRecords.length);
    console.log('Sample record:', JSON.stringify(attendanceRecords[0], null, 2));
    
    // Test fetching classes
    console.log('Fetching classes...');
    const classesResponse = await fetch(`${API_BASE_URL}/api/classes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!classesResponse.ok) {
      console.log('Failed to fetch classes:', await classesResponse.text());
      return;
    }
    
    const classes = await classesResponse.json();
    console.log('Classes fetched:', classes.length);
    
    // Test fetching students
    console.log('Fetching students...');
    const studentsResponse = await fetch(`${API_BASE_URL}/api/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!studentsResponse.ok) {
      console.log('Failed to fetch students:', await studentsResponse.text());
      return;
    }
    
    const students = await studentsResponse.json();
    console.log('Students fetched:', students.length);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAttendanceSummary();