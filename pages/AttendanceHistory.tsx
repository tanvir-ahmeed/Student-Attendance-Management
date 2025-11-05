
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';

const AttendanceHistoryPage: React.FC = () => {
    const { attendance, students, classes } = useData();
    const [filterClassId, setFilterClassId] = useState<string>('');
    const [filterStudentId, setFilterStudentId] = useState<string>('');

    const filteredAttendance = useMemo(() => {
        return attendance
            .filter(record => !filterClassId || record.classId === filterClassId)
            .filter(record => !filterStudentId || record.studentId === filterStudentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, filterClassId, filterStudentId]);

    const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';
    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'Unknown';
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance History</h1>

             <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Class</label>
                        <select
                            value={filterClassId}
                            onChange={(e) => setFilterClassId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filter by Student</label>
                        <select
                            value={filterStudentId}
                            onChange={(e) => setFilterStudentId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All Students</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAttendance.map(record => (
                            <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentName(record.studentId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClassName(record.classId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAttendance.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No attendance records found for the selected filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistoryPage;
