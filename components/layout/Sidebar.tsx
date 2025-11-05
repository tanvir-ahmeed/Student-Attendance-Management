import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  SchoolIcon,
  UsersIcon,
  CheckSquareIcon,
  HistoryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
  onToggle?: (collapsed: boolean) => void;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
  onToggle,
  collapsed = false,
}) => {
  const location = useLocation();

  const drawer = (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300`}
    >
      <div
        className={`flex items-center px-6 py-4 border-b border-gray-200 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        {!collapsed ? (
          <>
            <SchoolIcon className="h-8 w-auto text-indigo-600" />
            <span className="ml-3 text-xl font-bold text-gray-900">
              Attendance Pro
            </span>
          </>
        ) : (
          <SchoolIcon className="h-8 w-auto text-indigo-600" />
        )}
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
              } ${collapsed ? 'justify-center' : ''}`}
              onClick={onMobileClose}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={() => onToggle && onToggle(!collapsed)}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="ml-3">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        {drawer}
      </div>
    </div>
  );
};

export default Sidebar;
