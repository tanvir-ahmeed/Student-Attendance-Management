const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Import models
    const StudentClass = require('./models/StudentClass');
    const Class = require('./models/Class');
    
    try {
      // Get a student class association WITHOUT populating
      console.log('\n=== Without Population ===');
      const studentClassesWithoutPopulate = await StudentClass.find({}).limit(2);
      
      if (studentClassesWithoutPopulate.length > 0) {
        studentClassesWithoutPopulate.forEach((sc, index) => {
          console.log(`\nStudentClass ${index + 1}:`);
          console.log(`  studentId: ${sc.studentId}`);
          console.log(`  classId: ${sc.classId}`);
          console.log(`  typeof classId: ${typeof sc.classId}`);
        });
      }
      
      // Get a student class association WITH populating
      console.log('\n=== With Population ===');
      const studentClassesWithPopulate = await StudentClass.find({}).populate('classId', 'name').limit(2);
      
      if (studentClassesWithPopulate.length > 0) {
        studentClassesWithPopulate.forEach((sc, index) => {
          console.log(`\nStudentClass ${index + 1}:`);
          console.log(`  studentId: ${sc.studentId}`);
          console.log(`  classId:`, sc.classId);
          console.log(`  typeof classId: ${typeof sc.classId}`);
          if (sc.classId && sc.classId._id) {
            console.log(`  classId._id: ${sc.classId._id}`);
            console.log(`  classId._id.toString(): ${sc.classId._id.toString()}`);
          }
        });
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