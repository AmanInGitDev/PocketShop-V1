/**
 * Top Navbar Component
 * 
 * Persistent header bar that spans the full width of the application.
 * Contains logo, search, status indicator, and user menu.
 */

import React, { useState } from 'react';
import { Search, LogOut, ChevronDown, User, Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import StatusToggle from '@/components/common/StatusToggle';
import { useVendorStatus } from '@/features/vendor/hooks/useVendorStatus';

interface TopNavbarProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle, isMenuOpen: _isMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOnline, isToggling, toggleStatus } = useVendorStatus();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.BUSINESS);
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="h-full px-6">
        <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto">
          {/* Left: Mobile Menu Toggle + Search Area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile Menu Toggle */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>

          {/* Center: Universal Search */}
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Universal Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right: Status Toggle + User Menu */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <StatusToggle 
              online={isOnline} 
              onToggle={toggleStatus} 
              disabled={isToggling}
            />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.full_name || 'Vendor'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email?.split('@')[0] || 'user'}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.full_name || 'Vendor'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm focus:outline-none"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;

