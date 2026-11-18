import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, History, RotateCcw, XCircle } from 'lucide-react';
import { examService } from '../../services/examService';
import { ExamAttempt } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePagination } from '../../hooks/usePagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTimeVN } from '../../utils/formatTime';

export const ExamHistory: React.FC = () => {
  const navigate = useNavigate();
  const [retakeTarget, setRetakeTarget] = useState<ExamAttempt | null>(null);

  const {
    data: history,
    loading,
    error,
    setError,
  } = useAsyncData<ExamAttempt[]>(
    () => examService.getMyHistory(),
    [],
    {
      initialData: [],
      fallbackError: 'Lỗi khi tải lịch sử thi cá nhân',
    }
  );

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(
    history,
    8
  );

  if (loading) return <LoadingSpinner message="Đang tải lịch sử làm bài của bạn..." />;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-700" />
          Kết quả đã thi & Bảng điểm cá nhân
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi toàn bộ các lượt dự thi của bạn, xem lại đáp án chi tiết kèm lời giải thích của giảng viên.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Mã lượt thi</th>
                <th className="py-3 px-4">Học phần</th>
                <th className="py-3 px-4">Tên đề thi</th>
                <th className="py-3 px-4">Số câu đúng</th>
                <th className="py-3 px-4">Điểm số / Điểm chuẩn</th>
                <th className="py-3 px-4">Kết quả</th>
                <th className="py-3 px-4">Thời gian nộp bài</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-semibold text-slate-600">#{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800">
                        {item.subject_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.exam_title}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.total_correct} / {item.total_questions} câu
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm text-slate-900">
                        {item.score.toFixed(2)}
                      </span>{' '}
                      <span className="text-slate-500">
                        (Đạt: {item.pass_score.toFixed(1)})
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
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/student/results/${item.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-700" />
                          <span>Xem lời giải</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setRetakeTarget(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Thi lại</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Bạn chưa có lượt làm bài nào trong lịch sử.{' '}
                    <Link to="/student/exams" className="font-semibold text-teal-700 hover:underline">
                      Khám phá danh sách đề thi ngay →
                    </Link>
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

      {/* Popup xác nhận thi lại */}
      <ConfirmModal
        isOpen={Boolean(retakeTarget)}
        title="Xác nhận thi lại đề thi"
        message="Bạn có chắc chắn muốn bắt đầu lượt làm bài mới cho đề thi này không? Đồng hồ sẽ đếm ngược ngay khi vào phòng thi."
        details={
          retakeTarget
            ? [
                {
                  label: 'Học phần',
                  value: `${retakeTarget.subject_code} - ${retakeTarget.subject_name}`,
                },
                { label: 'Đề thi', value: retakeTarget.exam_title },
                { label: 'Thời gian làm bài', value: `${retakeTarget.duration_minutes} phút` },
                { label: 'Điểm chuẩn đạt', value: `${retakeTarget.pass_score.toFixed(1)} / 10` },
              ]
            : []
        }
        confirmText="Xác nhận vào phòng thi"
        cancelText="Hủy"
        variant="primary"
        onConfirm={() => {
          if (retakeTarget) {
            navigate(`/student/exams/${retakeTarget.exam_id}/take`);
          }
        }}
        onCancel={() => setRetakeTarget(null)}
      />
    </div>
  );
};
