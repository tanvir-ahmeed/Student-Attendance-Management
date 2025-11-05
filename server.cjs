import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system'
);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mongoose Models
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
  },
  { timestamps: true }
);

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const StudentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
  },
  { timestamps: true }
);

// Add compound index to prevent duplicate attendance records
AttendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Class = mongoose.model('Class', ClassSchema);
const Student = mongoose.model('Student', StudentSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);

// Middleware for authentication
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res
        .status(401)
        .json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'attendance_system_secret_key'
    );
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware for role authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (simple comparison for demo, in real app use bcrypt)
    if (user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'attendance_system_secret_key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Classes Routes
app.get('/api/classes', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const classes = await Class.find().populate('createdBy', 'name');
    res.json(classes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/classes', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Please provide class name' });
    }

    // Create class
    const newClass = new Class({
      name,
      createdBy: req.user.id,
    });

    const createdClass = await newClass.save();

    // Populate createdBy field
    await createdClass.populate('createdBy', 'name');

    res.status(201).json(createdClass);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Students Routes
app.get('/api/students', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { classId } = req.query;
    let filter = {};

    if (classId) {
      filter.classId = classId;
    }

    const students = await Student.find(filter).populate('classId', 'name');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get(
  '/api/students/class/:classId',
  auth,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const students = await Student.find({ classId: req.params.classId });
      res.json(students);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.post('/api/students', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { classId, name, rollNumber, email } = req.body;

    // Validation
    if (!classId || !name || !rollNumber || !email) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Create student
    const student = new Student({
      classId,
      name,
      rollNumber,
      email,
    });

    const createdStudent = await student.save();

    // Populate classId field
    await createdStudent.populate('classId', 'name');

    res.status(201).json(createdStudent);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Attendance Routes
app.get('/api/attendance', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { classId, studentId, date } = req.query;
    let filter = {};

    if (classId) {
      filter.classId = classId;
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    if (date) {
      // Assuming date is in YYYY-MM-DD format
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      filter.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('studentId', 'name rollNumber');

    res.json(attendanceRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/attendance', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    // Validation
    if (!classId || !date || !records || !Array.isArray(records)) {
      return res
        .status(400)
        .json({ message: 'Please provide classId, date, and records array' });
    }

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Process each attendance record
    const attendanceRecords = [];

    for (const record of records) {
      const { studentId, status } = record;

      // Validate student exists and belongs to the class
      const student = await Student.findOne({ _id: studentId, classId });
      if (!student) {
        return res
          .status(400)
          .json({ message: `Student ${studentId} not found in this class` });
      }

      // Create or update attendance record
      const attendanceRecord = await Attendance.findOneAndUpdate(
        { classId, studentId, date: new Date(date) },
        { status },
        { new: true, upsert: true }
      );

      attendanceRecords.push(attendanceRecord);
    }

    res.status(201).json(attendanceRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance summary for a specific class and date
app.get(
  '/api/attendance/summary/:classId/:date',
  auth,
  authorizeRoles('admin'),
  async (req, res) => {
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

      // Get all students in the class
      const students = await Student.find({ classId });

      if (students.length === 0) {
        return res.json([]);
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

      // Create a map for quick lookup
      const attendanceMap = new Map();
      attendanceRecords.forEach(record => {
        attendanceMap.set(record.studentId.toString(), record.status);
      });

      // Build summary
      const summary = students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        status: attendanceMap.get(student._id.toString()) || 'absent',
      }));

      res.json(summary);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
