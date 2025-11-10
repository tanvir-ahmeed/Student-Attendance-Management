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
      // Display all student-class associations with more details
      console.log('\n=== Student-Class Associations (Detailed) ===');
      const associations = await StudentClass.find({});
      console.log(`Found ${associations.length} associations:`);
      
      for (let i = 0; i < associations.length; i++) {
        const assoc = associations[i];
        console.log(`\nAssociation ${i + 1}:`);
        console.log(`  Student ID: ${assoc.studentId}`);
        console.log(`  Class ID: ${assoc.classId}`);
        console.log(`  Created At: ${assoc.createdAt}`);
        console.log(`  Updated At: ${assoc.updatedAt}`);
        
        // Try to populate the references
        try {
          const student = await Student.findById(assoc.studentId);
          const cls = await Class.findById(assoc.classId);
          console.log(`  Student Name: ${student ? student.name : 'NOT FOUND'}`);
          console.log(`  Class Name: ${cls ? cls.name : 'NOT FOUND'}`);
        } catch (populateErr) {
          console.log(`  Populate Error: ${populateErr.message}`);
        }
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