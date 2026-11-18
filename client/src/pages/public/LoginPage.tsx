import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithData, getHomePathByRole } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Địa chỉ email không đúng định dạng');
      return false;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      loginWithData(data.token, data.user);
      const targetPath = getHomePathByRole(data.user.role);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Đăng nhập tài khoản</h1>
          <p className="text-xs text-slate-500 mt-1">
            Nhập email trường cấp và mật khẩu để truy cập hệ thống khảo thí
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email đăng nhập
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@edu.vn"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5" disabled={loading}>
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          Chưa có tài khoản sinh viên?{' '}
          <Link to="/register" className="font-semibold text-teal-700 hover:underline">
            Đăng ký tại đây
          </Link>
        </div>
      </div>

      {/* Chọn tài khoản có sẵn để đăng nhập nhanh */}
      <div className="bg-white border border-slate-200 rounded-md p-4">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Điền nhanh tài khoản có sẵn trên hệ thống:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill('sv.bach@edu.vn')}
            className="text-left px-2.5 py-2 rounded border border-slate-200 hover:bg-stone-50 transition-colors"
          >
            <span className="font-semibold text-slate-900 block">Phạm Việt Bách</span>
            <span className="text-slate-500 text-[11px]">Sinh viên • sv.bach@edu.vn</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('gv.an@edu.vn')}
            className="text-left px-2.5 py-2 rounded border border-slate-200 hover:bg-stone-50 transition-colors"
          >
            <span className="font-semibold text-slate-900 block">TS. Nguyễn Văn An</span>
            <span className="text-slate-500 text-[11px]">Giảng viên • gv.an@edu.vn</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('gv.binh@edu.vn')}
            className="text-left px-2.5 py-2 rounded border border-slate-200 hover:bg-stone-50 transition-colors"
          >
            <span className="font-semibold text-slate-900 block">ThS. Trần Thị Bình</span>
            <span className="text-slate-500 text-[11px]">Giảng viên • gv.binh@edu.vn</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@edu.vn')}
            className="text-left px-2.5 py-2 rounded border border-slate-200 hover:bg-stone-50 transition-colors"
          >
            <span className="font-semibold text-slate-900 block">Phòng Đào tạo</span>
            <span className="text-slate-500 text-[11px]">Quản trị • admin@edu.vn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
