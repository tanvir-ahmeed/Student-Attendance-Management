import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import PageLayout from '../components/layout/PageLayout';
import Loading from '../components/ui/Loading';

const AttendanceHistoryPage: React.FC = () => {
  const {
    attendance,
    students,
    classes,
    fetchAttendance,
    fetchStudents,
    fetchClasses,
    loading,
    error,
  } = useData();
  const [filterClassId, setFilterClassId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [reportView, setReportView] = useState<'list' | 'summary'>('list');
  const [localError, setLocalError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching attendance history data');
    fetchAttendance()
      .then(() => console.log('Attendance fetched successfully'))
      .catch(err => {
        console.error('Error fetching attendance:', err);
        setLocalError('Failed to load attendance data');
      });
    fetchStudents()
      .then(() => console.log('Students fetched successfully'))
      .catch(err => {
        console.error('Error fetching students:', err);
        setLocalError('Failed to load students data');
      });
    fetchClasses()
      .then(() => console.log('Classes fetched successfully'))
      .catch(err => {
        console.error('Error fetching classes:', err);
        setLocalError('Failed to load classes data');
      });
  }, [fetchAttendance, fetchStudents, fetchClasses]);

  // Group attendance by date and class for summary view
  const attendanceSummary = useMemo(() => {
    if (reportView !== 'summary') return [];

    try {
      console.log('Generating attendance summary with data:', {
        attendanceCount: attendance.length,
        filterClassId,
        filterDate
      });

      const filtered = attendance.filter(record => {
        if (filterClassId && record.classId !== filterClassId) return false;
        if (filterDate && record.date !== filterDate) return false;
        return true;
      });

      console.log('Filtered attendance records:', filtered.length);

      // Group by date and class
      const grouped: Record<string, Record<string, { present: number; absent: number; total: number }>> = {};
      
      filtered.forEach(record => {
        // Ensure record has required properties
        if (!record.date || !record.classId) return;
        
        if (!grouped[record.date]) {
          grouped[record.date] = {};
        }
        
        if (!grouped[record.date][record.classId]) {
          grouped[record.date][record.classId] = { present: 0, absent: 0, total: 0 };
        }
        
        grouped[record.date][record.classId].total++;
        if (record.status === 'Present') {
          grouped[record.date][record.classId].present++;
        } else {
          grouped[record.date][record.classId].absent++;
        }
      });

      console.log('Grouped data:', grouped);

      // Convert to array format
      const result = Object.entries(grouped).map(([date, classesData]) => ({
        date,
        classes: Object.entries(classesData).map(([classId, stats]) => {
          const className = getClassName(classId);
          console.log(`Class lookup for ${classId}: ${className}`);
          return {
            classId,
            className,
            ...stats,
            percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
          };
        })
      }));

      console.log('Summary result:', result);
      return result;
    } catch (err) {
      console.error('Error generating attendance summary:', err);
      setLocalError('Failed to generate attendance summary: ' + (err as Error).message);
      return [];
    }
  }, [attendance, filterClassId, filterDate, reportView]);

  const filteredAttendance = useMemo(() => {
    return attendance
      .filter(record => {
        if (!record) return false;
        if (filterClassId && record.classId !== filterClassId) return false;
        if (filterDate && record.date !== filterDate) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [attendance, filterClassId, filterDate]);

  const getStudentName = (id: string) => {
    try {
      if (!id) return 'Unknown';
      const student = students.find(s => s && s.id === id);
      return student ? student.name : 'Unknown';
    } catch (err) {
      console.error('Error getting student name:', err);
      return 'Unknown';
    }
  };
  
  const getClassName = (id: string) => {
    try {
      if (!id) return 'Unknown';
      console.log('Looking up class name for ID:', id);
      console.log('Available classes:', classes.map(c => ({ id: c.id, name: c.name })));
      const cls = classes.find(c => c && c.id === id);
      const result = cls ? cls.name : 'Unknown';
      console.log('Class lookup result:', result);
      return result;
    } catch (err) {
      console.error('Error getting class name:', err);
      return 'Unknown';
    }
  };

  const handleRetry = () => {
    setLocalError(null);
    fetchAttendance();
    fetchStudents();
    fetchClasses();
  };

  if (loading && attendance.length === 0) {
    return <Loading message="Loading attendance records..." />;
  }

  if (error || localError) {
    return (
      <PageLayout title="Attendance History" subtitle="View and filter attendance records">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              Error loading attendance records: {error || localError}
            </div>
            <button 
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Attendance History" 
      subtitle="View and filter attendance records"
      actions={
        <div className="flex space-x-2">
          <button
            onClick={() => setReportView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              reportView === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Detailed List
          </button>
          <button
            onClick={() => setReportView('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              reportView === 'summary'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Summary Report
          </button>
        </div>
      }
    >
      {localError && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">
            {localError}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Class
            </label>
            <select
              value={filterClassId}
              onChange={e => setFilterClassId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {reportView === 'list' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {filteredAttendance && filteredAttendance.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Student Name</Table.HeaderCell>
                  <Table.HeaderCell>Class</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {filteredAttendance.map((record, index) => (
                  <Table.Row key={`${record.id}-${index}`}>
                    <Table.Cell>
                      {record.date || 'Unknown'}
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900">
                      {getStudentName(record.studentId)}
                    </Table.Cell>
                    <Table.Cell>
                      {getClassName(record.classId)}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status || 'Unknown'}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterClassId || filterDate 
                  ? 'No records match your filters.' 
                  : 'No attendance records have been recorded yet.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {attendanceSummary && attendanceSummary.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Class</Table.HeaderCell>
                  <Table.HeaderCell>Present</Table.HeaderCell>
                  <Table.HeaderCell>Absent</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>Attendance Rate</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {attendanceSummary.map((dateGroup, dateIndex) => {
                  console.log('Rendering date group:', dateGroup);
                  return (
                    <React.Fragment key={`${dateGroup.date}-${dateIndex}`}>
                      {dateGroup.classes && dateGroup.classes.length > 0 ? (
                        dateGroup.classes.map((classData, classIndex) => {
                          console.log('Rendering class data:', classData);
                          return (
                            <Table.Row 
                              key={`${dateGroup.date}-${classData.classId}-${classIndex}`}
                            >
                              {classIndex === 0 && dateGroup.classes && dateGroup.classes.length > 0 && (
                                <Table.Cell 
                                  rowSpan={dateGroup.classes.length} 
                                  className="font-medium text-gray-900 align-top"
                                >
                                  {dateGroup.date}
                                </Table.Cell>
                              )}
                              <Table.Cell>
                                {classData.className || 'Unknown'}
                              </Table.Cell>
                              <Table.Cell>
                                {classData.present || 0}
                              </Table.Cell>
                              <Table.Cell>
                                {classData.absent || 0}
                              </Table.Cell>
                              <Table.Cell>
                                {classData.total || 0}
                              </Table.Cell>
                              <Table.Cell>
                                <div className="flex items-center">
                                  <span className="mr-2 text-gray-900">{classData.percentage || 0}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        (classData.percentage || 0) >= 75 
                                          ? 'bg-green-600' 
                                          : (classData.percentage || 0) >= 50 
                                            ? 'bg-yellow-500' 
                                            : 'bg-red-600'
                                      }`} 
                                      style={{ width: `${classData.percentage || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })
                      ) : (
                        <Table.Row key={`no-data-${dateIndex}`}>
                          <Table.Cell colSpan={6} className="text-center text-gray-500">
                            No class data available for this date.
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </React.Fragment>
                  );
                })}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance summary data found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterClassId || filterDate 
                  ? 'No records match your filters.' 
                  : 'No attendance records have been recorded yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AttendanceHistoryPage;