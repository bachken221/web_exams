import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleBasedRoute } from './RoleBasedRoute';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { MyExams } from '../pages/teacher/MyExams';
import { QuestionBank } from '../pages/teacher/QuestionBank';
import { StudentResults } from '../pages/teacher/StudentResults';
import { ProfilePage } from '../pages/common/ProfilePage';

export const teacherRoutes = (
  <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
    <Route path="/teacher" element={<TeacherLayout />}>
      <Route index element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="exams" element={<MyExams />} />
      <Route path="exams/:examId/questions" element={<QuestionBank />} />
      <Route path="exams/:examId/results" element={<StudentResults />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  </Route>
);
