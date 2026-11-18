import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  ListChecks,
  Plus,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { Exam } from '../../types/exam.types';
import { TeacherDashboardStats } from '../../types/user.types';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { formatDateTimeVN } from '../../utils/formatTime';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    setError,
  } = useAsyncData<{ stats: TeacherDashboardStats | null; exams: Exam[] }>(
    async () => {
      const [stats, exams] = await Promise.all([
        examService.getTeacherDashboardStats(),
        examService.getExams(),
      ]);
      return { stats, exams };
    },
    [],
    {
      initialData: { stats: null, exams: [] },
      fallbackError: 'Không thể tải dữ liệu tổng quan giảng viên',
    }
  );

  if (loading) return <LoadingSpinner message="Đang tải không gian làm việc của giảng viên..." />;

  const { stats, exams } = data;

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      {/* Banner chào mừng đồng nhất với trang Sinh viên */}
      <div className="bg-white border border-slate-200 rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Cổng Thông tin Giảng viên
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Xin chào, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Quản lý đề thi các học phần phụ trách, biên soạn ngân hàng câu hỏi trắc nghiệm và theo dõi kết quả dự thi của sinh viên.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Quản lý đề thi ({exams.length})</span>
          </Link>
          <Link
            to="/teacher/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-white hover:bg-stone-50 text-slate-700 border border-slate-300"
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ thống kê đồng nhất với trang Sinh viên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đề thi phụ trách
            </span>
            <FileCheck2 className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.total_exams ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đang mở thi: <strong className="text-teal-700">{stats?.published_exams ?? 0}</strong> đề
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ngân hàng câu hỏi
            </span>
            <HelpCircle className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.total_questions ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Câu hỏi trắc nghiệm có lời giải
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng lượt dự thi
            </span>
            <Users className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.total_attempts ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Điểm trung bình: <strong className="text-slate-800">{stats?.average_score ?? 0}/10</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tỷ lệ đạt chuẩn
            </span>
            <Award className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.pass_rate ?? 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Số lượt đạt: <strong className="text-emerald-700">{stats?.passed_attempts ?? 0}</strong>/{stats?.total_attempts ?? 0}
          </p>
        </div>
      </div>

      {/* Lưới thẻ Đề thi đang phụ trách (Đồng nhất bố cục với trang Sinh viên) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Đề thi học phần đang phụ trách</h2>
          <Link to="/teacher/exams" className="text-xs font-semibold text-teal-700 hover:underline">
            Quản lý tất cả đề thi →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.slice(0, 3).map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-stone-100 border border-slate-300 text-slate-800">
                    {exam.subject_code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    {exam.duration_minutes} phút
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-500">
                  Học phần: {exam.subject_name} • Điểm đạt: {exam.pass_score.toFixed(1)}/10
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">{exam.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900">{exam.question_count}</strong> câu •{' '}
                  <strong className="text-slate-900">{exam.attempt_count}</strong> lượt thi
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/teacher/exams/${exam.id}/questions`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Câu hỏi</span>
                  </Link>
                  <Link
                    to={`/teacher/exams/${exam.id}/results`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-stone-50"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Điểm</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng kết quả làm bài gần đây */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Kết quả nộp bài gần đây của sinh viên
          </h2>
          <Link to="/teacher/exams" className="text-xs font-semibold text-teal-700 hover:underline">
            Xem bảng điểm theo đề
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Sinh viên</th>
                <th className="py-3 px-4">Học phần</th>
                <th className="py-3 px-4">Đề thi</th>
                <th className="py-3 px-4">Số câu đúng</th>
                <th className="py-3 px-4">Điểm số</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {stats?.recent_attempts && stats.recent_attempts.length > 0 ? (
                stats.recent_attempts.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.student_name}</p>
                      <p className="text-slate-500">{item.student_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800">
                        {item.subject_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.exam_title}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.total_correct}/{item.total_questions} câu
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.score.toFixed(2)} / 10
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Chưa có sinh viên nào làm bài trên các đề thi của bạn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
