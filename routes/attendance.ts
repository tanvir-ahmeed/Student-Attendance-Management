import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Student from '../models/Student';
import Class from '../models/Class';
import auth from '../middleware/auth';
import authorizeRoles from '../middleware/role';

const router = express.Router();

// @desc    Get attendance records (with optional filters)
// @route   GET /api/attendance
// @access  Private (Admin/Teacher only)
router.get('/', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId, studentId, date } = req.query;
    let filter: any = {};
    
    if (classId) {
      filter.classId = classId;
    }
    
    if (studentId) {
      filter.studentId = studentId;
    }
    
    if (date) {
      // Assuming date is in YYYY-MM-DD format
      const startOfDay = new Date(date as string);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      
      filter.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }
    
    const attendanceRecords = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('studentId', 'name rollNumber');
      
    res.json(attendanceRecords);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Mark attendance for students
// @route   POST /api/attendance
// @access  Private (Admin/Teacher only)
router.post('/', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId, date, records } = req.body;
    
    // Validation
    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Please provide classId, date, and records array' });
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
        return res.status(400).json({ message: `Student ${studentId} not found in this class` });
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
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get attendance summary for a class on a specific date
// @route   GET /api/attendance/summary/:classId/:date
// @access  Private (Admin/Teacher only)
router.get('/summary/:classId/:date', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId, date } = req.params;
    
    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }
    
    // Get all students in the class
    const students = await Student.find({ classId });
    const studentIds = students.map(student => student._id);
    
    // Get attendance records for the date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    
    const attendanceRecords = await Attendance.find({
      classId,
      studentId: { $in: studentIds },
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    // Create attendance map
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.studentId.toString(), record.status);
    });
    
    // Create summary
    const summary = students.map(student => ({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      status: attendanceMap.get(student._id.toString()) || 'absent'
    }));
    
    res.json(summary);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;