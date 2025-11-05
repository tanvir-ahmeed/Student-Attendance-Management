
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ClassesPage from './pages/Classes';
import StudentsPage from './pages/Students';
import MarkAttendancePage from './pages/MarkAttendance';
import AttendanceHistoryPage from './pages/AttendanceHistory';
import { DataProvider } from './contexts/DataContext';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
        <DataProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
                    <Route path="/*" element={isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" />} />
                </Routes>
            </HashRouter>
        </DataProvider>
    );
};

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onLogout={onLogout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-8">
                    <Outlet />
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/classes" element={<ClassesPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/attendance/mark" element={<MarkAttendancePage />} />
                        <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
