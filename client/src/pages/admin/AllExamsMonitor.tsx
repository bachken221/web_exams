import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  ListChecks,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { questionService } from '../../services/questionService';
import { Exam, ExamAttempt, Question, Subject } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useNotification } from '../../hooks/useNotification';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';
import { formatDateTimeVN } from '../../utils/formatTime';

export const AllExamsMonitor: React.FC = () => {
  const { error, successMsg, showError, showSuccess, setError, setSuccessMsg } =
    useNotification();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'closed'>('all');
  const [search, setSearch] = useState<string>('');

  // Modal Xem danh sách câu hỏi của đề thi
  const [inspectingExam, setInspectingExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Modal Xem bảng điểm sinh viên của đề thi
  const [resultsExam, setResultsExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<ExamAttempt[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Popup Xác nhận Mở / Tạm đóng đề thi
  const [togglingExam, setTogglingExam] = useState<Exam | null>(null);
  const [toggling, setToggling] = useState(false);

  // Popup Xác nhận Xóa đề thi
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data,
    setData,
    loading,
    error: fetchError,
    reload,
  } = useAsyncData<{ exams: Exam[]; subjects: Subject[] }>(
    async () => {
      const [exams, subjects] = await Promise.all([
        examService.getExams({ subject_id: selectedSubject, search }),
        subjectService.getAllSubjects(),
      ]);
      return { exams, subjects };
    },
    [selectedSubject],
    {
      initialData: { exams: [], subjects: [] },
      fallbackError: 'Lỗi khi tải danh sách đề thi',
    }
  );

  const { exams, subjects } = data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    reload();
  };

  const handleInspectQuestions = async (exam: Exam) => {
    setInspectingExam(exam);
    setLoadingQuestions(true);
    try {
      const res = await questionService.getQuestionsByExam(exam.id);
      setExamQuestions(res.questions);
    } catch (err) {
      showError(err, 'Không thể tải câu hỏi của đề thi');
      setInspectingExam(null);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleViewResults = async (exam: Exam) => {
    setResultsExam(exam);
    setLoadingResults(true);
    try {
      const res = await examService.getExamResults(exam.id);
      setExamResults(res.results);
    } catch (err) {
      showError(err, 'Không thể tải bảng điểm của đề thi');
      setResultsExam(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const confirmTogglePublish = async () => {
    if (!togglingExam) return;
    setToggling(true);
    try {
      const res = await examService.togglePublish(togglingExam.id);
      showSuccess(
        res.is_published
          ? `Đã mở đề thi "${togglingExam.title}"`
          : `Đã tạm đóng đề thi "${togglingExam.title}"`
      );
      setData((prev) => ({
        ...prev,
        exams: prev.exams.map((item) =>
          item.id === togglingExam.id ? { ...item, is_published: res.is_published } : item
        ),
      }));
      setTogglingExam(null);
    } catch (err) {
      showError(err, 'Không thể thay đổi trạng thái đề thi');
      setTogglingExam(null);
    } finally {
      setToggling(false);
    }
  };

  const confirmDeleteExam = async () => {
    if (!deletingExam) return;
    setDeleting(true);
    try {
      await examService.deleteExam(deletingExam.id);
      showSuccess(`Đã xóa đề thi "${deletingExam.title}"`);
      setData((prev) => ({
        ...prev,
        exams: prev.exams.filter((item) => item.id !== deletingExam.id),
      }));
      setDeletingExam(null);
    } catch (err) {
      showError(err, 'Lỗi khi xóa đề thi');
      setDeletingExam(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredExams = exams.filter((ex) => {
    if (statusFilter === 'published') return ex.is_published;
    if (statusFilter === 'closed') return !ex.is_published;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-teal-700" />
          Quản lý & Kiểm duyệt Đề thi Toàn trường
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi toàn bộ đề thi của các học phần, xem chi tiết câu hỏi, tra cứu bảng điểm hoặc đóng/mở đề thi.
        </p>
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

      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Học phần:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">Tất cả học phần</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'published', label: 'Đang mở thi' },
              { key: 'closed', label: 'Đang tạm đóng' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusFilter(st.key as any)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  statusFilter === st.key
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên đề thi, mã môn..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tải danh sách đề thi..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Học phần</th>
                  <th className="py-3 px-4">Đề thi</th>
                  <th className="py-3 px-4">Giảng viên</th>
                  <th className="py-3 px-4">Cấu hình</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800">
                          {exam.subject_code}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">{exam.subject_name}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900">{exam.title}</p>
                        <p className="text-slate-500 line-clamp-1 mt-0.5">{exam.description}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {exam.creator_name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 space-y-0.5">
                        <p>
                          Thời gian: <strong>{exam.duration_minutes} phút</strong> • Đạt:{' '}
                          <strong>{exam.pass_score.toFixed(1)}/10</strong>
                        </p>
                        <p className="text-slate-500">
                          <strong>{exam.question_count}</strong> câu hỏi •{' '}
                          <strong>{exam.attempt_count}</strong> lượt nộp bài
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {exam.is_published ? (
                          <span className="inline-block px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                            Đang mở thi
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded border text-amber-700 bg-amber-50 border-amber-200 font-semibold">
                            Tạm đóng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInspectQuestions(exam)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                            title="Xem danh sách câu hỏi và đáp án"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-teal-700" />
                            <span>Câu hỏi ({exam.question_count})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewResults(exam)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                            title="Xem bảng điểm sinh viên"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
                            <span>Điểm ({exam.attempt_count})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTogglingExam(exam)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                          >
                            {exam.is_published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                <span>Đóng</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mở</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingExam(exam)}
                            className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Xóa đề thi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Không tìm thấy đề thi nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Kiểm duyệt nội dung câu hỏi của đề thi */}
      <Modal
        isOpen={Boolean(inspectingExam)}
        title={
          inspectingExam
            ? `Nội dung câu hỏi: ${inspectingExam.title} (${examQuestions.length} câu)`
            : 'Danh sách câu hỏi'
        }
        onClose={() => setInspectingExam(null)}
        maxWidth="max-w-3xl"
      >
        {loadingQuestions ? (
          <LoadingSpinner message="Đang tải câu hỏi..." />
        ) : examQuestions.length > 0 ? (
          <div className="space-y-4 text-xs">
            {examQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded border border-slate-200 bg-white space-y-2.5">
                <p className="font-bold text-slate-900">
                  Câu {idx + 1}: {q.content}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'A', val: q.option_a },
                      { key: 'B', val: q.option_b },
                      { key: 'C', val: q.option_c },
                      { key: 'D', val: q.option_d },
                    ] as const
                  ).map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded border ${
                        q.correct_option === opt.key
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                          : 'bg-stone-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-1.5">{opt.key}.</span>
                      <span>{opt.val}</span>
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-slate-600 bg-stone-50 p-2.5 rounded border border-slate-200">
                    <strong>Giải thích:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            Đề thi này chưa có câu hỏi nào.
          </p>
        )}
      </Modal>

      {/* Modal 2: Xem bảng điểm sinh viên của đề thi */}
      <Modal
        isOpen={Boolean(resultsExam)}
        title={resultsExam ? `Bảng điểm sinh viên: ${resultsExam.title}` : 'Bảng điểm'}
        onClose={() => setResultsExam(null)}
        maxWidth="max-w-3xl"
      >
        {loadingResults ? (
          <LoadingSpinner message="Đang tải bảng điểm..." />
        ) : examResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Sinh viên</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Số câu đúng</th>
                  <th className="py-2.5 px-3">Điểm số</th>
                  <th className="py-2.5 px-3">Kết quả</th>
                  <th className="py-2.5 px-3">Thời gian nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {examResults.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {r.student_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{r.student_email}</td>
                    <td className="py-2.5 px-3">
                      {r.total_correct}/{r.total_questions}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {r.score.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.is_passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Đạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                          <XCircle className="w-3 h-3" />
                          Không đạt
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {formatDateTimeVN(r.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            Chưa có sinh viên nào nộp bài ở đề thi này.
          </p>
        )}
      </Modal>

      {/* Popup 1: Xác nhận Mở / Tạm đóng đề thi (Admin) */}
      <ConfirmModal
        isOpen={Boolean(togglingExam)}
        title={
          togglingExam?.is_published
            ? 'Xác nhận tạm đóng đề thi'
            : 'Xác nhận mở đề thi cho sinh viên'
        }
        message={
          togglingExam?.is_published
            ? 'Khi tạm đóng đề thi này, sinh viên sẽ không thể vào phòng thi cho đến khi đề được mở lại.'
            : 'Xác nhận mở công bố đề thi này để sinh viên có thể bắt đầu làm bài?'
        }
        details={
          togglingExam
            ? [
                {
                  label: 'Học phần',
                  value: `${togglingExam.subject_code} - ${togglingExam.subject_name}`,
                },
                { label: 'Đề thi', value: togglingExam.title },
                { label: 'Giảng viên phụ trách', value: togglingExam.creator_name },
                {
                  label: 'Trạng thái mới',
                  value: togglingExam.is_published ? 'Tạm đóng' : 'Đang mở thi',
                },
              ]
            : []
        }
        confirmText={togglingExam?.is_published ? 'Xác nhận đóng đề' : 'Xác nhận mở đề'}
        cancelText="Hủy"
        variant={togglingExam?.is_published ? 'amber' : 'primary'}
        loading={toggling}
        onConfirm={confirmTogglePublish}
        onCancel={() => setTogglingExam(null)}
      />

      {/* Popup 2: Xác nhận Xóa đề thi */}
      <ConfirmModal
        isOpen={Boolean(deletingExam)}
        title="Xác nhận xóa đề thi"
        message="Bạn có chắc chắn muốn gỡ bỏ đề thi này khỏi hệ thống? Toàn bộ câu hỏi và kết quả thi liên quan sẽ bị xóa vĩnh viễn."
        details={
          deletingExam
            ? [
                {
                  label: 'Học phần',
                  value: `${deletingExam.subject_code} - ${deletingExam.subject_name}`,
                },
                { label: 'Đề thi', value: deletingExam.title },
                { label: 'Giảng viên phụ trách', value: deletingExam.creator_name },
                {
                  label: 'Dữ liệu liên quan',
                  value: `${deletingExam.question_count} câu hỏi • ${deletingExam.attempt_count} lượt thi`,
                },
              ]
            : []
        }
        confirmText="Xóa đề thi"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteExam}
        onCancel={() => setDeletingExam(null)}
      />
    </div>
  );
};
