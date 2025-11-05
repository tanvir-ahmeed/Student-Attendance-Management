import mongoose, { Document, Schema } from 'mongoose';
import StudentClass from './StudentClass';

export interface IClass extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTeacher?: mongoose.Types.ObjectId; // Reference to the assigned teacher
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
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

export default mongoose.model<IClass>('Class', ClassSchema);
