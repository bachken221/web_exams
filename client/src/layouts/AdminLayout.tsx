import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 Cổng Khảo thí Trực tuyến • Trung tâm Đảm bảo Chất lượng Đào tạo</span>
          <span>Phòng 304 Nhà A1 • Email: khaothi@edu.vn • Điện thoại: (024) 3754 7890</span>
        </div>
      </footer>
    </div>
  );
};
