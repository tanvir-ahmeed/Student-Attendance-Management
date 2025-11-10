// Test the student update API endpoint directly
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB to get a valid student and classes
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Import models
    const Student = require('./models/Student');
    const Class = require('./models/Class');
    const User = require('./models/User');
    
    try {
      // Get a student and classes
      const students = await Student.find({});
      const classes = await Class.find({});
      
      if (students.length > 0 && classes.length >= 2) {
        const studentToUpdate = students[0]; // First student
        const classIds = [classes[0]._id, classes[1]._id]; // First two classes
        
        console.log(`Testing update for student: ${studentToUpdate.name}`);
        console.log(`Class IDs to assign:`, classIds);
        
        // Get an admin user to use for authentication
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
          console.log('No admin user found');
          mongoose.connection.close();
          return;
        }
        
        console.log('Found admin user:', adminUser.email);
        
        // Note: We would need to implement JWT token generation here to test the API
        // For now, let's just verify the data structure
        console.log('\nData that would be sent to API:');
        console.log(JSON.stringify({
          classIds: classIds,
          name: studentToUpdate.name,
          rollNumber: studentToUpdate.rollNumber,
          email: studentToUpdate.email
        }, null, 2));
        
      } else {
        console.log('Not enough students or classes to test');
      }
      
      // Close connection
      mongoose.connection.close();
    } catch (err) {
      console.error('Error:', err);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });