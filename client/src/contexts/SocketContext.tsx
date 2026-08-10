import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuth } from './AuthContext';
import { Notification } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  notifications: [],
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('devxgen_token');

    const newSocket = io(SOCKET_URL, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Socket disconnected');
    });

    // Listen for notifications
    newSocket.on('notification', (data: Notification) => {
      setNotifications((prev) => [{ ...data, timestamp: new Date().toISOString() }, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
