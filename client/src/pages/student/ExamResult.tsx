import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { AttemptDetailResponse } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDateTimeVN } from '../../utils/formatTime';

export const ExamResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);

  const {
    data: detail,
    loading,
    error,
  } = useAsyncData<AttemptDetailResponse | null>(
    async () => {
      if (!attemptId) return null;
      return await examService.getAttemptDetail(Number(attemptId));
    },
    [attemptId],
    {
      initialData: null,
      fallbackError: 'Không thể tải kết quả bài thi',
      onForbidden: () => navigate('/403', { replace: true }),
    }
  );

  if (loading) return <LoadingSpinner message="Đang tải kết quả chấm điểm và lời giải chi tiết..." />;

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error || 'Không tìm thấy kết quả'} />
        <Link
          to="/student/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại lịch sử thi
        </Link>
      </div>
    );
  }

  const { attempt, questions } = detail;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-md p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-stone-100 border border-slate-300 text-slate-800">
              {attempt.subject_code} - {attempt.subject_name}
            </span>
            <h1 className="text-xl font-bold text-slate-900 pt-1">{attempt.exam_title}</h1>
            <p className="text-xs text-slate-500">
              Thời gian nộp bài: <strong>{formatDateTimeVN(attempt.submitted_at)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Điểm số đạt được</span>
              <span className="text-3xl font-bold text-slate-900">
                {attempt.score.toFixed(2)}{' '}
                <span className="text-base font-normal text-slate-500">/ 10</span>
              </span>
            </div>

            {attempt.is_passed ? (
              <div className="px-4 py-2.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>ĐẠT YÊU CẦU</span>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded border text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-2 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>CHƯA ĐẠT</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded bg-stone-50 border border-slate-200">
            <span className="text-slate-500 block">Số câu trả lời đúng</span>
            <strong className="text-sm text-slate-900">
              {attempt.total_correct} / {attempt.total_questions} câu
            </strong>
          </div>
          <div className="p-3.5 rounded bg-stone-50 border border-slate-200">
            <span className="text-slate-500 block">Điểm chuẩn qua môn</span>
            <strong className="text-sm text-slate-900">{attempt.pass_score.toFixed(1)} / 10</strong>
          </div>
          <div className="p-3.5 rounded bg-stone-50 border border-slate-200">
            <span className="text-slate-500 block">Thời lượng đề thi</span>
            <strong className="text-sm text-slate-900">{attempt.duration_minutes} phút</strong>
          </div>
          <div className="p-3.5 rounded bg-stone-50 border border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsRetakeModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:underline"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại đề này</span>
            </button>
            <Link
              to="/student/history"
              className="font-semibold text-slate-600 hover:underline"
            >
              Lịch sử thi
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Chi tiết đáp án & giải thích ({questions.length} câu hỏi)
        </h2>

        {questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-white border border-slate-200 rounded-md p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-white text-xs font-bold shrink-0">
                  Câu {index + 1}
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.content}
                </p>
              </div>

              {q.is_correct ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Trả lời đúng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-rose-700 bg-rose-50 border-rose-200 text-xs font-bold shrink-0">
                  <XCircle className="w-3.5 h-3.5" />
                  {q.selected_option ? `Trả lời sai (Chọn ${q.selected_option})` : 'Chưa trả lời'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {(
                [
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d },
                ] as const
              ).map((opt) => {
                const isCorrectOption = q.correct_option === opt.key;
                const isUserSelected = q.selected_option === opt.key;

                let boxClass = 'bg-stone-50 border-slate-200 text-slate-700';
                if (isCorrectOption) {
                  boxClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold';
                } else if (isUserSelected && !isCorrectOption) {
                  boxClass = 'bg-rose-50 border-rose-200 text-rose-800 font-semibold';
                }

                return (
                  <div
                    key={opt.key}
                    className={`p-3 rounded border flex items-start justify-between gap-2 ${boxClass}`}
                  >
                    <div>
                      <span className="font-bold mr-2">{opt.key}.</span>
                      <span>{opt.text}</span>
                    </div>
                    {isCorrectOption && (
                      <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                        ✓ Đáp án đúng
                      </span>
                    )}
                    {isUserSelected && !isCorrectOption && (
                      <span className="text-[11px] font-bold text-rose-700 shrink-0">
                        ✗ Bạn đã chọn
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="p-3.5 rounded bg-stone-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Giải thích của giảng viên: </span>
                  <span>{q.explanation}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popup xác nhận làm lại đề thi */}
      <ConfirmModal
        isOpen={isRetakeModalOpen}
        title="Xác nhận làm lại đề thi"
        message="Bạn sắp bắt đầu một lượt làm bài mới cho đề thi này. Đồng hồ sẽ đếm ngược ngay khi vào phòng thi."
        details={[
          { label: 'Học phần', value: `${attempt.subject_code} - ${attempt.subject_name}` },
          { label: 'Đề thi', value: attempt.exam_title },
          { label: 'Thời gian làm bài', value: `${attempt.duration_minutes} phút` },
          { label: 'Số lượng câu hỏi', value: `${attempt.total_questions} câu` },
        ]}
        confirmText="Xác nhận vào phòng thi"
        cancelText="Hủy"
        variant="primary"
        onConfirm={() => navigate(`/student/exams/${attempt.exam_id}/take`)}
        onCancel={() => setIsRetakeModalOpen(false)}
      />
    </div>
  );
};
