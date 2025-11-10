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
    const User = require('./models/User');
    const Attendance = require('./models/Attendance');
    
    try {
      // Clear all collections
      console.log('Clearing all collections...');
      await Student.deleteMany({});
      await Class.deleteMany({});
      await StudentClass.deleteMany({});
      await User.deleteMany({});
      await Attendance.deleteMany({});
      
      console.log('All collections cleared successfully');
      
      // Close connection
      mongoose.connection.close();
    } catch (err) {
      console.error('Error clearing collections:', err);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });