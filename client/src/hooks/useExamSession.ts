import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { Exam, ExamRoomQuestion } from '../types/exam.types';
import { storage } from '../utils/storage';
import { getErrorMessage } from '../utils/error';
import { useCountdown } from './useCountdown';

export interface SavedRoomSession {
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  flaggedIds: number[];
  startedAt: string;
  endTimeMs: number;
}

// Custom Hook quản lý toàn bộ trạng thái và quy chế Phòng thi Trực tuyến
export function useExamSession(examId: number, userId?: number) {
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamRoomQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedIds, setFlaggedIds] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<string>('');
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const answersRef = useRef(answers);
  const startedAtRef = useRef(startedAt);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  // 1. Tải câu hỏi phòng thi và khôi phục trạng thái từ sessionStorage (chống mất bài khi F5)
  useEffect(() => {
    if (!examId || !userId) return;

    const initRoom = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await examService.getRoomQuestions(examId);
        setExam(data.exam);
        setQuestions(data.questions);

        const saved = storage.getExamSession<SavedRoomSession>(examId, userId);
        const nowMs = Date.now();

        if (saved && saved.endTimeMs > nowMs) {
          setAnswers(saved.answers || {});
          setFlaggedIds(saved.flaggedIds || []);
          setStartedAt(saved.startedAt);
          setEndTimeMs(saved.endTimeMs);
        } else {
          const newStartIso = new Date().toISOString();
          const newEndTimeMs = nowMs + data.exam.duration_minutes * 60 * 1000;

          setAnswers({});
          setFlaggedIds([]);
          setStartedAt(newStartIso);
          setEndTimeMs(newEndTimeMs);

          storage.setExamSession<SavedRoomSession>(examId, userId, {
            answers: {},
            flaggedIds: [],
            startedAt: newStartIso,
            endTimeMs: newEndTimeMs,
          });
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải dữ liệu phòng thi lúc này'));
      } finally {
        setLoading(false);
      }
    };

    initRoom();
  }, [examId, userId]);

  // 2. Lưu tạm đáp án và danh sách câu đánh dấu vào sessionStorage mỗi khi sinh viên thao tác
  useEffect(() => {
    if (!exam || !userId || !startedAt || !endTimeMs) return;
    storage.setExamSession<SavedRoomSession>(exam.id, userId, {
      answers,
      flaggedIds,
      startedAt,
      endTimeMs,
    });
  }, [answers, flaggedIds, exam, userId, startedAt, endTimeMs]);

  // 3. Hàm nộp bài thi (dùng chung cho cả nộp thủ công và tự động thu bài khi hết giờ)
  const submitExamPaper = useCallback(async () => {
    if (isSubmittingRef.current || !examId || !userId) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      const result = await examService.submitExam(
        examId,
        answersRef.current,
        startedAtRef.current || new Date().toISOString()
      );
      storage.clearExamSession(examId, userId);
      navigate(`/student/results/${result.attempt_id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Lỗi khi nộp bài thi. Vui lòng thử lại.'));
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }, [examId, userId, navigate]);

  // 4. Kích hoạt đồng hồ đếm ngược và tự động nộp bài khi hết giờ
  const remainingSeconds = useCountdown(endTimeMs, submitExamPaper);

  // 5. Cảnh báo khi sinh viên cố tình đóng tab hoặc nhấn nút Back của trình duyệt khi đang thi
  useEffect(() => {
    if (loading || !exam || submitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Chặn nút Back trên trình duyệt khi đang trong phòng thi
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading, exam, submitting]);

  // 6. Các hàm thao tác làm bài
  const selectOption = useCallback((questionId: number, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: option,
    }));
  }, []);

  const toggleFlag = useCallback((questionId: number) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    exam,
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex] || null,
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
  };
}
