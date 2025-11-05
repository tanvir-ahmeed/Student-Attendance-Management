import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
// Removed useTheme import
import Button from '../ui/Button';
import { UserIcon, LogOutIcon } from '../Icons'; // Removed SunIcon and MoonIcon imports

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed = false }) => {
  const { user, logout } = useData();
  // Removed theme and toggleTheme destructuring
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Attendance Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Removed theme toggle button */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? 'Administrator' : 'User'}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  leftIcon={<LogOutIcon className="h-4 w-4" />}
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;