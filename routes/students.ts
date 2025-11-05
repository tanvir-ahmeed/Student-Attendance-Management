import express, { Request, Response } from 'express';
import Student from '../models/Student';
import Class from '../models/Class';
import auth from '../middleware/auth';
import authorizeRoles from '../middleware/role';

const router = express.Router();

// @desc    Get all students (with optional class filter)
// @route   GET /api/students
// @access  Private (Admin/Teacher only)
router.get('/', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    let filter: any = {};
    
    if (classId) {
      filter.classId = classId;
    }
    
    const students = await Student.find(filter).populate('classId', 'name');
    res.json(students);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Private (Admin/Teacher only)
router.get('/class/:classId', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ classId: req.params.classId });
    res.json(students);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a student
// @route   POST /api/students
// @access  Private (Admin/Teacher only)
router.post('/', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId, name, rollNumber, email } = req.body;
    
    // Validation
    if (!classId || !name || !rollNumber || !email) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }
    
    // Check if roll number already exists in this class
    const existingStudent = await Student.findOne({ classId, rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already exists in this class' });
    }
    
    // Create student
    const student = new Student({
      classId,
      name,
      rollNumber,
      email
    });
    
    const createdStudent = await student.save();
    
    // Populate classId field
    await createdStudent.populate('classId', 'name');
    
    res.status(201).json(createdStudent);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin/Teacher only)
router.put('/:id', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { classId, name, rollNumber, email } = req.body;
    
    // Validation
    if (!classId || !name || !rollNumber || !email) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { classId, name, rollNumber, email },
      { new: true }
    ).populate('classId', 'name');
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin/Teacher only)
router.delete('/:id', auth, authorizeRoles('admin'), async (req: Request, res: Response) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;