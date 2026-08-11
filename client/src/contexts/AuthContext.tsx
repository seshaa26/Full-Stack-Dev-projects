import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { User } from '../types';
import { loginWithGoogle, loginWithOracle } from '../services/authService';
import api from '../services/api';
import { GOOGLE_CLIENT_ID } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  loginOracle: (code: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  loginOracle: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('devxgen_token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data.user);
        } catch {
          localStorage.removeItem('devxgen_token');
          localStorage.removeItem('devxgen_user');
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credential: string) => {
    try {
      setLoading(true);
      const data = await loginWithGoogle(credential);
      localStorage.setItem('devxgen_token', data.token);
      localStorage.setItem('devxgen_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginOracle = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const data = await loginWithOracle(code);
      localStorage.setItem('devxgen_token', data.token);
      localStorage.setItem('devxgen_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Oracle login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('devxgen_token');
    localStorage.removeItem('devxgen_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('devxgen_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider
        value={{
          user,
          loading,
          isAuthenticated: !!user,
          login,
          loginOracle,
          logout,
          updateUser,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

