import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { examService } from '../../services/examService';
import { AttemptDetailResponse, Exam, ExamAttempt } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePagination } from '../../hooks/usePagination';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTimeVN } from '../../utils/formatTime';

export const StudentResults: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [selectedAttemptDetail, setSelectedAttemptDetail] =
    useState<AttemptDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    data,
    loading,
    error,
    setError,
  } = useAsyncData<{ exam: Exam | null; results: ExamAttempt[] }>(
    async () => {
      if (!examId) return { exam: null, results: [] };
      return await examService.getExamResults(Number(examId));
    },
    [examId],
    {
      initialData: { exam: null, results: [] },
      fallbackError: 'Không thể tải bảng điểm sinh viên',
      onForbidden: () => navigate('/403', { replace: true }),
    }
  );

  const { exam, results } = data;
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(
    results,
    10
  );

  const handleViewStudentPaper = async (attemptId: number) => {
    setDetailLoading(true);
    try {
      const detail = await examService.getAttemptDetail(attemptId);
      setSelectedAttemptDetail(detail);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải bài làm chi tiết của sinh viên'));
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải bảng điểm sinh viên..." />;

  const passCount = results.filter((r) => r.is_passed).length;
  const avgScore =
    results.length > 0
      ? (results.reduce((acc, cur) => acc + cur.score, 0) / results.length).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách đề thi</span>
          </Link>
          <h2 className="text-base font-bold text-slate-900">
            Bảng điểm & Kết quả Sinh viên: {exam?.title}
          </h2>
          <p className="text-xs text-slate-500">
            Học phần: <strong>{exam?.subject_code} - {exam?.subject_name}</strong> • Điểm chuẩn đạt:{' '}
            <strong>{exam?.pass_score.toFixed(1)}/10</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs bg-stone-50 border border-slate-200 px-4 py-2.5 rounded">
          <div>
            <span className="text-slate-500 block">Tổng lượt nộp</span>
            <strong className="text-sm text-slate-900">{results.length} lượt</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block">Điểm TB</span>
            <strong className="text-sm text-teal-700">{avgScore} / 10</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block">Số lượt Đạt</span>
            <strong className="text-sm text-emerald-700">
              {passCount}/{results.length}
            </strong>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Họ và tên sinh viên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số câu đúng</th>
                <th className="py-3 px-4">Điểm số (Thang 10)</th>
                <th className="py-3 px-4">Kết quả</th>
                <th className="py-3 px-4">Thời gian nộp bài</th>
                <th className="py-3 px-4 text-right">Chi tiết bài làm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((r, index) => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 text-slate-500">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-3 px-4 text-slate-600">{r.student_email}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {r.total_correct} / {r.total_questions} câu
                    </td>
                    <td className="py-3 px-4 font-bold text-sm text-slate-900">
                      {r.score.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {r.is_passed ? (
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
                      {formatDateTimeVN(r.submitted_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={detailLoading}
                        onClick={() => handleViewStudentPaper(r.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        <span>Xem bài làm</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Chưa có sinh viên nào nộp bài cho đề thi này.
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

      <Modal
        isOpen={Boolean(selectedAttemptDetail)}
        title={
          selectedAttemptDetail
            ? `Chi tiết bài làm: ${selectedAttemptDetail.attempt.student_name} (${selectedAttemptDetail.attempt.score.toFixed(2)}/10 điểm)`
            : 'Chi tiết bài làm'
        }
        onClose={() => setSelectedAttemptDetail(null)}
        maxWidth="max-w-3xl"
      >
        {selectedAttemptDetail && (
          <div className="space-y-4">
            <div className="p-3.5 rounded bg-stone-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                Sinh viên: <strong>{selectedAttemptDetail.attempt.student_name}</strong> (
                {selectedAttemptDetail.attempt.student_email})
              </div>
              <div>
                Số câu đúng:{' '}
                <strong>
                  {selectedAttemptDetail.attempt.total_correct}/
                  {selectedAttemptDetail.attempt.total_questions}
                </strong>
              </div>
              <div>
                Thời gian nộp:{' '}
                <strong>{formatDateTimeVN(selectedAttemptDetail.attempt.submitted_at)}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {selectedAttemptDetail.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded border border-slate-200 bg-white space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      Câu {idx + 1}: {q.content}
                    </p>
                    {q.is_correct ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold shrink-0">
                        Đúng
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold shrink-0">
                        Sai ({q.selected_option ? `Chọn ${q.selected_option}` : 'Bỏ trống'})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    Đáp án sinh viên chọn:{' '}
                    <strong className={q.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                      {q.selected_option || 'Không chọn'}
                    </strong>{' '}
                    • Đáp án đúng của đề: <strong className="text-emerald-700">{q.correct_option}</strong>
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
