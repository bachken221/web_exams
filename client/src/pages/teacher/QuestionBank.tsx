import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Edit3, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { questionService } from '../../services/questionService';
import { Exam, Question } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';

export const QuestionBank: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const { error, successMsg, showError, showSuccess, setError, setSuccessMsg } =
    useNotification();

  // State Modal Thêm / Sửa câu hỏi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [content, setContent] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State Popup Xác nhận Lưu câu hỏi
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // State Popup Xác nhận Xóa câu hỏi
  const [deletingTarget, setDeletingTarget] = useState<{ q: Question; index: number } | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const {
    data,
    setData,
    loading,
    error: fetchError,
    reload,
  } = useAsyncData<{ exam: Exam | null; questions: Question[] }>(
    async () => {
      if (!examId) return { exam: null, questions: [] };
      return await questionService.getQuestionsByExam(Number(examId));
    },
    [examId],
    {
      initialData: { exam: null, questions: [] },
      fallbackError: 'Không thể tải danh sách câu hỏi',
      onForbidden: () => navigate('/403', { replace: true }),
    }
  );

  const { exam, questions } = data;

  const openCreateModal = () => {
    setEditingQuestion(null);
    setContent('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setExplanation('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setContent(q.content);
    setOptionA(q.option_a);
    setOptionB(q.option_b);
    setOptionC(q.option_c);
    setOptionD(q.option_d);
    setCorrectOption(q.correct_option);
    setExplanation(q.explanation || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleRequestSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !content.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      setFormError('Vui lòng nhập đầy đủ nội dung câu hỏi và cả 4 phương án A, B, C, D');
      return;
    }

    setIsSaveConfirmOpen(true);
  };

  const confirmSaveQuestion = async () => {
    setSubmitting(true);
    try {
      const payload = {
        content: content.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_option: correctOption,
        explanation: explanation.trim(),
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, payload);
        showSuccess('Đã cập nhật câu hỏi thành công');
      } else {
        await questionService.createQuestion(Number(examId), payload);
        showSuccess('Đã thêm câu hỏi mới vào đề thi');
      }
      setIsSaveConfirmOpen(false);
      setIsModalOpen(false);
      reload();
    } catch (err) {
      setIsSaveConfirmOpen(false);
      setFormError(getErrorMessage(err, 'Lỗi khi lưu câu hỏi'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await questionService.deleteQuestion(deletingTarget.q.id);
      showSuccess(`Đã xóa câu hỏi số ${deletingTarget.index + 1}`);
      setData((prev) => ({
        ...prev,
        questions: prev.questions.filter((item) => item.id !== deletingTarget.q.id),
      }));
      setDeletingTarget(null);
    } catch (err) {
      showError(err, 'Không thể xóa câu hỏi');
      setDeletingTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải ngân hàng câu hỏi..." />;

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
            Ngân hàng câu hỏi: {exam?.title}
          </h2>
          <p className="text-xs text-slate-500">
            Học phần: <strong>{exam?.subject_code} - {exam?.subject_name}</strong> • Tổng số câu hiện tại:{' '}
            <strong className="text-teal-700">{questions.length} câu hỏi</strong>
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
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

      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-white text-xs font-bold shrink-0">
                    Câu {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-stone-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingTarget({ q, index: idx })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </button>
                </div>
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
                  const isCorrect = q.correct_option === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded border flex items-start justify-between gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                          : 'bg-stone-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold mr-2">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          Đáp án đúng
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3 rounded bg-stone-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Giải thích đáp án: </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-md p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Đề thi này chưa có câu hỏi nào. Hãy nhấn <strong>"Thêm câu hỏi mới"</strong> để biên soạn câu hỏi.
            </p>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Câu hỏi */}
      <Modal
        isOpen={isModalOpen}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi trắc nghiệm' : 'Thêm câu hỏi trắc nghiệm mới'}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRequestSaveQuestion} className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương án A
              </label>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="Nội dung đáp án A..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương án B
              </label>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="Nội dung đáp án B..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương án C
              </label>
              <input
                type="text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="Nội dung đáp án C..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương án D
              </label>
              <input
                type="text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                placeholder="Nội dung đáp án D..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đáp án đúng chuẩn
            </label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold text-emerald-700 focus:outline-none focus:border-teal-700"
            >
              <option value="A">Đáp án A</option>
              <option value="B">Đáp án B</option>
              <option value="C">Đáp án C</option>
              <option value="D">Đáp án D</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lời giải thích chi tiết (Hiển thị cho sinh viên sau khi nộp bài)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích vì sao đáp án này đúng..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {editingQuestion ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Popup 1: Xác nhận Lưu câu hỏi */}
      <ConfirmModal
        isOpen={isSaveConfirmOpen}
        title={editingQuestion ? 'Xác nhận cập nhật câu hỏi' : 'Xác nhận thêm câu hỏi mới'}
        message={
          editingQuestion
            ? 'Bạn có chắc chắn muốn lưu các thay đổi cho câu hỏi trắc nghiệm này không?'
            : 'Xác nhận bổ sung câu hỏi mới vào ngân hàng câu hỏi của đề thi này?'
        }
        details={[
          { label: 'Đề thi', value: exam?.title || '' },
          { label: 'Đáp án đúng chuẩn', value: `Phương án ${correctOption}` },
        ]}
        confirmText={editingQuestion ? 'Xác nhận lưu' : 'Xác nhận thêm'}
        cancelText="Kiểm tra lại"
        variant="primary"
        loading={submitting}
        onConfirm={confirmSaveQuestion}
        onCancel={() => setIsSaveConfirmOpen(false)}
      />

      {/* Popup 2: Xác nhận Xóa câu hỏi */}
      <ConfirmModal
        isOpen={Boolean(deletingTarget)}
        title="Xác nhận xóa câu hỏi"
        message={
          deletingTarget
            ? `Bạn có chắc chắn muốn xóa Câu hỏi số ${deletingTarget.index + 1} khỏi đề thi này không?`
            : ''
        }
        details={
          deletingTarget
            ? [
                { label: 'Câu hỏi', value: `Câu số ${deletingTarget.index + 1}` },
                { label: 'Đáp án đúng', value: `Phương án ${deletingTarget.q.correct_option}` },
              ]
            : []
        }
        confirmText="Xóa câu hỏi"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteQuestion}
        onCancel={() => setDeletingTarget(null)}
      />
    </div>
  );
};
