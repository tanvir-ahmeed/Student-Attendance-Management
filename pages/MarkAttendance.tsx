
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';

type AttendanceStatus = 'Present' | 'Absent';

const MarkAttendancePage: React.FC = () => {
    const { classes, students, attendance, saveAttendance } = useData();
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());

    const studentsInClass = students.filter(s => s.classId === selectedClassId);

    useEffect(() => {
        if (selectedClassId && selectedDate) {
            const existingRecords = attendance.filter(r => r.classId === selectedClassId && r.date === selectedDate);
            const newMap = new Map<string, AttendanceStatus>();
            studentsInClass.forEach(student => {
                const record = existingRecords.find(r => r.studentId === student.id);
                newMap.set(student.id, record ? record.status : 'Absent');
            });
            setAttendanceMap(newMap);
        } else {
            setAttendanceMap(new Map());
        }
    }, [selectedClassId, selectedDate, studentsInClass, attendance]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceMap(new Map(attendanceMap.set(studentId, status)));
    };

    const handleSave = () => {
        const recordsToSave = Array.from(attendanceMap.entries()).map(([studentId, status]) => ({
            date: selectedDate,
            classId: selectedClassId,
            studentId,
            status,
        }));
        saveAttendance(recordsToSave);
        console.log("Attendance Saved:", recordsToSave);
        alert('Attendance saved successfully!');
    };
    
    const markAll = (status: AttendanceStatus) => {
        const newMap = new Map<string, AttendanceStatus>();
        studentsInClass.forEach(student => newMap.set(student.id, status));
        setAttendanceMap(newMap);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mark Attendance</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Class</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Select a class --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {selectedClassId && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-4 border-b flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => markAll('Present')}>Mark All Present</Button>
                        <Button variant="secondary" size="sm" onClick={() => markAll('Absent')}>Mark All Absent</Button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {studentsInClass.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleStatusChange(student.id, 'Absent')} className={`px-3 py-1 text-sm rounded-full ${attendanceMap.get(student.id) === 'Absent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                Absent
                                            </button>
                                            <button onClick={() => handleStatusChange(student.id, 'Present')} className={`px-3 py-1 text-sm rounded-full ${attendanceMap.get(student.id) === 'Present' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                Present
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="p-4 bg-gray-50 text-right sticky bottom-0">
                        <Button onClick={handleSave} disabled={studentsInClass.length === 0}>Save Attendance</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkAttendancePage;
