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

// Import routes
console.log('Attempting to load routes...');
try {
  console.log('Loading auth routes...');
  const authRoutes = require('./dist/routes/auth');
  console.log('Loading class routes...');
  const classRoutes = require('./dist/routes/classes');
  console.log('Loading student routes...');
  const studentRoutes = require('./dist/routes/students');
  console.log('Loading attendance routes...');
  const attendanceRoutes = require('./dist/routes/attendance');

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
