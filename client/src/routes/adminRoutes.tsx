import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleBasedRoute } from './RoleBasedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { SubjectManagement } from '../pages/admin/SubjectManagement';
import { AllExamsMonitor } from '../pages/admin/AllExamsMonitor';
import { ProfilePage } from '../pages/common/ProfilePage';

export const adminRoutes = (
  <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="subjects" element={<SubjectManagement />} />
      <Route path="exams" element={<AllExamsMonitor />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  </Route>
);
