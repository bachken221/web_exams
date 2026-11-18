import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Kiểm tra đăng nhập (PrivateRoute):
// Bắt buộc chờ isLoading === false trước khi kiểm tra isAuthenticated để tránh lỗi F5 bị văng về /login (BUG-01)
export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Đang đồng bộ thông tin tài khoản..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

