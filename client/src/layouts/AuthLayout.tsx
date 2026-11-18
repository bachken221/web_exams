import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-15 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-700 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-none">
                CỔNG KHẢO THÍ TRỰC TUYẾN
              </span>
              <span className="text-[11px] text-slate-500">
                Trung tâm Khảo thí & Đảm bảo Chất lượng Đào tạo
              </span>
            </div>
          </Link>
          <div className="hidden sm:block text-xs text-slate-500">
            Hỗ trợ kỹ thuật: <span className="font-medium text-slate-700">khaothi@edu.vn</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 Trung tâm Khảo thí & Đảm bảo Chất lượng Đào tạo.</span>
          <span>66B Nguyễn Sỹ Sách • Điện thoại: (024) 22 6789</span>
        </div>
      </footer>
    </div>
  );
};
