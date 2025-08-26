import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onNavigateToProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onNavigateToProfile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
                <NotificationBell 
                  notifications={notifications}
                  onMarkAsRead={onMarkNotificationAsRead}
                  onMarkAllAsRead={onMarkAllNotificationsAsRead}
                />
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 text-left p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                     <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div className="hidden sm:block">
                          <span className="text-sm font-medium text-gray-800">{user.name}</span>
                          <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isDropdownOpen && (
                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-modal-in">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">My Profile</a>
                           <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Logout</a>
                        </div>
                      </div>
                  )}
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;