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
      // Get all students and classes
      const students = await Student.find({});
      const classes = await Class.find({});
      
      console.log('Students:');
      students.forEach(s => console.log(`- ${s.name} (${s._id})`));
      
      console.log('\nClasses:');
      classes.forEach(c => console.log(`- ${c.name} (${c._id})`));
      
      if (students.length > 0 && classes.length >= 2) {
        const studentToUpdate = students[0]; // First student
        const classIds = [classes[0]._id, classes[1]._id]; // First two classes
        
        console.log(`\nUpdating student ${studentToUpdate.name} with classes:`);
        classIds.forEach(id => {
          const cls = classes.find(c => c._id.toString() === id.toString());
          console.log(`- ${cls.name}`);
        });
        
        // Remove existing StudentClass associations
        await StudentClass.deleteMany({ studentId: studentToUpdate._id });
        console.log('Removed existing associations');
        
        // Create new StudentClass associations
        const studentClassPromises = classIds.map(classId =>
          new StudentClass({ studentId: studentToUpdate._id, classId }).save()
        );
        
        await Promise.all(studentClassPromises);
        console.log('Created new associations');
        
        // Verify the associations
        const associations = await StudentClass.find({
          studentId: studentToUpdate._id
        }).populate('classId', 'name');
        
        console.log('\nUpdated associations:');
        associations.forEach(assoc => {
          console.log(`- ${assoc.classId.name}`);
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