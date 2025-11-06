import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'teacher' | 'student';
  assignedClasses?: mongoose.Types.ObjectId[]; // For teachers to have assigned classes
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
