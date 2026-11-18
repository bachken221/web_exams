import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Forbidden403: React.FC = () => {
  const { user, getHomePathByRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-md bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Mã lỗi 403 Forbidden
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Bạn không có quyền truy cập khu vực này
          </h1>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tài khoản hiện tại của bạn đang có vai trò{' '}
          <span className="font-semibold text-slate-900 uppercase">
            {user?.role || 'Khách'}
          </span>
          , không được cấp phép truy cập vào phân hệ hoặc tài nguyên vừa yêu cầu.
        </p>
        <div className="pt-2">
          <Link
            to={getHomePathByRole()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về Trang chủ của bạn</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

