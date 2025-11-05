import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import PageLayout from '../components/layout/PageLayout';
import { getAttendanceSummary } from '../utils/api';
import { CheckSquareIcon, TrashIcon } from '../components/Icons';

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
  const [localLoading, setLocalLoading] = useState(false);

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

    setLocalLoading(true);
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
    } finally {
      setLocalLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(new Map(attendanceMap.set(studentId, status)));
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      setSaveError('Please select a class');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading classes...</p>
        </div>
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
      <PageLayout title="Mark Attendance" subtitle="Record student attendance">
        <div className="bg-white rounded-lg shadow p-6 text-center">
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
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Mark Attendance" subtitle="Record student attendance">
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
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">
              Students in{' '}
              {availableClasses.find(c => c.id === selectedClassId)?.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => markAll('Present')}
                disabled={studentsInClass.length === 0 || localLoading}
                size="sm"
              >
                Mark All Present
              </Button>
              <Button
                variant="secondary"
                onClick={() => markAll('Absent')}
                disabled={studentsInClass.length === 0 || localLoading}
                size="sm"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {localLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : studentsInClass.length > 0 ? (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Student Name</Table.HeaderCell>
                    <Table.HeaderCell>Roll Number</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {studentsInClass.map(student => (
                    <Table.Row key={student.id}>
                      <Table.Cell className="font-medium text-gray-900">
                        {student.name}
                      </Table.Cell>
                      <Table.Cell>{student.rollNumber}</Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-indigo-600"
                              name={`status-${student.id}`}
                              checked={
                                attendanceMap.get(student.id) === 'Present'
                              }
                              onChange={() =>
                                handleStatusChange(student.id, 'Present')
                              }
                            />
                            <span className="ml-2 flex items-center">
                              <CheckSquareIcon className="h-5 w-5 text-green-500 mr-1" />
                              Present
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-indigo-600"
                              name={`status-${student.id}`}
                              checked={
                                attendanceMap.get(student.id) === 'Absent'
                              }
                              onChange={() =>
                                handleStatusChange(student.id, 'Absent')
                              }
                            />
                            <span className="ml-2 flex items-center">
                              <TrashIcon className="h-5 w-5 text-red-500 mr-1" />
                              Absent
                            </span>
                          </label>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    {studentsInClass.length} students in this class
                  </div>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={isSaving || studentsInClass.length === 0}
                  >
                    Save Attendance
                  </Button>
                </div>
                {saveError && (
                  <div className="mt-2 text-sm text-red-600">{saveError}</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No students found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No students are assigned to this class.
              </p>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default MarkAttendancePage;
