import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  UsersIcon,
  SchoolIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  BellIcon,
  CalendarIcon,
} from '../components/Icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import Loading from '../components/ui/Loading';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const {
    students,
    classes,
    attendance,
    fetchStudents,
    fetchClasses,
    fetchAttendance,
    loading,
    error,
  } = useData();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch data periodically to ensure real-time updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        await Promise.all([fetchStudents(), fetchClasses(), fetchAttendance()]);
        console.log('Dashboard data fetched successfully');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [fetchStudents, fetchClasses, fetchAttendance]);

  // Generate real recent activity based on actual data
  useEffect(() => {
    const generateRecentActivity = () => {
      const activity = [];
      
      // Add recent attendance records
      const recentAttendance = [...attendance]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);
      
      recentAttendance.forEach((record, index) => {
        const student = students.find(s => s.id === record.studentId);
        const cls = classes.find(c => c.id === record.classId);
        if (student && cls) {
          activity.push({
            id: `attendance-${index}`,
            action: `Attendance marked`,
            description: `${student.name} in ${cls.name} - ${record.status}`,
            time: `${Math.floor((Date.now() - new Date(record.date).getTime()) / (1000 * 60 * 60))} hours ago`
          });
        }
      });
      
      // Add recent students (using a simple approach since we don't have createdAt)
      if (students.length > 0) {
        const recentStudents = students.slice(-2); // Get last 2 students as "recent"
        recentStudents.forEach((student, index) => {
          const cls = classes.find(c => c.id === student.classId);
          activity.push({
            id: `student-${index}`,
            action: 'New student added',
            description: `${student.name} to ${cls ? cls.name : 'class'}`,
            time: 'Recently'
          });
        });
      }
      
      setRecentActivity(activity);
    };
    
    if (students.length > 0 && classes.length > 0 && attendance.length > 0) {
      generateRecentActivity();
    }
  }, [students, classes, attendance]);

  // Filter data based on selected class
  const filteredAttendance = useMemo(() => {
    if (!selectedClassId) return attendance;
    return attendance.filter(record => record.classId === selectedClassId);
  }, [attendance, selectedClassId]);

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return students;
    return students.filter(student => 
      student.classIds?.includes(selectedClassId) || student.classId === selectedClassId
    );
  }, [students, selectedClassId]);

  // Calculate today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todaysAttendance = filteredAttendance.filter(record => record.date === today);
  const presentToday = todaysAttendance.filter(
    r => r.status === 'Present'
  ).length;
  const totalStudentsForToday = new Set(todaysAttendance.map(r => r.studentId))
    .size;

  const attendancePercentage =
    totalStudentsForToday > 0
      ? ((presentToday / totalStudentsForToday) * 100).toFixed(0)
      : 'N/A';

  // Generate attendance trend data based on selected time range
  const attendanceTrendData = useMemo(() => {
    const data = [];
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    
    // Create date objects for the range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    // Group attendance by date
    const attendanceByDate: Record<string, { present: number; total: number }> = {};
    
    // Initialize all dates with zero values
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      attendanceByDate[dateStr] = { present: 0, total: 0 };
    }
    
    // Count attendance records for the selected class only
    filteredAttendance.forEach(record => {
      if (record.date in attendanceByDate) {
        attendanceByDate[record.date].total += 1;
        if (record.status === 'Present') {
          attendanceByDate[record.date].present += 1;
        }
      }
    });
    
    // Convert to chart data
    for (const [date, counts] of Object.entries(attendanceByDate)) {
      const percentage = counts.total > 0 ? (counts.present / counts.total) * 100 : 0;
      data.push({
        date,
        percentage: Math.round(percentage),
        present: counts.present,
        total: counts.total
      });
    }
    
    return data;
  }, [filteredAttendance, selectedTimeRange]);

  // Class distribution data
  const classDistributionData = useMemo(() => {
    const classStudentCount: Record<string, number> = {};
    
    // Count students per class
    students.forEach(student => {
      if (student.classIds) {
        student.classIds.forEach(classId => {
          classStudentCount[classId] = (classStudentCount[classId] || 0) + 1;
        });
      }
    });
    
    // Convert to chart data
    return classes.map(cls => ({
      name: cls.name,
      value: classStudentCount[cls.id] || 0
    })).filter(item => item.value > 0);
  }, [students, classes]);

  // Class performance data (attendance rates by class)
  const classPerformanceData = useMemo(() => {
    const classAttendance: Record<string, { present: number; total: number }> = {};
    
    // Initialize class attendance tracking
    classes.forEach(cls => {
      classAttendance[cls.id] = { present: 0, total: 0 };
    });
    
    // Count attendance by class
    filteredAttendance.forEach(record => {
      if (classAttendance[record.classId]) {
        classAttendance[record.classId].total += 1;
        if (record.status === 'Present') {
          classAttendance[record.classId].present += 1;
        }
      }
    });
    
    // Convert to chart data
    return classes.map(cls => {
      const stats = classAttendance[cls.id];
      const rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      return {
        name: cls.name,
        attendanceRate: Math.round(rate),
        present: stats.present,
        total: stats.total
      };
    }).filter(item => item.total > 0);
  }, [filteredAttendance, classes]);

  // Student performance data (top students by attendance)
  const topStudentsData = useMemo(() => {
    const studentAttendance: Record<string, { present: number; total: number; name: string }> = {};
    
    // Initialize student attendance tracking for filtered students only
    filteredStudents.forEach(student => {
      studentAttendance[student.id] = { present: 0, total: 0, name: student.name };
    });
    
    // Count attendance by student for the selected class only
    filteredAttendance.forEach(record => {
      if (studentAttendance[record.studentId]) {
        studentAttendance[record.studentId].total += 1;
        if (record.status === 'Present') {
          studentAttendance[record.studentId].present += 1;
        }
      }
    });
    
    // Convert to chart data and sort by attendance rate
    return Object.values(studentAttendance)
      .map(student => {
        const rate = student.total > 0 ? (student.present / student.total) * 100 : 0;
        return {
          name: student.name,
          attendanceRate: Math.round(rate),
          present: student.present,
          total: student.total
        };
      })
      .filter(student => student.total > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10); // Top 10 students
  }, [filteredAttendance, filteredStudents]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalAttendanceRecords = filteredAttendance.length;
    const totalPresent = filteredAttendance.filter(r => r.status === 'Present').length;
    const overallAttendanceRate = totalAttendanceRecords > 0 
      ? (totalPresent / totalAttendanceRecords) * 100 
      : 0;
      
    const classAttendanceRates = classPerformanceData.map(c => c.attendanceRate);
    const avgClassAttendanceRate = classAttendanceRates.length > 0 
      ? classAttendanceRates.reduce((a, b) => a + b, 0) / classAttendanceRates.length 
      : 0;
      
    return {
      totalStudents: selectedClassId ? filteredStudents.length : students.length,
      totalClasses: classes.length,
      totalAttendanceRecords,
      overallAttendanceRate: Math.round(overallAttendanceRate),
      avgClassAttendanceRate: Math.round(avgClassAttendanceRate)
    };
  }, [students, classes, filteredAttendance, filteredStudents, classPerformanceData, selectedClassId]);

  const COLORS = ['#4f46e5', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];

  if (loading && students.length === 0 && classes.length === 0) {
    return <Loading message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading dashboard data: {error}
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Analytics Dashboard"
      subtitle="Comprehensive attendance insights and performance metrics"
      actions={
        <div className="flex space-x-3">
          <Button variant="primary" size="md">
            Mark Attendance
          </Button>
          <Button variant="secondary" size="md">
            Export Report
          </Button>
          <Button variant="outline" size="md">
            Add Student
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View by Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="mt-1 block w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value as any)}
              className="mt-1 block w-full md:w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <DashboardCard
          title="Total Students"
          value={overallStats.totalStudents.toString()}
          icon={<UsersIcon className="h-8 w-8 text-white" />}
          color="bg-blue-500"
          description="All registered students"
        />
        <DashboardCard
          title="Total Classes"
          value={overallStats.totalClasses.toString()}
          icon={<SchoolIcon className="h-8 w-8 text-white" />}
          color="bg-green-500"
          description="Active classes"
        />
        <DashboardCard
          title="Overall Attendance"
          value={`${overallStats.overallAttendanceRate}%`}
          icon={<CheckSquareIcon className="h-8 w-8 text-white" />}
          color="bg-indigo-500"
          description="Across all classes"
        />
        <DashboardCard
          title="Avg. Class Rate"
          value={`${overallStats.avgClassAttendanceRate}%`}
          icon={<TrendingUpIcon className="h-8 w-8 text-white" />}
          color="bg-purple-500"
          description="Average per class"
        />
        <DashboardCard
          title="Total Records"
          value={overallStats.totalAttendanceRecords.toString()}
          icon={<CheckSquareIcon className="h-8 w-8 text-white" />}
          color="bg-amber-500"
          description="Attendance records"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance Trend
            </h3>
            <div className="flex space-x-2">
              <button 
                className={`text-xs px-2 py-1 rounded text-gray-700 ${
                  selectedTimeRange === '7d' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100'
                }`}
                onClick={() => setSelectedTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded text-gray-700 ${
                  selectedTimeRange === '30d' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100'
                }`}
                onClick={() => setSelectedTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded text-gray-700 ${
                  selectedTimeRange === '90d' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100'
                }`}
                onClick={() => setSelectedTimeRange('90d')}
              >
                90D
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceTrendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Performance Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Class Performance Comparison
            </h3>
            <CheckSquareIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classPerformanceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280" 
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                />
                <Bar dataKey="attendanceRate" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {classPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top Performing Students
            </h3>
            <UsersIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topStudentsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                />
                <Bar dataKey="attendanceRate" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Class Distribution
            </h3>
            <SchoolIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round((percent as number) * 100)}%`}
                >
                  {classDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [value, 'Students']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activity
          </h3>
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon,
  color,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardPage;