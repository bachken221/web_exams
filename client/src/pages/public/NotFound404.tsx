import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const NotFound404: React.FC = () => {
  const { isAuthenticated, getHomePathByRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-md bg-stone-100 border border-slate-300 text-slate-700 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Mã lỗi 404 Not Found
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Không tìm thấy trang yêu cầu
          </h1>
        </div>
        <p className="text-sm text-slate-600">
          Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được di chuyển trên hệ thống.
        </p>
        <div className="pt-2">
          <Link
            to={isAuthenticated ? getHomePathByRole() : '/'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

