const mongoose = require('mongoose');
const StudentClass = require('./StudentClass');

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to get all students in this class
ClassSchema.methods.getStudents = async function () {
  const studentClasses = await StudentClass.find({
    classId: this._id,
  }).populate('studentId');
  return studentClasses.map(sc => sc.studentId);
};

module.exports = mongoose.model('Class', ClassSchema);
