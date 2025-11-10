// Test updating a student with multiple classes through the API
async function testUpdateStudent() {
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
    
    // Get classes to use for the update
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
    console.log('\nClasses available:');
    classes.forEach(cls => console.log(`- ${cls.name} (${cls._id})`));
    
    // Get students
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
    
    if (students.length > 0 && classes.length >= 2) {
      const studentToUpdate = students[0]; // First student
      const classIds = [classes[0]._id, classes[1]._id]; // First two classes
      
      console.log(`\nUpdating student ${studentToUpdate.name} with classes:`);
      classIds.forEach(id => {
        const cls = classes.find(c => c._id === id);
        console.log(`- ${cls.name}`);
      });
      
      // Update the student
      const updateResponse = await fetch(`http://localhost:5000/api/students/${studentToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classIds: classIds,
          name: studentToUpdate.name,
          rollNumber: studentToUpdate.rollNumber,
          email: studentToUpdate.email
        })
      });
      
      if (!updateResponse.ok) {
        console.log('Failed to update student');
        const errorText = await updateResponse.text();
        console.log('Error:', errorText);
        return;
      }
      
      const updatedStudent = await updateResponse.json();
      console.log('\nStudent updated successfully:');
      console.log(`- Name: ${updatedStudent.name}`);
      console.log(`- Class IDs:`, updatedStudent.classIds);
      console.log(`- Raw classIds:`, JSON.stringify(updatedStudent.classIds, null, 2));
      
      // Verify the update by fetching the student again
      const verifyResponse = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifiedStudents = await verifyResponse.json();
        const verifiedStudent = verifiedStudents.find(s => s._id === studentToUpdate._id);
        console.log('\nVerification - Student class IDs after update:', verifiedStudent.classIds);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpdateStudent();