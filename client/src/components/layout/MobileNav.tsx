import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User, Bell, LogIn } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  onCreatePost: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onCreatePost }) => {
  const location = useLocation();
  const { notifications } = useSocket();
  const { isAuthenticated } = useAuth();

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    ...(isAuthenticated ? [
      { icon: PlusCircle, label: 'Create', action: onCreatePost },
      { icon: Bell, label: 'Alerts', path: '/notifications', badge: notifications.length },
      { icon: User, label: 'Profile', path: '/profile' }
    ] : [
      { icon: LogIn, label: 'Login', path: '/login' }
    ])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden 
                    bg-surface-900/95 backdrop-blur-xl border-t border-surface-700/50 
                    safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                         text-surface-400 hover:text-primary-400 transition-colors"
                id={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                ${isActive ? 'text-primary-400' : 'text-surface-400 hover:text-surface-200'}`}
              id={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="notification-dot" style={{ top: '-2px', right: '8px' }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
