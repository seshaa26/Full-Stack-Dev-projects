import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Logo from '../ui/Logo';
import NotificationBell from '../ui/NotificationBell';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
            <Logo size="sm" animate={false} className="mr-1" />
            <span className="text-xl font-bold gradient-text hidden sm:block">
              DevXgen
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                placeholder="Search posts, tags, people..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-800/60 border border-surface-700/50
                         text-sm text-surface-200 placeholder-surface-500
                         focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20
                         transition-all duration-200"
                id="nav-search"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-700/50 transition-colors"
                    id="nav-user-menu"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-surface-200 max-w-[220px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-slide-down">
                      <div className="px-3 py-2 border-b border-surface-700/50 mb-1">
                        <p className="text-sm font-semibold text-surface-100">{user?.name}</p>
                        <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 
                                 hover:text-surface-100 hover:bg-surface-700/50 rounded-lg transition-colors"
                        id="nav-profile-link"
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 
                                 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        id="nav-logout"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm" id="nav-login">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-surface-400 hover:text-surface-100 
                       hover:bg-surface-700/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Click-away overlay for dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setShowDropdown(false)} />
      )}
    </nav>
  );
};

export default Navbar;
