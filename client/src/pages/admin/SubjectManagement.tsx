import React, { useState } from 'react';
import { BookCopy, Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import { examService } from '../../services/examService';
import { Exam, Subject } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../utils/error';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';
import { formatDateTimeVN } from '../../utils/formatTime';

export const SubjectManagement: React.FC = () => {
  const { error, successMsg, showError, showSuccess, setError, setSuccessMsg } =
    useNotification();

  const [search, setSearch] = useState('');

  // Modal Thêm / Sửa học phần
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Popup Xác nhận Lưu học phần
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // Popup Xác nhận Xóa học phần
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal Xem danh sách đề thi thuộc học phần
  const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
  const [subjectExams, setSubjectExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const {
    data: subjects,
    setData: setSubjects,
    loading,
    error: fetchError,
    reload,
  } = useAsyncData<Subject[]>(() => subjectService.getAllSubjects(), [], {
    initialData: [],
    fallbackError: 'Không thể tải danh sách học phần',
  });

  const openCreateModal = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setDescription(subject.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleViewSubjectExams = async (subject: Subject) => {
    setViewingSubject(subject);
    setLoadingExams(true);
    try {
      const exams = await examService.getExams({ subject_id: subject.id });
      setSubjectExams(exams);
    } catch {
      setSubjectExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleRequestSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim() || !name.trim()) {
      setFormError('Vui lòng nhập đầy đủ Mã học phần và Tên học phần');
      return;
    }

    setIsSaveConfirmOpen(true);
  };

  const confirmSaveSubject = async () => {
    setSubmitting(true);
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
        });
        showSuccess(`Đã cập nhật học phần "${code.trim().toUpperCase()}"`);
      } else {
        await subjectService.createSubject({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
        });
        showSuccess(`Đã thêm học phần mới "${code.trim().toUpperCase()}"`);
      }
      setIsSaveConfirmOpen(false);
      setIsModalOpen(false);
      reload();
    } catch (err) {
      setIsSaveConfirmOpen(false);
      setFormError(getErrorMessage(err, 'Lỗi khi lưu thông tin học phần'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!deletingSubject) return;
    setDeleting(true);
    try {
      await subjectService.deleteSubject(deletingSubject.id);
      showSuccess(`Đã xóa học phần "${deletingSubject.code}"`);
      setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
      setDeletingSubject(null);
    } catch (err) {
      showError(err, 'Không thể xóa học phần');
      setDeletingSubject(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    if (!search.trim()) return true;
    const kw = search.trim().toLowerCase();
    return (
      s.code.toLowerCase().includes(kw) ||
      s.name.toLowerCase().includes(kw) ||
      (s.description || '').toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookCopy className="w-5 h-5 text-teal-700" />
            Danh mục Học phần Đào tạo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mã học phần, đề cương tóm tắt và danh sách đề thi trực thuộc từng môn học.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>Thêm học phần mới</span>
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

      <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã học phần hoặc tên môn..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Hiển thị <strong>{filteredSubjects.length}</strong> học phần
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tải danh mục học phần..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Mã học phần</th>
                  <th className="py-3 px-4">Tên môn học</th>
                  <th className="py-3 px-4">Mô tả nội dung</th>
                  <th className="py-3 px-4">Số đề thi</th>
                  <th className="py-3 px-4">Ngày cập nhật</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded bg-stone-100 border border-slate-300 font-bold text-slate-800">
                        {subject.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{subject.name}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      {subject.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewSubjectExams(subject)}
                        className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{subject.exam_count ?? 0} đề thi</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateTimeVN(subject.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(subject)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-stone-50 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSubject(subject)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Học phần */}
      <Modal
        isOpen={isModalOpen}
        title={editingSubject ? `Cập nhật học phần: ${editingSubject.code}` : 'Thêm học phần mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleRequestSaveSubject} className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã học phần
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: INT3306"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md uppercase focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên học phần
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phát triển Ứng dụng Web"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả đề cương học phần
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt nội dung kiến thức của học phần..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {editingSubject ? 'Lưu thay đổi' : 'Thêm học phần'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xem danh sách đề thi thuộc học phần */}
      <Modal
        isOpen={Boolean(viewingSubject)}
        title={
          viewingSubject
            ? `Đề thi thuộc học phần: ${viewingSubject.code} - ${viewingSubject.name}`
            : 'Danh sách đề thi'
        }
        onClose={() => setViewingSubject(null)}
        maxWidth="max-w-2xl"
      >
        {loadingExams ? (
          <LoadingSpinner message="Đang tải danh sách đề thi..." />
        ) : subjectExams.length > 0 ? (
          <div className="space-y-3 text-xs">
            {subjectExams.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 rounded border border-slate-200 bg-stone-50 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{ex.title}</p>
                  <p className="text-slate-600">
                    Giảng viên: <strong>{ex.creator_name}</strong> • Thời gian:{' '}
                    <strong>{ex.duration_minutes} phút</strong> • Số câu:{' '}
                    <strong>{ex.question_count} câu</strong>
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded border font-semibold shrink-0 ${
                    ex.is_published
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {ex.is_published ? 'Đang mở' : 'Đang đóng'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            Học phần này hiện chưa có đề thi nào.
          </p>
        )}
      </Modal>

      {/* Popup 1: Xác nhận Thêm / Cập nhật học phần */}
      <ConfirmModal
        isOpen={isSaveConfirmOpen}
        title={editingSubject ? 'Xác nhận cập nhật học phần' : 'Xác nhận thêm học phần mới'}
        message={
          editingSubject
            ? 'Bạn có chắc chắn muốn lưu các thay đổi cho học phần này không?'
            : 'Xác nhận khởi tạo học phần mới vào danh mục đào tạo của hệ thống?'
        }
        details={[
          { label: 'Mã học phần', value: code.trim().toUpperCase() },
          { label: 'Tên học phần', value: name.trim() },
        ]}
        confirmText={editingSubject ? 'Xác nhận lưu' : 'Xác nhận thêm'}
        cancelText="Kiểm tra lại"
        variant="primary"
        loading={submitting}
        onConfirm={confirmSaveSubject}
        onCancel={() => setIsSaveConfirmOpen(false)}
      />

      {/* Popup 2: Xác nhận Xóa học phần */}
      <ConfirmModal
        isOpen={Boolean(deletingSubject)}
        title="Xác nhận xóa học phần"
        message="Bạn có chắc chắn muốn xóa học phần này? Các đề thi trực thuộc học phần cũng sẽ bị xóa vĩnh viễn."
        details={
          deletingSubject
            ? [
                { label: 'Mã học phần', value: deletingSubject.code },
                { label: 'Tên học phần', value: deletingSubject.name },
                { label: 'Đề thi trực thuộc', value: `${deletingSubject.exam_count ?? 0} đề thi` },
              ]
            : []
        }
        confirmText="Xóa học phần"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteSubject}
        onCancel={() => setDeletingSubject(null)}
      />
    </div>
  );
};
