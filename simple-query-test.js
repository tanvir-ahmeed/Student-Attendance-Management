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
    
    try {
      // Query StudentClass documents WITHOUT any populate calls
      console.log('\n=== Querying StudentClass without populate ===');
      const studentClasses = await StudentClass.find({}).limit(2);
      
      studentClasses.forEach((sc, index) => {
        console.log(`\nStudentClass ${index + 1}:`);
        console.log(`  _id: ${sc._id}`);
        console.log(`  studentId: ${sc.studentId}`);
        console.log(`  classId:`, sc.classId);
        console.log(`  typeof classId: ${typeof sc.classId}`);
        console.log(`  classId.constructor.name: ${sc.classId.constructor.name}`);
        
        // Check if it has _id property
        if (sc.classId && typeof sc.classId === 'object') {
          console.log(`  classId has _id:`, sc.classId._id !== undefined);
          if (sc.classId._id) {
            console.log(`  classId._id: ${sc.classId._id}`);
          }
        }
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