// Test fetching students from the API to see if classIds are populated

async function testFetchStudents() {
  try {
    // First, let's login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Now fetch students
    const studentsResponse = await fetch('http://localhost:5000/api/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!studentsResponse.ok) {
      console.log('Failed to fetch students');
      return;
    }
    
    const students = await studentsResponse.json();
    
    console.log('\nStudents fetched:');
    students.forEach(student => {
      console.log(`- ${student.name} (${student._id})`);
      console.log(`  Class IDs:`, student.classIds || 'None');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetchStudents();