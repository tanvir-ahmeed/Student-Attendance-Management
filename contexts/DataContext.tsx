
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Student, Class, AttendanceRecord } from '../types';

// Mock Data
const initialClasses: Class[] = [
    { id: 'c1', name: 'Mathematics 101' },
    { id: 'c2', name: 'History of Art' },
    { id: 'c3', name: 'Physics for Beginners' },
];

const initialStudents: Student[] = [
    { id: 's1', name: 'John Doe', rollNumber: '001', email: 'john.doe@example.com', classId: 'c1' },
    { id: 's2', name: 'Jane Smith', rollNumber: '002', email: 'jane.smith@example.com', classId: 'c1' },
    { id: 's3', name: 'Peter Jones', rollNumber: '003', email: 'peter.jones@example.com', classId: 'c2' },
    { id: 's4', name: 'Mary Johnson', rollNumber: '004', email: 'mary.j@example.com', classId: 'c1' },
    { id: 's5', name: 'David Williams', rollNumber: '005', email: 'david.w@example.com', classId: 'c3' },
    { id: 's6', name: 'Susan Brown', rollNumber: '006', email: 'susan.b@example.com', classId: 'c2' },
];

const initialAttendance: AttendanceRecord[] = [
    { id: 'a1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], classId: 'c1', studentId: 's1', status: 'Present' },
    { id: 'a2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], classId: 'c1', studentId: 's2', status: 'Absent' },
];


interface DataContextType {
    students: Student[];
    classes: Class[];
    attendance: AttendanceRecord[];
    addStudent: (student: Omit<Student, 'id'>) => void;
    addClass: (newClass: Omit<Class, 'id'>) => void;
    saveAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);

    const addStudent = useCallback((student: Omit<Student, 'id'>) => {
        setStudents(prev => [...prev, { ...student, id: `s${Date.now()}` }]);
    }, []);

    const addClass = useCallback((newClass: Omit<Class, 'id'>) => {
        setClasses(prev => [...prev, { ...newClass, id: `c${Date.now()}` }]);
    }, []);

    const saveAttendance = useCallback((records: Omit<AttendanceRecord, 'id'>[]) => {
        const newRecords = records.map(r => ({ ...r, id: `a${Date.now()}${Math.random()}` }));
        
        setAttendance(prev => {
            // Remove existing records for the same date and class to prevent duplicates
            const date = records[0]?.date;
            const classId = records[0]?.classId;
            const filteredPrev = prev.filter(r => !(r.date === date && r.classId === classId));
            return [...filteredPrev, ...newRecords];
        });
    }, []);

    return (
        <DataContext.Provider value={{ students, classes, attendance, addStudent, addClass, saveAttendance }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
