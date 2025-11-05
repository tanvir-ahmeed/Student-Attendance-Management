import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentClass extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentClassSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
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

export default mongoose.model<IStudentClass>('StudentClass', StudentClassSchema);