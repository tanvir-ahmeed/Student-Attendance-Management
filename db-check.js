const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Import models
    const Student = require('./models/Student');
    const Class = require('./models/Class');
    const StudentClass = require('./models/StudentClass');
    
    try {
      // Display all students
      console.log('\n=== Students ===');
      const students = await Student.find({});
      console.log(`Found ${students.length} students:`);
      students.forEach(student => {
        console.log(`- ${student.name} (${student.rollNumber}) - ${student.email}`);
      });
      
      // Display all classes
      console.log('\n=== Classes ===');
      const classes = await Class.find({});
      console.log(`Found ${classes.length} classes:`);
      classes.forEach(cls => {
        console.log(`- ${cls.name} (ID: ${cls._id})`);
      });
      
      // Display all student-class associations
      console.log('\n=== Student-Class Associations ===');
      const associations = await StudentClass.find({}).populate('studentId classId');
      console.log(`Found ${associations.length} associations:`);
      associations.forEach(assoc => {
        console.log(`- Student: ${assoc.studentId?.name || assoc.studentId} -> Class: ${assoc.classId?.name || assoc.classId}`);
      });
      
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