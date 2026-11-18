import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { studentRoutes } from './studentRoutes';
import { teacherRoutes } from './teacherRoutes';
import { adminRoutes } from './adminRoutes';
import { AuthLayout } from '../layouts/AuthLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { Forbidden403 } from '../pages/public/Forbidden403';
import { NotFound404 } from '../pages/public/NotFound404';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Trang giới thiệu chung */}
      <Route path="/" element={<LandingPage />} />

      {/* Nhóm Route Xác thực (Nếu đã đăng nhập tự đẩy về Dashboard theo Role) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Nhóm Route Bảo vệ theo 3 Phân hệ (Student, Teacher, Admin) */}
      <Route element={<PrivateRoute />}>
        {studentRoutes}
        {teacherRoutes}
        {adminRoutes}
      </Route>

      {/* Trang lỗi 403 & 404 */}
      <Route path="/403" element={<Forbidden403 />} />
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
};

