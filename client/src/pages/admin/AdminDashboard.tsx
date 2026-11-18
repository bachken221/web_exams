import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookCopy,
  CheckCircle2,
  Eye,
  FileCheck2,
  Users,
  XCircle,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { examService } from '../../services/examService';
import { AdminDashboardStats } from '../../types/user.types';
import { AttemptDetailResponse } from '../../types/exam.types';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { formatDateTimeVN } from '../../utils/formatTime';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const {
    data: stats,
    loading,
    error,
    setError,
  } = useAsyncData<AdminDashboardStats | null>(
    () => userService.getAdminDashboardStats(),
    [],
    {
      initialData: null,
      fallbackError: 'Không thể tải dữ liệu báo cáo',
    }
  );

  const handleInspectAttempt = async (attemptId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await examService.getAttemptDetail(attemptId);
      setSelectedAttempt(detail);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải chi tiết bài thi'));
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tổng hợp số liệu đào tạo & khảo thí..." />;

  const totalAttempts = stats?.total_attempts || 0;
  const dist = stats?.score_distribution || { excellent: 0, good: 0, average: 0, fail: 0 };
  const pct = (val: number) => (totalAttempts > 0 ? Math.round((val / totalAttempts) * 100) : 0);

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      {/* Banner chào mừng đồng nhất với trang Sinh viên & Giảng viên */}
      <div className="bg-white border border-slate-200 rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Cổng Quản trị Đào tạo & Khảo thí
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Xin chào, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Theo dõi số liệu khảo thí toàn trường, quản lý phân quyền tài khoản, danh mục học phần và kiểm duyệt đề thi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Users className="w-4 h-4" />
            <span>Quản lý tài khoản ({stats?.total_users ?? 0})</span>
          </Link>
          <Link
            to="/admin/subjects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-white hover:bg-stone-50 text-slate-700 border border-slate-300"
          >
            <BookCopy className="w-4 h-4" />
            <span>Danh mục học phần</span>
          </Link>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-white hover:bg-stone-50 text-slate-700 border border-slate-300"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Kiểm duyệt đề thi</span>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ thống kê đồng nhất với trang Sinh viên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng tài khoản
            </span>
            <Users className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.total_users ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            <strong className="text-slate-800">{stats?.total_students ?? 0}</strong> Sinh viên •{' '}
            <strong className="text-slate-800">{stats?.total_teachers ?? 0}</strong> Giảng viên
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Học phần & Câu hỏi
            </span>
            <BookCopy className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.total_subjects ?? 0} môn</p>
          <p className="text-xs text-slate-500 mt-1">
            Tổng ngân hàng: <strong className="text-teal-700">{stats?.total_questions ?? 0} câu hỏi</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đề thi hệ thống
            </span>
            <FileCheck2 className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.total_exams ?? 0} đề</p>
          <p className="text-xs text-slate-500 mt-1">
            Đang mở thi: <strong className="text-emerald-700">{stats?.published_exams ?? 0}</strong> đề
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lượt bài đã nộp
            </span>
            <Award className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.total_attempts ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            Điểm TB: <strong className="text-slate-900">{stats?.average_score?.toFixed(2) ?? '0.00'}</strong> •
            Đạt: <strong className="text-emerald-700">{stats?.pass_rate ?? 0}%</strong>
          </p>
        </div>
      </div>

      {/* Khối giữa: Phân bố phổ điểm & Thống kê theo từng Học phần */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Phân bố phổ điểm bài thi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng hợp trên {totalAttempts} lượt bài đã chấm
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Xuất sắc / Giỏi (8.5 – 10)</span>
                <span className="font-bold text-slate-900">
                  {dist.excellent} bài ({pct(dist.excellent)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${pct(dist.excellent)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Khá (7.0 – 8.4)</span>
                <span className="font-bold text-slate-900">
                  {dist.good} bài ({pct(dist.good)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-teal-600"
                  style={{ width: `${pct(dist.good)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Trung bình / Đạt (5.0 – 6.9)</span>
                <span className="font-bold text-slate-900">
                  {dist.average} bài ({pct(dist.average)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${pct(dist.average)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Chưa đạt (&lt; 5.0)</span>
                <span className="font-bold text-rose-700">
                  {dist.fail} bài ({pct(dist.fail)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-rose-600"
                  style={{ width: `${pct(dist.fail)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Tài khoản đang tạm khóa:</span>
            <span className="font-bold text-rose-700">{stats?.locked_users ?? 0} tài khoản</span>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Thống kê chất lượng khảo thí theo học phần
              </h3>
              <p className="text-xs text-slate-500">
                Số lượng đề thi, lượt làm bài và tỷ lệ qua môn của từng học phần
              </p>
            </div>
            <Link
              to="/admin/subjects"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Quản lý học phần →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Mã HP</th>
                  <th className="py-3 px-4">Tên học phần</th>
                  <th className="py-3 px-4 text-center">Số đề thi</th>
                  <th className="py-3 px-4 text-center">Lượt dự thi</th>
                  <th className="py-3 px-4 text-center">Điểm TB</th>
                  <th className="py-3 px-4 text-right">Tỷ lệ đạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {stats?.subject_stats && stats.subject_stats.length > 0 ? (
                  stats.subject_stats.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800">
                          {sub.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{sub.name}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{sub.exam_count}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{sub.attempt_count}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sub.attempt_count > 0 ? sub.avg_score.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {sub.attempt_count > 0 ? (
                          <span className="font-semibold text-emerald-700">{sub.pass_rate}%</span>
                        ) : (
                          <span className="text-slate-400">Chưa có lượt thi</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Chưa có dữ liệu học phần.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Khối dưới: Bài thi vừa nộp gần đây & Danh sách tài khoản mới */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Kết quả nộp bài gần đây</h3>
            <Link
              to="/admin/exams"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Xem toàn bộ đề thi
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Sinh viên</th>
                  <th className="py-3 px-4">Đề thi</th>
                  <th className="py-3 px-4">Điểm số</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian nộp</th>
                  <th className="py-3 px-4 text-right">Phiếu thi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {stats?.recent_attempts && stats.recent_attempts.length > 0 ? (
                  stats.recent_attempts.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{item.student_name}</p>
                        <p className="text-[11px] text-slate-500">{item.student_email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800 mr-1.5">
                          {item.subject_code}
                        </span>
                        <span className="font-medium text-slate-900">{item.exam_title}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.score.toFixed(2)}
                        <span className="text-slate-400 font-normal ml-1">
                          ({item.total_correct}/{item.total_questions})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.is_passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-rose-700 bg-rose-50 border-rose-200 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            Chưa đạt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDateTimeVN(item.submitted_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={loadingDetail}
                          onClick={() => handleInspectAttempt(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-700" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Chưa có lượt nộp bài nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Tài khoản mới tham gia</h3>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Tất cả →
            </Link>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {stats?.recent_users && stats.recent_users.length > 0 ? (
              stats.recent_users.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{u.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${
                      u.role === 'admin'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : u.role === 'teacher'
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {u.role === 'admin'
                      ? 'Quản trị'
                      : u.role === 'teacher'
                      ? 'Giảng viên'
                      : 'Sinh viên'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500">Chưa có dữ liệu.</div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedAttempt)}
        title={
          selectedAttempt
            ? `Phiếu kết quả bài thi: ${selectedAttempt.attempt.student_name} (${selectedAttempt.attempt.score.toFixed(2)}/10)`
            : 'Chi tiết bài thi'
        }
        onClose={() => setSelectedAttempt(null)}
        maxWidth="max-w-3xl"
      >
        {selectedAttempt && (
          <div className="space-y-4">
            <div className="p-3.5 rounded bg-stone-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                Sinh viên: <strong>{selectedAttempt.attempt.student_name}</strong>
              </div>
              <div>
                Học phần: <strong>{selectedAttempt.attempt.subject_code}</strong>
              </div>
              <div>
                Số câu đúng:{' '}
                <strong>
                  {selectedAttempt.attempt.total_correct}/
                  {selectedAttempt.attempt.total_questions}
                </strong>
              </div>
            </div>

            <div className="space-y-2.5">
              {selectedAttempt.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded border border-slate-200 bg-white space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      Câu {idx + 1}: {q.content}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold shrink-0 ${
                        q.is_correct
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {q.is_correct ? 'Đúng' : 'Sai'}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Phương án sinh viên chọn:{' '}
                    <strong className={q.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                      {q.selected_option || 'Bỏ trống'}
                    </strong>{' '}
                    • Đáp án đúng: <strong className="text-emerald-700">{q.correct_option}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
