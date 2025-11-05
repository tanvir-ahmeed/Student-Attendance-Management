
import React from 'react';
import { LogOutIcon } from '../Icons';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:ml-64">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          {/* Search bar could go here */}
        </div>
        <div className="ml-4 flex items-center md:ml-6">
            <span className="text-sm font-medium text-gray-700 mr-4">Welcome, Admin</span>
            <button
                onClick={onLogout}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Logout"
            >
                <LogOutIcon className="h-6 w-6"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
