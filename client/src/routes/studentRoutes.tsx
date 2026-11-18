import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleBasedRoute } from './RoleBasedRoute';
import { StudentLayout } from '../layouts/StudentLayout';
import { Dashboard } from '../pages/student/Dashboard';
import { ExamList } from '../pages/student/ExamList';
import { ExamRoom } from '../pages/student/ExamRoom';
import { ExamResult } from '../pages/student/ExamResult';
import { ExamHistory } from '../pages/student/ExamHistory';
import { ProfilePage } from '../pages/common/ProfilePage';

export const studentRoutes = (
  <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
    <Route path="/student" element={<StudentLayout />}>
      <Route index element={<Navigate to="/student/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="exams" element={<ExamList />} />
      <Route path="exams/:examId/take" element={<ExamRoom />} />
      <Route path="results/:attemptId" element={<ExamResult />} />
      <Route path="history" element={<ExamHistory />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  </Route>
);
