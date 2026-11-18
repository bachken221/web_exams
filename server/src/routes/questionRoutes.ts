import { Router } from 'express';
import {
  getQuestionsByExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Chỉ Giảng viên (sở hữu đề) và Admin mới được truy cập Ngân hàng câu hỏi kèm đáp án đúng
router.get(
  '/exam/:examId',
  verifyToken,
  authorizeRoles('teacher', 'admin'),
  getQuestionsByExam
);

router.post(
  '/exam/:examId',
  verifyToken,
  authorizeRoles('teacher', 'admin'),
  createQuestion
);

router.put('/:id', verifyToken, authorizeRoles('teacher', 'admin'), updateQuestion);
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteQuestion);

export default router;

