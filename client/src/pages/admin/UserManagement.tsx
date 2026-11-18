import React, { useState } from 'react';
import { Edit3, Lock, Plus, Search, Trash2, Unlock, Users } from 'lucide-react';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types/auth.types';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useNotification } from '../../hooks/useNotification';
import { usePagination } from '../../hooks/usePagination';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTimeVN } from '../../utils/formatTime';

export const UserManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { error, successMsg, showError, showSuccess, setError, setSuccessMsg } =
    useNotification();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modal Tạo tài khoản mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<UserRole>('teacher');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);

  // Modal Chỉnh sửa thông tin & Đặt lại mật khẩu
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [resetPassword, setResetPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);

  // Popup Xác nhận Khóa / Mở khóa tài khoản
  const [lockingUser, setLockingUser] = useState<User | null>(null);
  const [locking, setLocking] = useState(false);

  // Popup Xác nhận Xóa tài khoản
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: users,
    setData: setUsers,
    loading,
    error: fetchError,
    reload,
  } = useAsyncData<User[]>(
    () =>
      userService.getAllUsers({
        role: roleFilter,
        search: searchKeyword,
      }),
    [roleFilter],
    {
      initialData: [],
      fallbackError: 'Lỗi khi tải danh sách tài khoản',
    }
  );

  const { currentPage, totalPages, paginatedItems, setCurrentPage, resetPage } =
    usePagination(users, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    resetPage();
    reload();
  };

  const getRoleName = (r: UserRole) =>
    r === 'admin' ? 'Quản trị viên' : r === 'teacher' ? 'Giảng viên' : 'Sinh viên';

  const handleRequestCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
      return;
    }
    if (password.length < 6) {
      setFormError('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    setIsConfirmCreateOpen(true);
  };

  const confirmCreateUser = async () => {
    setSubmitting(true);
    try {
      await userService.createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      showSuccess(`Đã tạo tài khoản cho ${fullName.trim()}`);
      setIsConfirmCreateOpen(false);
      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('123456');
      setRole('teacher');
      reload();
    } catch (err) {
      setIsConfirmCreateOpen(false);
      setFormError(getErrorMessage(err, 'Không thể tạo tài khoản'));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.full_name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setResetPassword('');
    setEditError('');
  };

  const handleRequestUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editName.trim() || !editEmail.trim()) {
      setEditError('Họ tên và email không được để trống');
      return;
    }
    if (resetPassword.trim() && resetPassword.trim().length < 6) {
      setEditError('Mật khẩu đặt lại phải từ 6 ký tự trở lên');
      return;
    }

    setIsConfirmEditOpen(true);
  };

  const confirmUpdateUser = async () => {
    if (!editingUser) return;
    setEditSubmitting(true);
    try {
      await userService.updateUser(editingUser.id, {
        full_name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        new_password: resetPassword.trim() ? resetPassword.trim() : undefined,
      });
      showSuccess(`Đã cập nhật thông tin tài khoản "${editName.trim()}"`);
      setIsConfirmEditOpen(false);
      setEditingUser(null);
      reload();
    } catch (err) {
      setIsConfirmEditOpen(false);
      setEditError(getErrorMessage(err, 'Không thể cập nhật tài khoản'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const confirmToggleLock = async () => {
    if (!lockingUser) return;
    setLocking(true);
    try {
      const res = await userService.toggleLock(lockingUser.id);
      showSuccess(
        res.is_locked
          ? `Đã tạm khóa tài khoản "${lockingUser.full_name}"`
          : `Đã mở khóa tài khoản "${lockingUser.full_name}"`
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === lockingUser.id ? { ...u, is_locked: res.is_locked } : u))
      );
      setLockingUser(null);
    } catch (err) {
      showError(err, 'Không thể thay đổi trạng thái khóa');
      setLockingUser(null);
    } finally {
      setLocking(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deletingUser.id);
      showSuccess(`Đã xóa tài khoản "${deletingUser.full_name}"`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      showError(err, 'Không thể xóa tài khoản');
      setDeletingUser(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Quản lý Tài khoản Người dùng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấp tài khoản giảng viên, điều chỉnh thông tin, đặt lại mật khẩu và quản lý quyền truy cập hệ thống.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Thêm tài khoản mới</span>
        </Button>
      </div>

      {(error || fetchError) && (
        <AlertBanner
          type="error"
          message={error || fetchError}
          onClose={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
      )}

      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">Vai trò:</span>
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'student', label: 'Sinh viên' },
            { value: 'teacher', label: 'Giảng viên' },
            { value: 'admin', label: 'Quản trị viên' },
            { value: 'locked', label: 'Đang bị khóa' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                roleFilter === tab.value
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo họ tên hoặc email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tải danh sách người dùng..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Mã số</th>
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Hoạt động</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;
                    const initials = u.full_name
                      .split(' ')
                      .filter(Boolean)
                      .slice(-2)
                      .map((w) => w[0]?.toUpperCase())
                      .join('');

                    return (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4 font-semibold text-slate-600">#{u.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded bg-stone-100 border border-slate-300 text-slate-800 font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {u.full_name}
                                {isSelf && (
                                  <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-teal-50 border border-teal-200 text-teal-800">
                                    Đang đăng nhập
                                  </span>
                                )}
                              </p>
                              <p className="text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded border font-semibold ${
                              u.role === 'admin'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : u.role === 'teacher'
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-teal-50 text-teal-800 border-teal-200'
                            }`}
                          >
                            {getRoleName(u.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.role === 'student' && (
                            <span>
                              Đã thi: <strong>{u.attempt_count ?? 0}</strong> lượt
                            </span>
                          )}
                          {u.role === 'teacher' && (
                            <span>
                              Đề đã tạo: <strong>{u.created_exam_count ?? 0}</strong> đề
                            </span>
                          )}
                          {u.role === 'admin' && <span>Quản trị hệ thống</span>}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_locked ? (
                            <span className="inline-block px-2 py-0.5 rounded border text-rose-700 bg-rose-50 border-rose-200 font-semibold">
                              Tạm khóa
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                              Hoạt động
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateTimeVN(u.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>

                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setLockingUser(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium disabled:opacity-40 ${
                                u.is_locked
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {u.is_locked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Khóa
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Không tìm thấy tài khoản nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal Thêm tài khoản mới */}
      <Modal
        isOpen={isCreateModalOpen}
        title="Tạo tài khoản mới"
        onClose={() => setIsCreateModalOpen(false)}
      >
        <form onSubmit={handleRequestCreateUser} className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: TS. Lê Văn Hùng"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gv.hung@edu.vn"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu khởi tạo
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò trên hệ thống
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="teacher">Giảng viên</option>
              <option value="student">Sinh viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chỉnh sửa tài khoản & Đặt lại mật khẩu */}
      <Modal
        isOpen={Boolean(editingUser)}
        title={editingUser ? `Chỉnh sửa tài khoản: ${editingUser.full_name}` : 'Chỉnh sửa'}
        onClose={() => setEditingUser(null)}
      >
        <form onSubmit={handleRequestUpdateUser} className="space-y-4">
          {editError && <AlertBanner type="error" message={editError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò
            </label>
            <select
              disabled={editingUser?.id === currentAdmin?.id}
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white disabled:opacity-50"
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đặt lại mật khẩu mới (Để trống nếu giữ nguyên mật khẩu cũ)
            </label>
            <input
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới nếu cần cấp lại..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={editSubmitting}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Popup 1: Xác nhận Tạo tài khoản mới */}
      <ConfirmModal
        isOpen={isConfirmCreateOpen}
        title="Xác nhận cấp tài khoản mới"
        message="Vui lòng kiểm tra lại thông tin định danh và phân quyền trước khi tạo tài khoản trên hệ thống."
        details={[
          { label: 'Họ và tên', value: fullName.trim() },
          { label: 'Email đăng nhập', value: email.trim() },
          { label: 'Vai trò cấp phát', value: getRoleName(role) },
        ]}
        confirmText="Xác nhận tạo"
        cancelText="Kiểm tra lại"
        variant="primary"
        loading={submitting}
        onConfirm={confirmCreateUser}
        onCancel={() => setIsConfirmCreateOpen(false)}
      />

      {/* Popup 2: Xác nhận Lưu chỉnh sửa thông tin / Đặt lại mật khẩu */}
      <ConfirmModal
        isOpen={isConfirmEditOpen}
        title="Xác nhận cập nhật tài khoản"
        message="Bạn có chắc chắn muốn áp dụng các thay đổi thông tin và quyền hạn cho tài khoản này không?"
        details={[
          { label: 'Họ và tên mới', value: editName.trim() },
          { label: 'Email đăng nhập', value: editEmail.trim() },
          { label: 'Vai trò', value: getRoleName(editRole) },
          {
            label: 'Mật khẩu',
            value: resetPassword.trim() ? 'Đặt lại mật khẩu mới' : 'Giữ nguyên mật khẩu cũ',
          },
        ]}
        confirmText="Xác nhận cập nhật"
        cancelText="Quay lại"
        variant="primary"
        loading={editSubmitting}
        onConfirm={confirmUpdateUser}
        onCancel={() => setIsConfirmEditOpen(false)}
      />

      {/* Popup 3: Xác nhận Khóa / Mở khóa tài khoản */}
      <ConfirmModal
        isOpen={Boolean(lockingUser)}
        title={
          lockingUser?.is_locked
            ? 'Xác nhận mở khóa tài khoản'
            : 'Xác nhận tạm khóa tài khoản'
        }
        message={
          lockingUser?.is_locked
            ? 'Khi mở khóa, người dùng này có thể đăng nhập và sử dụng lại các chức năng trên hệ thống.'
            : 'Khi bị khóa, người dùng này sẽ bị chặn đăng nhập và ngắt quyền truy cập hệ thống ngay lập tức.'
        }
        details={
          lockingUser
            ? [
                { label: 'Họ và tên', value: lockingUser.full_name },
                { label: 'Email', value: lockingUser.email },
                { label: 'Vai trò', value: getRoleName(lockingUser.role) },
                {
                  label: 'Trạng thái mới',
                  value: lockingUser.is_locked ? 'Mở hoạt động trở lại' : 'Tạm khóa tài khoản',
                },
              ]
            : []
        }
        confirmText={lockingUser?.is_locked ? 'Xác nhận mở khóa' : 'Xác nhận khóa'}
        cancelText="Hủy"
        variant={lockingUser?.is_locked ? 'primary' : 'amber'}
        loading={locking}
        onConfirm={confirmToggleLock}
        onCancel={() => setLockingUser(null)}
      />

      {/* Popup 4: Xác nhận Xóa tài khoản */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này khỏi hệ thống? Toàn bộ dữ liệu liên quan của người dùng sẽ bị xóa."
        details={
          deletingUser
            ? [
                { label: 'Họ và tên', value: deletingUser.full_name },
                { label: 'Email', value: deletingUser.email },
                { label: 'Vai trò', value: getRoleName(deletingUser.role) },
              ]
            : []
        }
        confirmText="Xóa tài khoản"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
