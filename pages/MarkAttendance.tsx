import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import { getAttendanceSummary } from '../utils/api';

type AttendanceStatus = 'Present' | 'Absent';

const MarkAttendancePage: React.FC = () => {
  const {
    classes,
    students,
    saveAttendance,
    fetchClasses,
    fetchStudents,
    loading,
    error,
    token,
    user,
  } = useData();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Map<string, AttendanceStatus>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Filter classes based on user role
  const availableClasses =
    user?.role === 'teacher'
      ? classes.filter(c => user.assignedClasses?.includes(c.id))
      : classes;

  // Filter students based on selected class
  const studentsInClass = students.filter(s => 
    s.classIds?.includes(selectedClassId)
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    } else {
      // Clear students if no class selected
      // This would be handled by the context provider
    }
  }, [selectedClassId, fetchStudents]);

  // Load attendance data when class and date change
  useEffect(() => {
    if (selectedClassId && selectedDate && token) {
      loadAttendanceData();
    } else {
      setAttendanceMap(new Map());
    }
  }, [selectedClassId, selectedDate, token]);

  const loadAttendanceData = async () => {
    if (!token) return;

    try {
      const summary = await getAttendanceSummary(
        token,
        selectedClassId,
        selectedDate
      );
      const newMap = new Map<string, AttendanceStatus>();

      summary.forEach(item => {
        newMap.set(
          item.studentId,
          item.status === 'present' ? 'Present' : 'Absent'
        );
      });

      // For students not in the summary, default to Absent
      studentsInClass.forEach(student => {
        if (!newMap.has(student.id)) {
          newMap.set(student.id, 'Absent');
        }
      });

      setAttendanceMap(newMap);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      // Default to all absent if failed to load
      const newMap = new Map<string, AttendanceStatus>();
      studentsInClass.forEach(student => {
        newMap.set(student.id, 'Absent');
      });
      setAttendanceMap(newMap);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(new Map(attendanceMap.set(studentId, status)));
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      alert('Please select a class');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const recordsToSave = Array.from(attendanceMap.entries()).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      await saveAttendance(selectedClassId, selectedDate, recordsToSave);
      alert('Attendance saved successfully!');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const markAll = (status: AttendanceStatus) => {
    const newMap = new Map<string, AttendanceStatus>();
    studentsInClass.forEach(student => newMap.set(student.id, status));
    setAttendanceMap(newMap);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading classes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">Error: {error}</div>
      </div>
    );
  }

  // Check if teacher has assigned classes
  if (user?.role === 'teacher' && availableClasses.length === 0) {
    return (
      <div className="page-transition bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">
            No Classes Assigned
          </h3>
          <p className="mt-2 text-gray-500">
            You have not been assigned any classes yet. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 page-transition">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mark Attendance</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select a class --</option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {selectedClassId && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Students in {availableClasses.find(c => c.id === selectedClassId)?.name}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => markAll('Present')}
                disabled={studentsInClass.length === 0}
              >
                Mark All Present
              </Button>
              <Button
                variant="secondary"
                onClick={() => markAll('Absent')}
                disabled={studentsInClass.length === 0}
              >
                Mark All Absent
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roll Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsInClass.length > 0 ? (
                  studentsInClass.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio"
                              name={`status-${student.id}`}
                              checked={attendanceMap.get(student.id) === 'Present'}
                              onChange={() => handleStatusChange(student.id, 'Present')}
                            />
                            <span className="ml-2">Present</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio"
                              name={`status-${student.id}`}
                              checked={attendanceMap.get(student.id) === 'Absent'}
                              onChange={() => handleStatusChange(student.id, 'Absent')}
                            />
                            <span className="ml-2">Absent</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No students found in this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={isSaving || studentsInClass.length === 0}
              className="w-full md:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </Button>
            {saveError && (
              <div className="mt-2 text-sm text-red-600">{saveError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;