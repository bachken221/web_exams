import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Play, Search, UserCheck } from 'lucide-react';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { Exam, Subject } from '../../types/exam.types';
import { useAsyncData } from '../../hooks/useAsyncData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button } from '../../components/common/Button';

export const ExamList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [confirmingExam, setConfirmingExam] = useState<Exam | null>(null);

  const { data, loading, error, setError, reload } = useAsyncData<{
    exams: Exam[];
    subjects: Subject[];
  }>(
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    reload();
  };

  const { exams, subjects } = data;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-700" />
          Danh sách Đề thi Học phần Đang Mở
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tra cứu đề thi theo học phần hoặc tên bài thi. Kiểm tra kỹ thời gian làm bài và điểm chuẩn trước khi vào phòng thi.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.duration_minutes} phút
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">{exam.title}</h2>
                  {exam.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{exam.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Giảng viên phụ trách: <strong className="text-slate-700">{exam.creator_name}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-600 space-x-3">
                    <span>
                      Số câu hỏi: <strong className="text-slate-900">{exam.question_count} câu</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Điểm chuẩn đạt: <strong className="text-emerald-700">{exam.pass_score.toFixed(1)}/10</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmingExam(exam)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Bắt đầu làm bài</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-md p-10 text-center text-sm text-slate-500">
              Không tìm thấy đề thi nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      )}

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
                { label: 'Giảng viên phụ trách', value: confirmingExam.creator_name },
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
        cancelText="Hủy bỏ"
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
