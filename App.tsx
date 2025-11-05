import React, { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/Login';
import { DataProvider } from './contexts/DataContext';
import Loading from './components/ui/Loading';
import { ToastProvider } from './components/ui/ToastProvider';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ClassesPage = lazy(() => import('./pages/Classes'));
const StudentsPage = lazy(() => import('./pages/Students'));
const MarkAttendancePage = lazy(() => import('./pages/MarkAttendance'));
const AttendanceHistoryPage = lazy(() => import('./pages/AttendanceHistory'));

const App: React.FC = () => {
  return (
    <DataProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </DataProvider>
  );
};

const LoginRoute: React.FC = () => {
  // We'll use a simple approach to check auth status
  const token = localStorage.getItem('token');

  console.log('LoginRoute: token exists:', !!token);

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <Suspense fallback={<Loading message="Loading login page..." />}>
      <LoginPage />
    </Suspense>
  );
};

const ProtectedLayout: React.FC = () => {
  // We'll use a simple approach to check auth status
  const token = localStorage.getItem('token');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  console.log('ProtectedLayout: token exists:', !!token);
  if (token) {
    console.log(
      'ProtectedLayout: token value:',
      token.substring(0, 20) + '...'
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          <Suspense fallback={<Loading message="Loading page content..." />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance/mark" element={<MarkAttendancePage />} />
              <Route
                path="/attendance/history"
                element={<AttendanceHistoryPage />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
