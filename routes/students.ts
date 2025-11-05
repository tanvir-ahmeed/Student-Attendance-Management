import express, { Request, Response } from 'express';
import Student from '../models/Student';
import Class from '../models/Class';
import StudentClass from '../models/StudentClass';
import auth from '../middleware/auth';
import authorizeRoles from '../middleware/role';

const router = express.Router();

// @desc    Get all students (with optional class filter)
// @route   GET /api/students
// @access  Private (Admin/Teacher only)
router.get(
  '/',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { classId } = req.query;

      if (classId) {
        // Get students for a specific class
        const studentClasses = await StudentClass.find({ classId }).populate(
          'studentId'
        );
        const students = studentClasses.map(sc => sc.studentId);
        res.json(students);
      } else {
        // Get all students
        const students = await Student.find();
        res.json(students);
      }
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Private (Admin/Teacher only)
router.get(
  '/class/:classId',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const studentClasses = await StudentClass.find({
        classId: req.params.classId,
      }).populate('studentId');
      const students = studentClasses.map(sc => sc.studentId);
      res.json(students);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Create a student
// @route   POST /api/students
// @access  Private (Admin/Teacher only)
router.post(
  '/',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { classIds, name, rollNumber, email } = req.body;

      // Validation
      if (
        !classIds ||
        !Array.isArray(classIds) ||
        classIds.length === 0 ||
        !name ||
        !rollNumber ||
        !email
      ) {
        return res.status(400).json({
          message:
            'Please provide all required fields: classIds (array), name, rollNumber, email',
        });
      }

      // Check if all classes exist
      for (const classId of classIds) {
        const classExists = await Class.findById(classId);
        if (!classExists) {
          return res
            .status(400)
            .json({ message: `Class with ID ${classId} not found` });
        }
      }

      // Check if roll number already exists in any of these classes
      for (const classId of classIds) {
        // First, find all students in this class
        const studentClasses = await StudentClass.find({ classId }).populate(
          'studentId'
        );
        const studentsInClass = studentClasses.map(sc => sc.studentId);

        // Check if any student in this class has the same roll number
        const existingStudent = studentsInClass.find(
          student => student.rollNumber === rollNumber
        );

        if (existingStudent) {
          return res.status(400).json({
            message: `Roll number already exists in class with ID ${classId}`,
          });
        }
      }

      // Create student
      const student = new Student({
        name,
        rollNumber,
        email,
      });

      const createdStudent = await student.save();

      // Create StudentClass associations
      const studentClassPromises = classIds.map(classId =>
        new StudentClass({ studentId: createdStudent._id, classId }).save()
      );

      await Promise.all(studentClassPromises);

      // Populate class information
      const studentClasses = await StudentClass.find({
        studentId: createdStudent._id,
      }).populate('classId', 'name');

      const populatedStudent: any = createdStudent.toObject();
      populatedStudent.classIds = studentClasses.map(sc => sc.classId);

      res.status(201).json(populatedStudent);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin/Teacher only)
router.put(
  '/:id',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { classIds, name, rollNumber, email } = req.body;

      // Validation
      if (
        !classIds ||
        !Array.isArray(classIds) ||
        classIds.length === 0 ||
        !name ||
        !rollNumber ||
        !email
      ) {
        return res.status(400).json({
          message:
            'Please provide all required fields: classIds (array), name, rollNumber, email',
        });
      }

      // Check if all classes exist
      for (const classId of classIds) {
        const classExists = await Class.findById(classId);
        if (!classExists) {
          return res
            .status(400)
            .json({ message: `Class with ID ${classId} not found` });
        }
      }

      // Update student
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        { name, rollNumber, email },
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Remove existing StudentClass associations
      await StudentClass.deleteMany({ studentId: req.params.id });

      // Create new StudentClass associations
      const studentClassPromises = classIds.map(classId =>
        new StudentClass({ studentId: req.params.id, classId }).save()
      );

      await Promise.all(studentClassPromises);

      // Populate class information
      const studentClasses = await StudentClass.find({
        studentId: req.params.id,
      }).populate('classId', 'name');

      const populatedStudent: any = updatedStudent.toObject();
      populatedStudent.classIds = studentClasses.map(sc => sc.classId);

      res.json(populatedStudent);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin/Teacher only)
router.delete(
  '/:id',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);

      if (!deletedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Remove StudentClass associations
      await StudentClass.deleteMany({ studentId: req.params.id });

      res.json({ message: 'Student removed' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
