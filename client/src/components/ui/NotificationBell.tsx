import React from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

interface NotificationBellProps {
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { notifications } = useSocket();
  const count = notifications.length;

  return (
    <button
      onClick={onClick}
      className="relative p-2.5 rounded-xl text-surface-400 hover:text-surface-100 
                 hover:bg-surface-700/50 transition-all duration-200"
      id="notification-bell"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="notification-dot">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
