const express = require('express');
const mongoose = require('mongoose');
const Attendance = require('./dist/models/Attendance').default;
const Class = require('./dist/models/Class').default;
const StudentClass = require('./dist/models/StudentClass').default;

const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/attendance_system');

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Attendance summary route
app.get('/api/attendance/summary/:classId/:date', async (req, res) => {
  console.log('Attendance summary route called with params:', req.params);
  try {
    const { classId, date } = req.params;

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Validate date format
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Set date to start of day
    attendanceDate.setHours(0, 0, 0, 0);

    // Get all students in the class using StudentClass
    const studentClasses = await StudentClass.find({ classId });

    if (studentClasses.length === 0) {
      // Return empty summary if no students in class
      return res.json({
        classId,
        date,
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      });
    }

    // Get attendance records for the date
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

    // Count present and absent
    let present = 0;
    const attendanceMap = new Map();

    attendanceRecords.forEach(record => {
      const studentId = record.studentId._id || record.studentId;
      attendanceMap.set(studentId.toString(), record.status);
      if (record.status === 'present') {
        present++;
      }
    });

    const total = studentClasses.length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Return the summary in the required format
    res.json({
      classId,
      date,
      total,
      present,
      absent,
      percentage,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
