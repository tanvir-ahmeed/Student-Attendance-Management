const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models/Student');
const Class = require('./models/Class');
const StudentClass = require('./models/StudentClass');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_system');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Test many-to-many relationship
const testManyToMany = async () => {
  try {
    // Create test classes
    const class1 = new Class({ 
      name: 'Mathematics',
      createdBy: new mongoose.Types.ObjectId()
    });
    await class1.save();
    
    const class2 = new Class({ 
      name: 'Science',
      createdBy: new mongoose.Types.ObjectId()
    });
    await class2.save();
    
    console.log('Created classes:', class1.name, class2.name);
    
    // Create test student
    const student = new Student({
      name: 'John Doe',
      rollNumber: 'STU001',
      email: 'john.doe@example.com'
    });
    await student.save();
    
    console.log('Created student:', student.name);
    
    // Create StudentClass associations
    const studentClass1 = new StudentClass({
      studentId: student._id,
      classId: class1._id
    });
    await studentClass1.save();
    
    const studentClass2 = new StudentClass({
      studentId: student._id,
      classId: class2._id
    });
    await studentClass2.save();
    
    console.log('Created StudentClass associations');
    
    // Test queries
    // Get all classes for a student
    const studentClasses = await StudentClass.find({ studentId: student._id })
      .populate('classId', 'name');
    
    console.log('Student classes:');
    studentClasses.forEach(sc => {
      console.log(`- ${sc.classId.name}`);
    });
    
    // Get all students in a class
    const classStudents = await StudentClass.find({ classId: class1._id })
      .populate('studentId', 'name rollNumber');
    
    console.log(`Students in ${class1.name}:`);
    classStudents.forEach(cs => {
      console.log(`- ${cs.studentId.name} (${cs.studentId.rollNumber})`);
    });
    
    // Clean up test data
    await StudentClass.deleteMany({
      $or: [
        { studentId: student._id },
        { classId: class1._id },
        { classId: class2._id }
      ]
    });
    await Student.deleteOne({ _id: student._id });
    await Class.deleteMany({ _id: { $in: [class1._id, class2._id] } });
    
    console.log('Test data cleaned up');
  } catch (err) {
    console.error('Test error:', err);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testManyToMany();
  mongoose.connection.close();
};

runTest();