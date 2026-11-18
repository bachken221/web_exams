import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Play,
  XCircle,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { Exam, ExamAttempt } from '../../types/exam.types';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDateTimeVN } from '../../utils/formatTime';

interface StudentOverviewData {
  exams: Exam[];
  history: ExamAttempt[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmingExam, setConfirmingExam] = useState<Exam | null>(null);

  const { data, loading, error, setError } = useAsyncData<StudentOverviewData>(
    async () => {
      const [exams, history] = await Promise.all([
        examService.getExams(),
        examService.getMyHistory(),
      ]);
      return { exams, history };
    },
    [],
    {
      initialData: { exams: [], history: [] },
      fallbackError: 'Không thể tải dữ liệu tổng quan sinh viên',
    }
  );

  if (loading) return <LoadingSpinner message="Đang tải không gian học tập của bạn..." />;

  const { exams, history } = data;
  const totalAttempts = history.length;
  const passedCount = history.filter((h) => h.is_passed).length;
  const avgScore =
    totalAttempts > 0
      ? (history.reduce((sum, item) => sum + item.score, 0) / totalAttempts).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-white border border-slate-200 rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Cổng Khảo thí Sinh viên
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Xin chào, {user?.full_name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Chọn đề thi đang mở bên dưới để bắt đầu làm bài hoặc xem lại kết quả và lời giải chi tiết trong lịch sử thi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/student/exams"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
          >
            <BookOpen className="w-4 h-4" />
            <span>Tất cả đề thi ({exams.length})</span>
          </Link>
          <Link
            to="/student/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-white hover:bg-stone-50 text-slate-700 border border-slate-300"
          >
            <History className="w-4 h-4" />
            <span>Kết quả đã thi</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đề thi đang mở
            </span>
            <BookOpen className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{exams.length}</p>
          <p className="text-xs text-slate-500 mt-1">Sẵn sàng vào phòng thi trực tuyến</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng lượt đã dự thi
            </span>
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalAttempts}</p>
          <p className="text-xs text-slate-500 mt-1">
            Số lượt đạt chuẩn: <strong className="text-emerald-700">{passedCount}</strong>/{totalAttempts}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Điểm trung bình cá nhân
            </span>
            <Award className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{avgScore} / 10</p>
          <p className="text-xs text-slate-500 mt-1">Tính trên tất cả các lượt nộp bài</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Đề thi học phần đang mở</h2>
          <Link to="/student/exams" className="text-xs font-semibold text-teal-700 hover:underline">
            Xem tất cả đề thi →
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
                  Học phần: {exam.subject_name} • GV: {exam.creator_name}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">{exam.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{exam.question_count}</span> câu •
                  Đạt: <span className="font-semibold text-slate-900">{exam.pass_score}/10</span>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmingExam(exam)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Vào thi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Kết quả làm bài gần đây</h2>
          <Link to="/student/history" className="text-xs font-semibold text-teal-700 hover:underline">
            Xem toàn bộ lịch sử
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Môn học</th>
                <th className="py-3 px-4">Đề thi</th>
                <th className="py-3 px-4">Số câu đúng</th>
                <th className="py-3 px-4">Điểm số</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian nộp</th>
                <th className="py-3 px-4 text-right">Xem giải thích</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {history.length > 0 ? (
                history.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
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
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/student/results/${item.id}`}
                        className="inline-block px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-semibold"
                      >
                        Xem đáp án
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Bạn chưa tham gia bài thi nào. Hãy chọn một đề thi phía trên để bắt đầu!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup xác nhận vào phòng thi */}
      <ConfirmModal
        isOpen={Boolean(confirmingExam)}
        title="Xác nhận bắt đầu làm bài thi"
        message="Khi bắt đầu, đồng hồ sẽ đếm ngược ngay lập tức và bạn không thể chuyển sang trang khác cho đến khi nộp bài."
        details={
          confirmingExam
            ? [
                {
                  label: 'Học phần',
                  value: `${confirmingExam.subject_code} - ${confirmingExam.subject_name}`,
                },
                { label: 'Đề thi', value: confirmingExam.title },
                { label: 'Thời gian làm bài', value: `${confirmingExam.duration_minutes} phút` },
                { label: 'Số lượng câu hỏi', value: `${confirmingExam.question_count} câu` },
                {
                  label: 'Điểm chuẩn đạt',
                  value: `${confirmingExam.pass_score.toFixed(1)} / 10`,
                },
              ]
            : []
        }
        confirmText="Xác nhận vào phòng thi"
        cancelText="Để sau"
        variant="primary"
        onConfirm={() => {
          if (confirmingExam) {
            navigate(`/student/exams/${confirmingExam.id}/take`);
          }
        }}
        onCancel={() => setConfirmingExam(null)}
      />
    </div>
  );
};
