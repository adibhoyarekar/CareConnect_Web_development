import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <svg aria-label="CareConnect Logo" className="h-10 w-auto" viewBox="0 0 200 40">
              <text x="0" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="30" fontWeight="bold" fill="#312e81">
                Care<tspan fill="#4f46e5">Connect</tspan>
              </text>
            </svg>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;