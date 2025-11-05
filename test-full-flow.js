const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models/Student');
const Class = require('./models/Class');
const StudentClass = require('./models/StudentClass');
const Attendance = require('./models/Attendance');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_system'
    );
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Test full flow
const testFullFlow = async () => {
  try {
    // Create test classes
    const mathClass = new Class({
      name: 'Mathematics',
      createdBy: new mongoose.Types.ObjectId(),
    });
    await mathClass.save();

    const scienceClass = new Class({
      name: 'Science',
      createdBy: new mongoose.Types.ObjectId(),
    });
    await scienceClass.save();

    console.log('Created classes:', mathClass.name, scienceClass.name);

    // Create test student
    const student1 = new Student({
      name: 'John Doe',
      rollNumber: 'STU001',
      email: 'john.doe@example.com',
    });
    await student1.save();

    const student2 = new Student({
      name: 'Jane Smith',
      rollNumber: 'STU002',
      email: 'jane.smith@example.com',
    });
    await student2.save();

    console.log('Created students:', student1.name, student2.name);

    // Create StudentClass associations
    // John is in both Math and Science
    const johnMath = new StudentClass({
      studentId: student1._id,
      classId: mathClass._id,
    });
    await johnMath.save();

    const johnScience = new StudentClass({
      studentId: student1._id,
      classId: scienceClass._id,
    });
    await johnScience.save();

    // Jane is only in Math
    const janeMath = new StudentClass({
      studentId: student2._id,
      classId: mathClass._id,
    });
    await janeMath.save();

    console.log('Created StudentClass associations');

    // Test getting students in Math class
    const mathStudents = await mathClass.getStudents();
    console.log(`Students in ${mathClass.name}:`);
    mathStudents.forEach(student => {
      console.log(`- ${student.name} (${student.rollNumber})`);
    });

    // Test getting classes for John
    const johnClasses = await StudentClass.find({
      studentId: student1._id,
    }).populate('classId', 'name');
    console.log(`Classes for ${student1.name}:`);
    johnClasses.forEach(sc => {
      console.log(`- ${sc.classId.name}`);
    });

    // Test attendance recording
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // John is present in Math class today
    const johnAttendance = new Attendance({
      classId: mathClass._id,
      studentId: student1._id,
      date: today,
      status: 'present',
    });
    await johnAttendance.save();

    // Jane is absent in Math class today
    const janeAttendance = new Attendance({
      classId: mathClass._id,
      studentId: student2._id,
      date: today,
      status: 'absent',
    });
    await janeAttendance.save();

    console.log('Recorded attendance for today');

    // Test getting attendance records for Math class today
    const mathAttendance = await Attendance.find({
      classId: mathClass._id,
      date: today,
    }).populate('studentId', 'name');

    console.log(
      `Attendance for ${mathClass.name} on ${
        today.toISOString().split('T')[0]
      }:`
    );
    mathAttendance.forEach(record => {
      console.log(`- ${record.studentId.name}: ${record.status}`);
    });

    // Clean up test data
    await Attendance.deleteMany({
      classId: { $in: [mathClass._id, scienceClass._id] },
    });

    await StudentClass.deleteMany({
      $or: [
        { studentId: student1._id },
        { studentId: student2._id },
        { classId: mathClass._id },
        { classId: scienceClass._id },
      ],
    });

    await Student.deleteMany({
      _id: { $in: [student1._id, student2._id] },
    });

    await Class.deleteMany({
      _id: { $in: [mathClass._id, scienceClass._id] },
    });

    console.log('Test data cleaned up');
    console.log('Full flow test completed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testFullFlow();
  mongoose.connection.close();
};

runTest();
