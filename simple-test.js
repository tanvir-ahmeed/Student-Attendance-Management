const mongoose = require('mongoose');
const Class = require('./dist/models/Class').default;
const StudentClass = require('./dist/models/StudentClass').default;
const Attendance = require('./dist/models/Attendance').default;

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/attendance_system');
    console.log('Connected to MongoDB');

    const classes = await Class.find();
    const classId = classes[0]._id.toString();
    console.log('Testing with class ID:', classId);

    const date = '2025-01-01';
    console.log(
      'Testing attendance summary for classId:',
      classId,
      'date:',
      date
    );

    const studentClasses = await StudentClass.find({ classId });
    console.log('Student classes found:', studentClasses.length);

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const endDate = new Date(
      attendanceDate.getTime() + 24 * 60 * 60 * 1000 - 1
    );

    const attendanceRecords = await Attendance.find({
      classId,
      date: {
        $gte: attendanceDate,
        $lte: endDate,
      },
    });

    console.log('Attendance records found:', attendanceRecords.length);

    let present = 0;
    attendanceRecords.forEach(record => {
      if (record.status === 'present') present++;
    });

    const total = studentClasses.length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const result = {
      classId,
      date,
      total,
      present,
      absent,
      percentage,
    };

    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

test();
