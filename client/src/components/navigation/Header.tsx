import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  portalTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ portalTitle }) => {
  const { user } = useAuth();
  const profilePath =
    user?.role === 'admin'
      ? '/admin/profile'
      : user?.role === 'teacher'
      ? '/teacher/profile'
      : '/student/profile';

  const roleLabel =
    user?.role === 'admin'
      ? 'Quản trị viên'
      : user?.role === 'teacher'
      ? 'Giảng viên'
      : 'Sinh viên';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-800">{portalTitle}</h1>
      </div>

      <Link
        to={profilePath}
        className="flex items-center gap-2.5 px-2.5 py-1 rounded hover:bg-stone-100 transition-colors"
        title="Mở hồ sơ tài khoản"
      >
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name}</p>
          <p className="text-[11px] text-slate-500 leading-tight">{roleLabel}</p>
        </div>
        <div className="w-7 h-7 rounded bg-stone-100 border border-slate-300 flex items-center justify-center text-slate-700">
          <User className="w-4 h-4" />
        </div>
      </Link>
    </header>
  );
};
