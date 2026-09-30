import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

let globalSocket = null;

const getSocketInstance = () => {
  if (!globalSocket) {
    const serverUrl = window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin;
    globalSocket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    });
  }
  return globalSocket;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(() => getSocketInstance());
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const s = getSocketInstance();
    setSocket(s);

    const handleConnect = () => {
      console.log('[Socket] Connected to server:', s.id);
      if (user?.id) {
        s.emit('user_online', user.id);
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    if (s.connected) {
      handleConnect();
    }

    s.on('connect', handleConnect);
    s.on('online_users_list', handleOnlineUsers);

    return () => {
      s.off('connect', handleConnect);
      s.off('online_users_list', handleOnlineUsers);
    };
  }, []);

  useEffect(() => {
    const s = getSocketInstance();
    if (s && s.connected && user?.id) {
      s.emit('user_online', user.id);
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
