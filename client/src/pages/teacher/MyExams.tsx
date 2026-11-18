import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  FileCheck2,
  ListChecks,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { Exam, Subject } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';

export const MyExams: React.FC = () => {
  const { error, successMsg, showError, showSuccess, setError, setSuccessMsg } =
    useNotification();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // State Modal Thêm / Sửa đề thi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [subjectId, setSubjectId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [passScore, setPassScore] = useState<number>(5.0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State Popup Xác nhận Lưu đề thi (Tạo mới / Cập nhật)
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // State Popup Xác nhận Mở / Đóng đề thi
  const [togglingExam, setTogglingExam] = useState<Exam | null>(null);
  const [toggling, setToggling] = useState(false);

  // State Popup Xác nhận Xóa đề thi
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
      if (subjects.length > 0 && !subjectId) {
        setSubjectId(subjects[0].id);
      }
      return { exams, subjects };
    },
    [selectedSubject],
    {
      initialData: { exams: [], subjects: [] },
      fallbackError: 'Lỗi khi tải danh sách đề thi của bạn',
    }
  );

  const { exams, subjects } = data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    reload();
  };

  const openCreateModal = () => {
    setEditingExam(null);
    setSubjectId(subjects[0]?.id || 0);
    setTitle('');
    setDescription('');
    setDurationMinutes(20);
    setPassScore(5.0);
    setIsPublished(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setSubjectId(exam.subject_id);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setDurationMinutes(exam.duration_minutes);
    setPassScore(exam.pass_score);
    setIsPublished(exam.is_published);
    setFormError('');
    setIsModalOpen(true);
  };

  // Kiểm tra dữ liệu form và mở Popup xác nhận trước khi lưu
  const handleRequestSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!subjectId) {
      setFormError('Vui lòng chọn học phần');
      return;
    }
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề đề thi');
      return;
    }
    if (durationMinutes <= 0 || durationMinutes > 300) {
      setFormError('Thời gian làm bài phải từ 1 đến 300 phút');
      return;
    }
    if (passScore < 0 || passScore > 10) {
      setFormError('Điểm chuẩn qua môn phải từ 0 đến 10');
      return;
    }

    setIsSaveConfirmOpen(true);
  };

  const confirmSaveExam = async () => {
    setSubmitting(true);
    try {
      const payload = {
        subject_id: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
        duration_minutes: Number(durationMinutes),
        pass_score: Number(passScore),
        is_published: isPublished,
      };

      if (editingExam) {
        await examService.updateExam(editingExam.id, payload);
        showSuccess(`Đã cập nhật thông tin đề thi "${title.trim()}"`);
      } else {
        await examService.createExam(payload);
        showSuccess(`Đã tạo đề thi mới "${title.trim()}"`);
      }
      setIsSaveConfirmOpen(false);
      setIsModalOpen(false);
      reload();
    } catch (err) {
      setIsSaveConfirmOpen(false);
      setFormError(getErrorMessage(err, 'Lỗi khi lưu đề thi'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmTogglePublish = async () => {
    if (!togglingExam) return;
    setToggling(true);
    try {
      const res = await examService.togglePublish(togglingExam.id);
      showSuccess(
        res.is_published
          ? `Đã mở đề thi "${togglingExam.title}" cho sinh viên làm bài`
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
      showError(err, 'Lỗi khi đổi trạng thái đề thi');
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
      showError(err, 'Không thể xóa đề thi');
      setDeletingExam(null);
    } finally {
      setDeleting(false);
    }
  };

  const selectedSubjectObj = subjects.find((s) => s.id === Number(subjectId));

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-700" />
            Danh sách Đề thi Học phần Phụ trách
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo đề thi theo học phần, biên soạn câu hỏi trắc nghiệm và theo dõi kết quả dự thi của sinh viên.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>Tạo đề thi mới</span>
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

      {/* Thanh tìm kiếm & lọc học phần */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">Học phần:</span>
          <button
            type="button"
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              selectedSubject === 'all'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50'
            }`}
          >
            Tất cả môn học
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSubject(String(s.id))}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                selectedSubject === String(s.id)
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50'
              }`}
            >
              {s.code} - {s.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên đề hoặc mã môn..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Danh sách thẻ đề thi */}
      {loading ? (
        <LoadingSpinner message="Đang tải danh sách đề thi..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-stone-100 border border-slate-300 text-slate-800">
                      {exam.subject_code} • {exam.subject_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-stone-100 border border-slate-300 text-xs font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        {exam.duration_minutes} phút
                      </span>
                      {exam.is_published ? (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded border text-emerald-700 bg-emerald-50 border-emerald-200">
                          Đang mở
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded border text-amber-700 bg-amber-50 border-amber-200">
                          Tạm đóng
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">{exam.title}</h2>
                  {exam.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{exam.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span>
                      Số câu hỏi: <strong className="text-teal-700">{exam.question_count} câu</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Điểm chuẩn đạt: <strong className="text-slate-900">{exam.pass_score.toFixed(1)}/10</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Lượt dự thi: <strong className="text-slate-900">{exam.attempt_count} lượt</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/teacher/exams/${exam.id}/questions`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
                    >
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>Câu hỏi ({exam.question_count})</span>
                    </Link>

                    <Link
                      to={`/teacher/exams/${exam.id}/results`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-stone-50"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Bảng điểm ({exam.attempt_count})</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTogglingExam(exam)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-stone-50"
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
                      onClick={() => openEditModal(exam)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-stone-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
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
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-md p-10 text-center text-sm text-slate-500">
              Không tìm thấy đề thi nào phù hợp. Hãy nhấn <strong>"Tạo đề thi mới"</strong> để bắt đầu.
            </div>
          )}
        </div>
      )}

      {/* Modal Tạo / Sửa Đề thi */}
      <Modal
        isOpen={isModalOpen}
        title={editingExam ? 'Chỉnh sửa thông tin đề thi' : 'Tạo đề thi trắc nghiệm mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleRequestSaveExam} className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Học phần / Môn học
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-teal-700"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề đề thi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi Giữa kỳ Phát triển Ứng dụng Web"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả / Hướng dẫn làm bài
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú nội dung ôn tập hoặc quy định làm bài..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian làm bài (phút)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm đạt chuẩn (Thang 10)
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={10}
                value={passScore}
                onChange={(e) => setPassScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="publish-checkbox"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-teal-700"
            />
            <label htmlFor="publish-checkbox" className="text-xs font-medium text-slate-700">
              Mở đề thi ngay (Cho phép sinh viên nhìn thấy và vào thi)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {editingExam ? 'Cập nhật đề thi' : 'Tạo đề thi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Popup 1: Xác nhận Tạo mới / Cập nhật Đề thi */}
      <ConfirmModal
        isOpen={isSaveConfirmOpen}
        title={editingExam ? 'Xác nhận cập nhật đề thi' : 'Xác nhận tạo đề thi mới'}
        message={
          editingExam
            ? 'Bạn có chắc chắn muốn lưu các thay đổi cho đề thi này không?'
            : 'Vui lòng kiểm tra lại thông tin cấu hình trước khi khởi tạo đề thi mới trên hệ thống.'
        }
        details={[
          {
            label: 'Học phần',
            value: selectedSubjectObj
              ? `${selectedSubjectObj.code} - ${selectedSubjectObj.name}`
              : '',
          },
          { label: 'Tiêu đề đề thi', value: title.trim() },
          { label: 'Thời gian làm bài', value: `${durationMinutes} phút` },
          { label: 'Điểm chuẩn đạt', value: `${Number(passScore).toFixed(1)} / 10` },
          {
            label: 'Trạng thái công bố',
            value: isPublished ? 'Mở thi ngay' : 'Tạm đóng (Bản nháp)',
          },
        ]}
        confirmText={editingExam ? 'Xác nhận lưu' : 'Xác nhận tạo đề'}
        cancelText="Kiểm tra lại"
        variant="primary"
        loading={submitting}
        onConfirm={confirmSaveExam}
        onCancel={() => setIsSaveConfirmOpen(false)}
      />

      {/* Popup 2: Xác nhận Mở / Tạm đóng Đề thi */}
      <ConfirmModal
        isOpen={Boolean(togglingExam)}
        title={
          togglingExam?.is_published
            ? 'Xác nhận tạm đóng đề thi'
            : 'Xác nhận mở đề thi cho sinh viên'
        }
        message={
          togglingExam?.is_published
            ? 'Khi tạm đóng, sinh viên sẽ không thể nhìn thấy hoặc vào làm bài đề thi này cho đến khi bạn mở lại.'
            : 'Khi mở đề thi, sinh viên thuộc học phần này sẽ nhìn thấy đề thi và có thể bắt đầu vào phòng thi ngay lập tức.'
        }
        details={
          togglingExam
            ? [
                {
                  label: 'Học phần',
                  value: `${togglingExam.subject_code} - ${togglingExam.subject_name}`,
                },
                { label: 'Đề thi', value: togglingExam.title },
                { label: 'Số câu hỏi hiện có', value: `${togglingExam.question_count} câu` },
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

      {/* Popup 3: Xác nhận Xóa đề thi */}
      <ConfirmModal
        isOpen={Boolean(deletingExam)}
        title="Xác nhận xóa đề thi"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn đề thi này? Toàn bộ câu hỏi và kết quả bài làm của sinh viên thuộc đề thi sẽ bị xóa."
        details={
          deletingExam
            ? [
                {
                  label: 'Học phần',
                  value: `${deletingExam.subject_code} - ${deletingExam.subject_name}`,
                },
                { label: 'Đề thi', value: deletingExam.title },
                { label: 'Dữ liệu liên quan', value: `${deletingExam.question_count} câu hỏi • ${deletingExam.attempt_count} lượt thi` },
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
