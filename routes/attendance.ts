import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import Attendance from '../models/Attendance';
import Class from '../models/Class';
import Student from '../models/Student';
import StudentClass from '../models/StudentClass';

const router = express.Router();

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
router.get('/', async (req: Request, res: Response) => {
  try {
    const { classId, studentId, date } = req.query;

    // Build filter object
    const filter: any = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (date) filter.date = new Date(date as string);

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('studentId', 'name rollNumber');

    res.json(attendance);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add attendance record
// @route   POST /api/attendance
// @access  Private
router.post('/', async (req: Request, res: Response) => {
  try {
    const { classId, studentId, date, status } = req.body;

    // Validation
    if (!classId || !studentId || !date || !status) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Check if student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(400).json({ message: 'Student not found' });
    }

    // Check if student is assigned to this class
    const studentClassExists = await StudentClass.findOne({ studentId, classId });
    if (!studentClassExists) {
      return res
        .status(400)
        .json({ message: 'Student is not assigned to this class' });
    }

    // Check if attendance record already exists
    const existingRecord = await Attendance.findOne({
      classId,
      studentId,
      date: new Date(date),
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: 'Attendance record already exists for this student' });
    }

    // Create attendance record
    const attendance = new Attendance({
      classId,
      studentId,
      date: new Date(date),
      status,
    });

    const savedAttendance = await attendance.save();

    // Populate references
    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate('classId', 'name')
      .populate('studentId', 'name rollNumber');

    res.status(201).json(populatedAttendance);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Populate references separately
    if (attendance) {
      await attendance.populate('classId', 'name');
      await attendance.populate('studentId', 'name rollNumber');
    }

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
// @access  Private
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { classId, startDate, endDate } = req.query;

    // Build match object for aggregation
    const match: any = {};
    if (classId) match.classId = new Types.ObjectId(classId as string);
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate as string);
      if (endDate) match.date.$lte = new Date(endDate as string);
    }

    const summary = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            classId: '$classId',
            studentId: '$studentId',
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          classId: '$_id.classId',
          studentId: '$_id.studentId',
          totalDays: 1,
          presentDays: 1,
          absentDays: { $subtract: ['$totalDays', '$presentDays'] },
          attendancePercentage: {
            $multiply: [
              {
                $divide: [
                  '$presentDays',
                  { $cond: [{ $eq: ['$totalDays', 0] }, 1, '$totalDays'] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $project: {
          classId: 1,
          className: { $arrayElemAt: ['$classInfo.name', 0] },
          studentId: 1,
          studentName: { $arrayElemAt: ['$studentInfo.name', 0] },
          studentRollNumber: { $arrayElemAt: ['$studentInfo.rollNumber', 0] },
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
        },
      },
    ]);

    res.json(summary);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get class attendance report
// @route   GET /api/attendance/report/:classId
// @access  Private
router.get('/report/:classId', async (req: Request, res: Response) => {
  try {
    const classId = req.params.classId;
    const { date } = req.query;

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all students in the class using StudentClass
    const studentClasses = await StudentClass.find({ classId }).populate('studentId');
    const students = studentClasses.map(sc => sc.studentId);

    if (students.length === 0) {
      return res.json([]);
    }

    // Get attendance records for the date
    const attendanceDate = date ? new Date(date as string) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      classId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Create a map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const studentId = (record.studentId as any)._id || record.studentId;
      attendanceMap.set(studentId.toString(), record.status);
    });

    // Build report
    const report = students.map(student => ({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      status: attendanceMap.get((student._id as any).toString()) || 'absent',
    }));

    res.json(report);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;