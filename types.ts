export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  classId: string; // For backward compatibility
  classIds?: string[]; // For many-to-many relationship
}

export interface Class {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  status: 'Present' | 'Absent';
}

// API Response Types
export interface ApiStudent {
  _id: string;
  classIds?: string[]; // Updated to support many-to-many
  name: string;
  rollNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiClass {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAttendanceRecord {
  _id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: string;
  updatedAt: string;
}