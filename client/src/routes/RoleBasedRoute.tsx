import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

// Kiểm tra phân quyền theo vai trò (Role-Based Access Control):
// Nếu user.role không nằm trong allowedRoles -> Chuyển hướng sang trang /403 Forbidden
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

