import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types/auth.types';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithData: (token: string, user: User) => void;
  updateCurrentUser: (updatedUser: User) => void;
  logout: () => void;
  getHomePathByRole: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser<User>());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storage.getToken();
      if (!savedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const freshUser = await authService.getMe();
        setUser(freshUser);
        setToken(savedToken);
        storage.setUser(freshUser);
      } catch {
        storage.clearAuth();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithData = (newToken: string, newUser: User) => {
    storage.setToken(newToken);
    storage.setUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser((prev) => {
      const merged = prev ? { ...prev, ...updatedUser } : updatedUser;
      storage.setUser(merged);
      return merged;
    });
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
  };

  const getHomePathByRole = (role?: UserRole): string => {
    const targetRole = role || user?.role;
    if (targetRole === 'admin') return '/admin/dashboard';
    if (targetRole === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        loginWithData,
        updateCurrentUser,
        logout,
        getHomePathByRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
