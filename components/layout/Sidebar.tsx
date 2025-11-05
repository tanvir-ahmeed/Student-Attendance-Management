import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  SchoolIcon,
  UsersIcon,
  CheckSquareIcon,
  HistoryIcon,
} from '../Icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Classes', href: '/classes', icon: SchoolIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Mark Attendance', href: '/attendance/mark', icon: CheckSquareIcon },
  {
    name: 'Attendance History',
    href: '/attendance/history',
    icon: HistoryIcon,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();

  const drawer = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <SchoolIcon className="h-8 w-auto text-indigo-600" />
        <span className="ml-3 text-xl font-bold text-gray-900">
          Attendance Pro
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={onMobileClose}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              />
              <span className="ml-3">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        {drawer}
      </div>
    </div>
  );
};

export default Sidebar;
