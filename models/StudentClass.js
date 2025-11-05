const mongoose = require('mongoose');

const StudentClassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to prevent duplicate student-class associations
StudentClassSchema.index({ studentId: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('StudentClass', StudentClassSchema);