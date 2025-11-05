const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system'
);

// Mongoose Models
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
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
  { timestamps: true }
);

// Add pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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
  { timestamps: true }
);

const StudentSchema = new mongoose.Schema(
  {
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
    ],
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
  },
  { timestamps: true }
);

// Add compound index to prevent duplicate attendance records
AttendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Class = mongoose.model('Class', ClassSchema);
const Student = mongoose.model('Student', StudentSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const StudentClass = mongoose.model('StudentClass', new mongoose.Schema({
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
}, { timestamps: true }));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Existing data cleared');

    // Create admin user (using plain text password for demo purposes)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      role: 'admin',
    });

    console.log('Admin user created:', admin.email);

    // Create teacher user (using plain text password for demo purposes)
    const teacher = await User.create({
      name: 'Teacher User',
      email: 'teacher@example.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      role: 'teacher',
      assignedClasses: [],
    });

    console.log('Teacher user created:', teacher.email);

    // Create classes (using the same data as in mockClasses)
    const mathClass = await Class.create({
      name: 'Mathematics 101',
      createdBy: admin._id,
    });

    const historyClass = await Class.create({
      name: 'History of Art',
      createdBy: admin._id,
    });

    const physicsClass = await Class.create({
      name: 'Physics for Beginners',
      createdBy: admin._id,
    });

    console.log('Classes created');

    // Assign classes to teacher
    teacher.assignedClasses = [mathClass._id, historyClass._id];
    await teacher.save();

    // Assign teacher to classes
    mathClass.assignedTeacher = teacher._id;
    historyClass.assignedTeacher = teacher._id;
    await mathClass.save();
    await historyClass.save();

    console.log('Classes assigned to teacher');

    // Create students (using the same data as in mockStudents)
    const students = await Student.insertMany([
      {
        classIds: [mathClass._id],
        name: 'John Doe',
        rollNumber: '001',
        email: 'john.doe@example.com',
      },
      {
        classIds: [mathClass._id],
        name: 'Jane Smith',
        rollNumber: '002',
        email: 'jane.smith@example.com',
      },
      {
        classIds: [historyClass._id],
        name: 'Peter Jones',
        rollNumber: '003',
        email: 'peter.jones@example.com',
      },
      {
        classIds: [mathClass._id],
        name: 'Mary Johnson',
        rollNumber: '004',
        email: 'mary.j@example.com',
      },
      {
        classIds: [physicsClass._id],
        name: 'David Williams',
        rollNumber: '005',
        email: 'david.w@example.com',
      },
      {
        classIds: [historyClass._id],
        name: 'Susan Brown',
        rollNumber: '006',
        email: 'susan.b@example.com',
      },
    ]);

    console.log('Students created:', students.length);

    // Create StudentClass associations
    const studentClassRecords = [];
    
    // John Doe and Jane Smith and Mary Johnson in Mathematics 101
    studentClassRecords.push(
      { studentId: students[0]._id, classId: mathClass._id }, // John Doe
      { studentId: students[1]._id, classId: mathClass._id }, // Jane Smith
      { studentId: students[3]._id, classId: mathClass._id }  // Mary Johnson
    );
    
    // Peter Jones and Susan Brown in History of Art
    studentClassRecords.push(
      { studentId: students[2]._id, classId: historyClass._id }, // Peter Jones
      { studentId: students[5]._id, classId: historyClass._id }  // Susan Brown
    );
    
    // David Williams in Physics for Beginners
    studentClassRecords.push(
      { studentId: students[4]._id, classId: physicsClass._id }  // David Williams
    );
    
    await StudentClass.insertMany(studentClassRecords);
    console.log('StudentClass associations created:', studentClassRecords.length);

    // Create attendance records (using the same data as in mockAttendance)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const attendanceRecords = [];

    // Add the existing mock attendance records
    attendanceRecords.push(
      {
        classId: mathClass._id,
        studentId: students[0]._id, // John Doe
        date: yesterday,
        status: 'present',
      },
      {
        classId: mathClass._id,
        studentId: students[1]._id, // Jane Smith
        date: yesterday,
        status: 'absent',
      }
    );

    // Add some additional attendance records to match the mock data structure
    attendanceRecords.push(
      {
        classId: mathClass._id,
        studentId: students[0]._id, // John Doe
        date: today,
        status: 'present',
      },
      {
        classId: mathClass._id,
        studentId: students[3]._id, // Mary Johnson
        date: today,
        status: 'present',
      },
      {
        classId: historyClass._id,
        studentId: students[2]._id, // Peter Jones
        date: today,
        status: 'absent',
      }
    );

    await Attendance.insertMany(attendanceRecords);

    console.log('Attendance records created:', attendanceRecords.length);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
