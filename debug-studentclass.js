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
      // Get a student class association and see what it looks like
      const studentClasses = await StudentClass.find({}).populate('classId', 'name').limit(1);
      
      if (studentClasses.length > 0) {
        const sc = studentClasses[0];
        console.log('StudentClass object:');
        console.log(JSON.stringify(sc, null, 2));
        
        console.log('\nsc.classId:');
        console.log(JSON.stringify(sc.classId, null, 2));
        
        console.log('\nsc.classId._id:');
        console.log(sc.classId._id);
        
        console.log('\nsc.classId._id.toString():');
        console.log(sc.classId._id.toString());
        
        console.log('\ntypeof sc.classId._id:');
        console.log(typeof sc.classId._id);
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