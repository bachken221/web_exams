import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookCopy,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  portalRole: 'teacher' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ portalRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacher = portalRole === 'teacher';
  const sidebarBg = isTeacher ? 'bg-slate-800 text-slate-100' : 'bg-zinc-900 text-zinc-100';
  const activeItemClass = isTeacher
    ? 'bg-teal-700 text-white font-semibold'
    : 'bg-amber-600 text-white font-semibold';
  const inactiveItemClass = isTeacher
    ? 'text-slate-300 hover:bg-slate-700/80 hover:text-white'
    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white';

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition-colors ${
      isActive ? activeItemClass : inactiveItemClass
    }`;

  return (
    <aside className={`w-64 shrink-0 min-h-screen flex flex-col justify-between ${sidebarBg}`}>
      <div>
        {/* Thương hiệu trường / hệ thống */}
        <div className="h-15 py-3.5 px-5 flex items-center gap-3 border-b border-white/10">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center text-white shrink-0 ${
              isTeacher ? 'bg-teal-600' : 'bg-amber-600'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-white truncate">
              KHẢO THÍ ĐẠI HỌC
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isTeacher ? 'Cổng thông tin Giảng viên' : 'Bảng điều khiển Quản trị'}
            </p>
          </div>
        </div>

        {/* Danh mục điều hướng */}
        <div className="p-3.5 space-y-5">
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {isTeacher ? 'Công tác khảo thí' : 'Quản lý đào tạo'}
            </p>
            <nav className="space-y-1">
              {isTeacher ? (
                <>
                  <NavLink to="/teacher/dashboard" className={navClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Tổng quan học phần</span>
                  </NavLink>
                  <NavLink to="/teacher/exams" className={navClass}>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Đề thi & Câu hỏi</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/admin/dashboard" className={navClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Báo cáo & Thống kê</span>
                  </NavLink>
                  <NavLink to="/admin/users" className={navClass}>
                    <Users className="w-4 h-4" />
                    <span>Tài khoản</span>
                  </NavLink>
                  <NavLink to="/admin/subjects" className={navClass}>
                    <BookCopy className="w-4 h-4" />
                    <span>Danh mục học phần</span>
                  </NavLink>
                  <NavLink to="/admin/exams" className={navClass}>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Quản lý đề thi</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Cá nhân
            </p>
            <nav className="space-y-1">
              <NavLink
                to={isTeacher ? '/teacher/profile' : '/admin/profile'}
                className={navClass}
              >
                <User className="w-4 h-4" />
                <span>Hồ sơ tài khoản</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* Khu vực tài khoản ở chân Sidebar */}
      <div className="p-3.5 border-t border-white/10 space-y-2.5">
        <div className="px-3 py-2 rounded bg-black/20">
          <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium text-slate-200 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
