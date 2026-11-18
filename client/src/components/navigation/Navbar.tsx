import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookCopy,
  BookOpen,
  FileCheck2,
  GraduationCap,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const Navbar: React.FC = () => {
  const { user, logout, getHomePathByRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem sinh viên có đang ở trong Phòng thi trực tuyến (/student/exams/:examId/take) hay không
  const isTakingExam = /^\/student\/exams\/\d+\/take$/.test(location.pathname);
  const [lockNotice, setLockNotice] = useState<string>('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isTakingExam) {
      setLockNotice('');
    }
  }, [isTakingExam]);

  const handleBlockedNavigation = (e: React.MouseEvent) => {
    if (isTakingExam) {
      e.preventDefault();
      setLockNotice(
        'Bạn đang trong thời gian làm bài thi. Theo quy chế khảo thí, không thể chuyển sang trang khác khi chưa nộp bài!'
      );
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    if (isTakingExam) {
      handleBlockedNavigation(e);
      return;
    }
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
      isTakingExam
        ? 'text-slate-400 cursor-not-allowed'
        : isActive
        ? 'bg-teal-700 text-white'
        : 'text-slate-700 hover:bg-stone-100 hover:text-slate-900'
    }`;

  const role = user?.role || 'student';
  const homePath = getHomePathByRole(role);
  const profilePath =
    role === 'admin'
      ? '/admin/profile'
      : role === 'teacher'
      ? '/teacher/profile'
      : '/student/profile';

  const roleBadgeLabel =
    role === 'admin'
      ? 'Quản trị viên'
      : role === 'teacher'
      ? 'Giảng viên'
      : 'Sinh viên';

  const portalSubtitle =
    role === 'admin'
      ? 'Quản trị Đào tạo & Khảo thí'
      : role === 'teacher'
      ? 'Cổng Thông tin Giảng viên'
      : 'Học kỳ I • Năm học 2026 - 2027';

  const initials = (user?.full_name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const renderNavItems = () => {
    if (role === 'admin') {
      return (
        <>
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-4 h-4" />
            Tài khoản
          </NavLink>
          <NavLink to="/admin/subjects" className={navLinkClass}>
            <BookCopy className="w-4 h-4" />
            Học phần
          </NavLink>
          <NavLink to="/admin/exams" className={navLinkClass}>
            <FileCheck2 className="w-4 h-4" />
            Đề thi
          </NavLink>
          <NavLink to="/admin/profile" className={navLinkClass}>
            <User className="w-4 h-4" />
            Hồ sơ cá nhân
          </NavLink>
        </>
      );
    }

    if (role === 'teacher') {
      return (
        <>
          <NavLink to="/teacher/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </NavLink>
          <NavLink to="/teacher/exams" className={navLinkClass}>
            <FileCheck2 className="w-4 h-4" />
            Đề thi phụ trách
          </NavLink>
          <NavLink to="/teacher/profile" className={navLinkClass}>
            <User className="w-4 h-4" />
            Hồ sơ cá nhân
          </NavLink>
        </>
      );
    }

    return (
      <>
        <NavLink
          to="/student/dashboard"
          onClick={handleBlockedNavigation}
          className={navLinkClass}
        >
          <LayoutDashboard className="w-4 h-4" />
          Trang chủ
        </NavLink>
        <NavLink
          to="/student/exams"
          onClick={handleBlockedNavigation}
          className={navLinkClass}
        >
          <BookOpen className="w-4 h-4" />
          Đề thi học phần
        </NavLink>
        <NavLink
          to="/student/history"
          onClick={handleBlockedNavigation}
          className={navLinkClass}
        >
          <History className="w-4 h-4" />
          Kết quả đã thi
        </NavLink>
        <NavLink
          to="/student/profile"
          onClick={handleBlockedNavigation}
          className={navLinkClass}
        >
          <User className="w-4 h-4" />
          Hồ sơ cá nhân
        </NavLink>
      </>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to={homePath}
            onClick={handleBlockedNavigation}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-teal-700 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-none">
                CỔNG KHẢO THÍ TRỰC TUYẾN
              </span>
              <span className="text-[11px] text-slate-500">{portalSubtitle}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">{renderNavItems()}</nav>
        </div>

        <div className="flex items-center gap-3">
          {isTakingExam && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Chế độ phòng thi (Khóa chuyển trang)</span>
            </span>
          )}

          <Link
            to={profilePath}
            onClick={handleBlockedNavigation}
            className={`hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded transition-colors ${
              isTakingExam ? 'cursor-not-allowed opacity-75' : 'hover:bg-stone-100'
            }`}
            title={isTakingExam ? 'Đang trong giờ làm bài thi' : 'Xem hồ sơ cá nhân'}
          >
            <div className="w-7 h-7 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.full_name}
                </p>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-stone-100 border border-slate-300 text-slate-700">
                  {roleBadgeLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.email}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogoutClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              isTakingExam
                ? 'text-slate-400 border-slate-200 cursor-not-allowed'
                : 'text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát</span>
          </button>
        </div>
      </div>

      {/* Menu di động */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto bg-stone-50">
        {renderNavItems()}
      </div>

      {/* Cảnh báo khi sinh viên cố tình bấm chuyển sang phần khác trong lúc đang làm bài thi */}
      {isTakingExam && lockNotice && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{lockNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLockNotice('')}
              className="px-2 py-0.5 rounded border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 font-medium shrink-0"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Popup xác nhận đăng xuất */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất tài khoản khỏi hệ thống khảo thí trực tuyến không?"
        details={[
          { label: 'Tài khoản', value: user?.full_name || '' },
          { label: 'Email', value: user?.email || '' },
          { label: 'Vai trò', value: roleBadgeLabel },
        ]}
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </header>
  );
};
