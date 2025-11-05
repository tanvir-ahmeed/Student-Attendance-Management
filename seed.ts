import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Class from './models/Class';
import Student from './models/Student';
import Attendance from './models/Attendance';
import connectDB from './db';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Existing data cleared');

    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'admin',
    });

    console.log('Admin user created:', admin.email);

    // Create classes
    const mathClass = await Class.create({
      name: 'Mathematics 101',
      createdBy: admin._id,
    });

    const historyClass = await Class.create({
      name: 'History of Art',
      createdBy: admin._id,
    });

    const physicsClass = await Class.create({
      name: 'Physics for Beginners',
      createdBy: admin._id,
    });

    console.log('Classes created');

    // Create students
    const students = await Student.insertMany([
      {
        classId: mathClass._id,
        name: 'John Doe',
        rollNumber: '001',
        email: 'john.doe@example.com',
      },
      {
        classId: mathClass._id,
        name: 'Jane Smith',
        rollNumber: '002',
        email: 'jane.smith@example.com',
      },
      {
        classId: mathClass._id,
        name: 'Mary Johnson',
        rollNumber: '004',
        email: 'mary.j@example.com',
      },
      {
        classId: historyClass._id,
        name: 'Peter Jones',
        rollNumber: '003',
        email: 'peter.jones@example.com',
      },
      {
        classId: historyClass._id,
        name: 'Susan Brown',
        rollNumber: '006',
        email: 'susan.b@example.com',
      },
      {
        classId: physicsClass._id,
        name: 'David Williams',
        rollNumber: '005',
        email: 'david.w@example.com',
      },
    ]);

    console.log('Students created:', students.length);

    // Create some attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const attendanceRecords = [];

    // Today's attendance for Math class
    attendanceRecords.push(
      {
        classId: mathClass._id,
        studentId: students[0]._id, // John Doe
        date: today,
        status: 'present',
      },
      {
        classId: mathClass._id,
        studentId: students[1]._id, // Jane Smith
        date: today,
        status: 'absent',
      },
      {
        classId: mathClass._id,
        studentId: students[2]._id, // Mary Johnson
        date: today,
        status: 'present',
      }
    );

    // Yesterday's attendance for History class
    attendanceRecords.push(
      {
        classId: historyClass._id,
        studentId: students[3]._id, // Peter Jones
        date: yesterday,
        status: 'present',
      },
      {
        classId: historyClass._id,
        studentId: students[4]._id, // Susan Brown
        date: yesterday,
        status: 'absent',
      }
    );

    await Attendance.insertMany(attendanceRecords);

    console.log('Attendance records created:', attendanceRecords.length);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
