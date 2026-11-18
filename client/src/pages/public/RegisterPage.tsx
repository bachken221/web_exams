import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Button } from '../../components/common/Button';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithData } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return false;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
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
      const data = await authService.register(fullName.trim(), email.trim(), password);
      loginWithData(data.token, data.user);
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900">Đăng ký tài khoản sinh viên</h1>
        <p className="text-xs text-slate-500 mt-1">
          Điền thông tin cá nhân bên dưới để tạo tài khoản tham gia các kỳ thi học phần
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
            Họ và tên sinh viên
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sinhvien@edu.vn"
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
            placeholder="Tối thiểu 6 ký tự..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nhập lại mật khẩu
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
          />
        </div>

        <Button type="submit" variant="primary" className="w-full py-2.5" disabled={loading}>
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}</span>
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-teal-700 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};
