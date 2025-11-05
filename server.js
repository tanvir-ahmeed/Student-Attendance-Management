const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with specific CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3011',
      'http://localhost:3023',
      'http://192.168.31.234:3023',
    ], // Allow requests from the frontend
    credentials: true,
  })
);
app.use(express.json());

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// DIRECT ROUTE IMPLEMENTATION - Bypassing the mounting issue
const Attendance = require('./dist/models/Attendance').default;
const Class = require('./dist/models/Class').default;
const StudentClass = require('./dist/models/StudentClass').default;

app.get('/api/attendance/summary/:classId/:date', async (req, res) => {
  console.log(
    'Direct attendance summary route called with params:',
    req.params
  );
  try {
    const { classId, date } = req.params;

    // Validate class exists
    const classExists = await Class.findById(classId);
    console.log('Class exists:', !!classExists);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Validate date format
    const attendanceDate = new Date(date);
    console.log('Attendance date:', attendanceDate);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Set date to start of day
    attendanceDate.setHours(0, 0, 0, 0);

    // Get all students in the class using StudentClass
    const studentClasses = await StudentClass.find({ classId });
    console.log('Student classes found:', studentClasses.length);

    if (studentClasses.length === 0) {
      // Return empty summary if no students in class
      console.log('No students in class, returning empty summary');
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
    console.log('Attendance records found:', attendanceRecords.length);

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
    const result = {
      classId,
      date,
      total,
      present,
      absent,
      percentage,
    };
    console.log('Returning result:', result);
    res.json(result);
  } catch (err) {
    console.error('Error in direct attendance summary route:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import routes
console.log('Attempting to load routes...');
try {
  console.log('Loading auth routes...');
  const authRoutes = require('./dist/routes/auth').default;
  console.log('Loading class routes...');
  const classRoutes = require('./dist/routes/classes').default;
  console.log('Loading student routes...');
  const studentRoutes = require('./dist/routes/students').default;
  console.log('Loading attendance routes...');
  const attendanceRoutes = require('./dist/routes/attendance').default;

  app.use('/api/auth', authRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/attendance', attendanceRoutes);
  console.log('Route files loaded successfully');
} catch (err) {
  console.log('Warning: Could not load route files.');
  console.log(err.message);
  console.log(err.stack);
}

// Add route logging middleware for /api/attendance
app.use('/api/attendance', (req, res, next) => {
  console.log(`[ATTENDANCE] ${req.method} ${req.originalUrl}`);
  next();
});

// Add specific logging for summary routes
app.use('/api/attendance/summary', (req, res, next) => {
  console.log(`[ATTENDANCE SUMMARY] ${req.method} ${req.originalUrl}`);
  next();
});

// Flag to check if MongoDB is connected
let isMongoDBConnected = false;

// Try to connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log(
  'Using connection string:',
  process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system'
);

mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system'
  )
  .then(() => {
    console.log('MongoDB connected successfully');
    isMongoDBConnected = true;

    // Start the server only after MongoDB is connected
    startServer();
  })
  .catch(err => {
    console.log('MongoDB connection failed:', err.message);
    console.log('Error code:', err.code);
    console.log('\n=== MongoDB SETUP INSTRUCTIONS ===');
    console.log('To use MongoDB instead of mock data:');
    console.log(
      '1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community'
    );
    console.log('2. Install MongoDB with default settings');
    console.log('3. Start the MongoDB service');
    console.log('4. Restart this server');
    console.log('====================================\n');
    console.log('Server will start but data will not be persisted...');

    // Start the server even if MongoDB is not connected (for development)
    startServer();
  });

// Add a health check endpoint to see database status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isMongoDBConnected ? 'MongoDB' : 'Not Connected',
    timestamp: new Date().toISOString(),
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    database: isMongoDBConnected ? 'MongoDB' : 'Not Connected',
  });
});

// Function to start the server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `Database status: ${
        isMongoDBConnected ? 'Connected to MongoDB' : 'Not Connected'
      }`
    );
  });
};
