import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDateTimeVN } from '../../utils/formatTime';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const {
    error: pwdError,
    successMsg: pwdSuccess,
    showError,
    showSuccess,
    setError,
    setSuccessMsg,
  } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [isConfirmPwdOpen, setIsConfirmPwdOpen] = useState(false);

  useEffect(() => {
    const syncMe = async () => {
      try {
        const fresh = await authService.getMe();
        updateCurrentUser(fresh);
      } catch {
        // Bỏ qua nếu lỗi mạng tạm thời
      }
    };
    syncMe();
  }, []);

  const handleRequestChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Vui lòng điền đầy đủ các trường mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setIsConfirmPwdOpen(true);
  };

  const confirmChangePassword = async () => {
    setPwdLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showSuccess('Đổi mật khẩu đăng nhập thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsConfirmPwdOpen(false);
    } catch (err) {
      setIsConfirmPwdOpen(false);
      showError(err, 'Đổi mật khẩu thất bại');
    } finally {
      setPwdLoading(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'teacher') return 'Giảng viên';
    return 'Sinh viên';
  };

  const initials = (user?.full_name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-teal-700" />
          Hồ sơ Tài khoản Cá nhân
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Xem thông tin định danh tài khoản và thiết lập mật khẩu đăng nhập hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái: Thẻ tóm tắt tài khoản */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-slate-800 text-white flex items-center justify-center text-base font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-medium rounded bg-stone-100 border border-slate-300 text-slate-700">
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Mã định danh
              </span>
              <span className="font-semibold text-slate-900">#{user?.id}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Trạng thái
              </span>
              <span className="font-semibold text-emerald-700">Đang hoạt động</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ngày tham gia
              </span>
              <span className="font-medium text-slate-800">
                {formatDateTimeVN(user?.created_at)}
              </span>
            </div>

            {user?.role === 'student' && (
              <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>Số bài thi đã hoàn thành</span>
                <span className="font-bold text-teal-700">{user.attempt_count ?? 0} bài</span>
              </div>
            )}

            {user?.role === 'teacher' && (
              <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>Số đề thi đang phụ trách</span>
                <span className="font-bold text-teal-700">
                  {user.created_exam_count ?? 0} đề thi
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thông tin định danh (Chỉ xem) & Đổi mật khẩu */}
        <div className="lg:col-span-8 space-y-5">
          {/* Khung 1: Thông tin định danh cố định (Không cho phép tự sửa) */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-3.5 bg-stone-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Thông tin định danh</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 border border-slate-300 text-[11px] font-medium text-slate-600">
                <Lock className="w-3 h-3" />
                Chỉ xem
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={user?.full_name || ''}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-stone-100 text-slate-600 cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md bg-stone-100 text-slate-600 cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Thông tin họ tên và địa chỉ email được cố định theo hồ sơ quản lý đào tạo. Nếu cần điều chỉnh thông tin cá nhân, vui lòng liên hệ Quản trị viên hệ thống.
              </p>
            </div>
          </div>

          {/* Khung 2: Đổi mật khẩu */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-3.5 bg-stone-50 border-b border-slate-200 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Đổi mật khẩu đăng nhập</h3>
            </div>

            <form onSubmit={handleRequestChangePassword} className="p-5 space-y-4">
              {pwdError && (
                <AlertBanner type="error" message={pwdError} onClose={() => setError('')} />
              )}
              {pwdSuccess && (
                <AlertBanner
                  type="success"
                  message={pwdSuccess}
                  onClose={() => setSuccessMsg('')}
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mật khẩu mới (tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={pwdLoading}>
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popup xác nhận đổi mật khẩu */}
      <ConfirmModal
        isOpen={isConfirmPwdOpen}
        title="Xác nhận thay đổi mật khẩu"
        message="Bạn có chắc chắn muốn cập nhật mật khẩu đăng nhập mới cho tài khoản của mình không?"
        details={[
          { label: 'Họ và tên', value: user?.full_name || '' },
          { label: 'Email đăng nhập', value: user?.email || '' },
        ]}
        confirmText="Xác nhận đổi mật khẩu"
        cancelText="Hủy"
        variant="primary"
        loading={pwdLoading}
        onConfirm={confirmChangePassword}
        onCancel={() => setIsConfirmPwdOpen(false)}
      />
    </div>
  );
};
