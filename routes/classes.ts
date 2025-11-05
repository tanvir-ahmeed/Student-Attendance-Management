import express, { Request, Response } from 'express';
import Class from '../models/Class';
import auth from '../middleware/auth';
import authorizeRoles from '../middleware/role';

const router = express.Router();

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin/Teacher only)
router.get(
  '/',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const classes = await Class.find().populate('createdBy', 'name');
      res.json(classes);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Create a class
// @route   POST /api/classes
// @access  Private (Admin/Teacher only)
router.post(
  '/',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
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
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Admin/Teacher only)
router.put(
  '/:id',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({ message: 'Please provide class name' });
      }

      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        { name },
        { new: true }
      );

      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json(updatedClass);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin/Teacher only)
router.delete(
  '/:id',
  auth,
  authorizeRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const deletedClass = await Class.findByIdAndDelete(req.params.id);

      if (!deletedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({ message: 'Class removed' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
