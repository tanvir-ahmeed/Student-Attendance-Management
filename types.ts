
export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    classId: string;
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
