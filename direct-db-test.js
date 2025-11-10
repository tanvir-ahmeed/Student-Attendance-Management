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
    const StudentClass = require('./models/StudentClass');
    
    try {
      // Get a student directly
      const student = await Student.findById('690cb209d604353e0c519f85'); // John Doe's ID
      console.log('Student object:');
      console.log(JSON.stringify(student, null, 2));
      
      // Get student class associations for this student
      console.log('\n=== Student Class Associations ===');
      const studentClasses = await StudentClass.find({ studentId: student._id });
      
      console.log('StudentClasses (without populate):');
      studentClasses.forEach((sc, index) => {
        console.log(`  ${index + 1}. classId: ${sc.classId} (type: ${typeof sc.classId})`);
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