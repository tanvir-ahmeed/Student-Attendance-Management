import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  UsersIcon,
  SchoolIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  BellIcon,
  CalendarIcon,
} from '../components/Icons';
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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
  }, [fetchStudents, fetchClasses, fetchAttendance]);

  useEffect(() => {
    // Generate mock recent activity
    const mockActivity = [
      {
        id: 1,
        action: 'Attendance marked',
        description: 'Mathematics 101 - 25 students',
        time: '2 hours ago',
      },
      {
        id: 2,
        action: 'New student added',
        description: 'John Smith to Physics 201',
        time: '5 hours ago',
      },
      {
        id: 3,
        action: 'Class created',
        description: 'Chemistry 301',
        time: '1 day ago',
      },
      {
        id: 4,
        action: 'Attendance updated',
        description: 'History 101 - 20 students',
        time: '2 days ago',
      },
    ];
    setRecentActivity(mockActivity);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter(record => record.date === today);
  const presentToday = todaysAttendance.filter(
    r => r.status === 'Present'
  ).length;
  const totalStudentsForToday = new Set(todaysAttendance.map(r => r.studentId))
    .size;

  const attendancePercentage =
    totalStudentsForToday > 0
      ? ((presentToday / totalStudentsForToday) * 100).toFixed(0)
      : 'N/A';

  // Mock data for attendance trend (last 7 days)
  const attendanceTrend = [
    { day: 'Mon', percentage: 85 },
    { day: 'Tue', percentage: 92 },
    { day: 'Wed', percentage: 78 },
    { day: 'Thu', percentage: 88 },
    { day: 'Fri', percentage: 95 },
    { day: 'Sat', percentage: 90 },
    { day: 'Sun', percentage: 82 },
  ];

  if (loading) {
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
      title="Dashboard"
      subtitle="Welcome to your attendance management system"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Students"
          value={students.length.toString()}
          icon={<UsersIcon className="h-8 w-8 text-white" />}
          color="bg-blue-500"
          description="All registered students"
        />
        <DashboardCard
          title="Total Classes"
          value={classes.length.toString()}
          icon={<SchoolIcon className="h-8 w-8 text-white" />}
          color="bg-green-500"
          description="Active classes"
        />
        <DashboardCard
          title="Attendance Today"
          value={`${attendancePercentage}%`}
          subtitle={`${presentToday} / ${totalStudentsForToday} Present`}
          icon={<CheckSquareIcon className="h-8 w-8 text-white" />}
          color="bg-indigo-500"
          description="Today's attendance rate"
        />
        <DashboardCard
          title="Active Teachers"
          value="12"
          icon={<TrendingUpIcon className="h-8 w-8 text-white" />}
          color="bg-purple-500"
          description="Currently active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance Trend
            </h3>
            <div className="flex space-x-2">
              <button className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                7D
              </button>
              <button className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                30D
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {attendanceTrend.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div
                  className="w-full bg-indigo-200 rounded-t hover:bg-indigo-300 transition-all duration-300"
                  style={{ height: `${day.percentage}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">
                  {day.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h3>
            <BellIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map(activity => (
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
            ))}
          </div>
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
