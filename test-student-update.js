const mongoose = require('mongoose');
const Student = require('./models/Student');
const StudentClass = require('./models/StudentClass');
const Class = require('./models/Class');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    try {
      // Get all students to see current state
      console.log('\n=== Current Students ===');
      const students = await Student.find();
      students.forEach(student => {
        console.log(`Student: ${student.name} (${student._id})`);
      });
      
      if (students.length > 0) {
        const studentId = students[0]._id;
        console.log(`\nUpdating student ${studentId}`);
        
        // Get all classes
        const classes = await Class.find();
        console.log('\n=== Available Classes ===');
        classes.forEach(cls => {
          console.log(`Class: ${cls.name} (${cls._id})`);
        });
        
        if (classes.length >= 2) {
          // Try to update student with multiple classes
          const classIds = [classes[0]._id, classes[1]._id];
          console.log(`\nUpdating student with classIds:`, classIds);
          
          // Update student
          const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { name: students[0].name, rollNumber: students[0].rollNumber, email: students[0].email },
            { new: true }
          );
          
          if (updatedStudent) {
            console.log('\nStudent updated successfully');
            
            // Remove existing StudentClass associations
            await StudentClass.deleteMany({ studentId: studentId });
            console.log('Removed existing StudentClass associations');
            
            // Create new StudentClass associations
            const studentClassPromises = classIds.map(classId =>
              new StudentClass({ studentId: studentId, classId }).save()
            );
            
            await Promise.all(studentClassPromises);
            console.log('Created new StudentClass associations');
            
            // Check what's in the database
            const studentClasses = await StudentClass.find({ studentId: studentId });
            console.log('\n=== StudentClass associations in DB ===');
            studentClasses.forEach((sc, index) => {
              console.log(`StudentClass ${index + 1}:`);
              console.log(`  studentId: ${sc.studentId}`);
              console.log(`  classId: ${sc.classId}`);
              console.log(`  typeof classId: ${typeof sc.classId}`);
            });
            
            // Get the student with class associations
            const studentClassesForStudent = await StudentClass.find({ studentId: studentId });
            const populatedStudent = updatedStudent.toObject();
            populatedStudent.classIds = studentClassesForStudent.map(sc => sc.classId.toString());
            
            console.log('\n=== Final Student Object ===');
            console.log('Student name:', populatedStudent.name);
            console.log('Student classIds:', populatedStudent.classIds);
            console.log('typeof classIds[0]:', typeof populatedStudent.classIds[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });