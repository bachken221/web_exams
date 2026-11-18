import { Router } from 'express';
import {
  getExamQuestionsForStudent,
  submitExam,
  getAttemptDetail,
  getMyHistory,
  getExamResultsForTeacher,
} from '../controllers/attemptController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Lịch sử làm bài cá nhân của Sinh viên
router.get('/my-history', verifyToken, authorizeRoles('student'), getMyHistory);

// Lấy câu hỏi cho phòng thi trực tuyến (Đã ẩn cột correct_option và explanation)
router.get(
  '/exam/:examId/questions',
  verifyToken,
  authorizeRoles('student'),
  getExamQuestionsForStudent
);

// Sinh viên nộp bài thi và chấm điểm tự động
router.post(
  '/exam/:examId/submit',
  verifyToken,
  authorizeRoles('student'),
  submitExam
);

// Giảng viên / Admin xem bảng điểm sinh viên của 1 đề thi
router.get(
  '/exam/:examId/results',
  verifyToken,
  authorizeRoles('teacher', 'admin'),
  getExamResultsForTeacher
);

// Xem chi tiết 1 lượt làm bài (Sinh viên xem bài mình, Giảng viên xem bài thuộc đề mình, Admin xem tất cả)
router.get('/:attemptId', verifyToken, getAttemptDetail);

export default router;

