import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  rollNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
