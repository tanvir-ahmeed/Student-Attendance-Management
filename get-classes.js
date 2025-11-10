// Test fetching classes from the API
async function getClasses() {
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
    
    // Now fetch classes
    const classesResponse = await fetch('http://localhost:5000/api/classes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!classesResponse.ok) {
      console.log('Failed to fetch classes');
      return;
    }
    
    const classes = await classesResponse.json();
    
    console.log('\nClasses fetched:');
    classes.forEach(cls => {
      console.log(`- ${cls.name} (${cls._id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getClasses();