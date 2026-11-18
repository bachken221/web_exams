import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';

export const TeacherLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 Cổng Khảo thí Trực tuyến • Học kỳ I Năm học 2026 - 2027</span>
          <span>Hỗ trợ giảng viên: khaothi@edu.vn • Điện thoại: (024) 3754 7890</span>
        </div>
      </footer>
    </div>
  );
};
