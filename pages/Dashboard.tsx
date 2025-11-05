
import React from 'react';
import { useData } from '../contexts/DataContext';
import { UsersIcon, SchoolIcon, CheckSquareIcon } from '../components/Icons';

const DashboardPage: React.FC = () => {
    const { students, classes, attendance } = useData();

    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendance.filter(record => record.date === today);
    const presentToday = todaysAttendance.filter(r => r.status === 'Present').length;
    const totalStudentsForToday = new Set(todaysAttendance.map(r => r.studentId)).size;
    
    const attendancePercentage = totalStudentsForToday > 0 ? ((presentToday / totalStudentsForToday) * 100).toFixed(0) : 'N/A';

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
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

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subtitle, icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                {icon}
            </div>
        </div>
    );
};


export default DashboardPage;
