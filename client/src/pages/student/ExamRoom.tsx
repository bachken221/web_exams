import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useExamSession } from '../../hooks/useExamSession';
import { formatSecondsToMMSS } from '../../utils/formatTime';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Button } from '../../components/common/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const ExamRoom: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    exam,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    flaggedIds,
    remainingSeconds,
    loading,
    submitting,
    error,
    setError,
    selectOption,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExamPaper,
  } = useExamSession(Number(examId), user?.id);

  // Modal xác nhận nộp bài thi (Thay thế window.confirm để hoạt động ổn định trên mọi trình duyệt)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  if (loading) {
    return <LoadingSpinner message="Đang tải đề thi và thiết lập phòng thi trực tuyến..." />;
  }

  if (!exam || !currentQuestion || questions.length === 0) {
    return (
      <div className="space-y-4">
        <AlertBanner
          type="error"
          message={error || 'Không thể tải dữ liệu phòng thi lúc này'}
        />
        <Button variant="outline" onClick={() => navigate('/student/exams')}>
          Quay lại danh sách đề thi
        </Button>
      </div>
    );
  }

  const selectedChoice = answers[String(currentQuestion.id)];
  const isFlagged = flaggedIds.includes(currentQuestion.id);
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isLowTime = remainingSeconds !== null && remainingSeconds <= 60;

  return (
    <div className="space-y-5">
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      {/* Thanh thông tin đề thi & đồng hồ đếm ngược */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-20 shadow-sm">
        <div>
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-stone-100 border border-slate-300 text-slate-800">
            {exam.subject_code} - {exam.subject_name}
          </span>
          <h1 className="text-base font-bold text-slate-900 mt-1">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded border font-mono text-base font-bold ${
              isLowTime
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-stone-50 border-slate-300 text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatSecondsToMMSS(remainingSeconds ?? 0)}</span>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={submitting}
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Đang chấm điểm...' : 'Nộp bài thi'}</span>
          </Button>
        </div>
      </div>

      {/* Bố cục 2 cột: Khung câu hỏi (8/12) & Bảng điều hướng câu hỏi (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded bg-teal-700 text-white text-xs font-bold">
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              {selectedChoice && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  Đã chọn: {selectedChoice}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold transition-colors ${
                isFlagged
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-slate-600 bg-white border-slate-300 hover:bg-stone-50'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isFlagged ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
            </button>
          </div>

          <div className="text-base font-semibold text-slate-900 leading-relaxed">
            {currentQuestion.content}
          </div>

          <div className="space-y-3">
            {(
              [
                { key: 'A', text: currentQuestion.option_a },
                { key: 'B', text: currentQuestion.option_b },
                { key: 'C', text: currentQuestion.option_c },
                { key: 'D', text: currentQuestion.option_d },
              ] as const
            ).map((opt) => {
              const isSelected = selectedChoice === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => selectOption(currentQuestion.id, opt.key)}
                  className={`w-full text-left p-4 rounded border flex items-start gap-3 transition-colors ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-700 text-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-stone-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-stone-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === 0}
              onClick={prevQuestion}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </Button>

            <span className="text-xs text-slate-500">
              Đã trả lời: <strong>{answeredCount}</strong> / {questions.length} câu
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === questions.length - 1}
              onClick={nextQuestion}
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sơ đồ câu hỏi bài thi */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sơ đồ câu hỏi</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn số thứ tự để chuyển nhanh tới câu hỏi tương ứng
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const hasAnswered = Boolean(answers[String(q.id)]);
              const isQuestionFlagged = flaggedIds.includes(q.id);
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50';
              if (isQuestionFlagged) {
                btnStyle = 'text-amber-700 bg-amber-50 border-amber-300 font-bold';
              } else if (hasAnswered) {
                btnStyle = 'text-emerald-700 bg-emerald-50 border-emerald-300 font-bold';
              }

              if (isCurrent) {
                btnStyle += ' ring-2 ring-teal-700 ring-offset-1';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={`h-10 rounded border text-xs flex items-center justify-center relative transition-colors ${btnStyle}`}
                >
                  {idx + 1}
                  {isQuestionFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-emerald-300 bg-emerald-50 inline-block" />
              <span>Đã chọn đáp án ({answeredCount} câu)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-amber-300 bg-amber-50 inline-block" />
              <span>Cần xem lại ({flaggedIds.length} câu)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-slate-300 bg-white inline-block" />
              <span>Chưa trả lời ({unansweredCount} câu)</span>
            </div>
          </div>

          <div className="p-3 rounded bg-stone-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Trong thời gian làm bài, bạn không thể chuyển sang các mục khác trên thanh menu. Hãy nhấn "Nộp bài thi" khi đã hoàn thành.
            </span>
          </div>
        </div>
      </div>

      {/* Modal xác nhận nộp bài thi */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        title="Xác nhận nộp bài thi"
        message={
          unansweredCount > 0
            ? `Bạn hiện còn ${unansweredCount}/${questions.length} câu hỏi chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài và kết thúc lượt thi ngay bây giờ không?`
            : `Bạn đã trả lời đầy đủ ${answeredCount}/${questions.length} câu hỏi. Xác nhận nộp bài thi để hệ thống chấm điểm?`
        }
        confirmText="Nộp bài ngay"
        cancelText="Tiếp tục làm bài"
        variant="primary"
        loading={submitting}
        onConfirm={submitExamPaper}
        onCancel={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
};
