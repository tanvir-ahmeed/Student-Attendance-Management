import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { UsersIcon, SchoolIcon, CheckSquareIcon } from '../components/Icons';
import Loading from '../components/ui/Loading';

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
    <div className="py-6 page-transition">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Students"
          value={students.length.toString()}
          icon={<UsersIcon className="h-8 w-8 text-white" />}
          color="bg-blue-500"
        />
        <DashboardCard
          title="Total Classes"
          value={classes.length.toString()}
          icon={<SchoolIcon className="h-8 w-8 text-white" />}
          color="bg-green-500"
        />
        <DashboardCard
          title="Attendance Today"
          value={`${attendancePercentage}%`}
          subtitle={`${presentToday} / ${totalStudentsForToday} Present`}
          icon={<CheckSquareIcon className="h-8 w-8 text-white" />}
          color="bg-indigo-500"
        />
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardPage;
