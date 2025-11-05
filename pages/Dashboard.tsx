import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { UsersIcon, SchoolIcon, CheckSquareIcon } from '../components/Icons';
import Loading from '../components/ui/Loading';
import PageLayout from '../components/layout/PageLayout';

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
    <PageLayout
      title="Dashboard"
      subtitle="Welcome to your attendance management system"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      <div className="mt-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {attendance.slice(0, 5).map(record => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Attendance marked for {record.date}
                  </p>
                  <p className="text-sm text-gray-500">
                    {students.find(s => s.id === record.studentId)?.name ||
                      'Unknown Student'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    record.status === 'Present'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {record.status}
                </span>
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
