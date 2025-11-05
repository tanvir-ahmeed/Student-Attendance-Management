
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, SchoolIcon, UsersIcon, CheckSquareIcon, HistoryIcon } from '../Icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Classes', href: '/classes', icon: SchoolIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Mark Attendance', href: '/attendance/mark', icon: CheckSquareIcon },
  { name: 'Attendance History', href: '/attendance/history', icon: HistoryIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-indigo-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
           <SchoolIcon className="h-8 w-auto text-white" />
           <span className="ml-3 text-white text-xl font-bold">Attendance Pro</span>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
