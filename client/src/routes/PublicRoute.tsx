import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Route công khai (/login, /register):
// Nếu người dùng đã đăng nhập thì tự động đẩy về đúng Dashboard theo Role
export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, getHomePathByRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathByRole()} replace />;
  }

  return <Outlet />;
};

