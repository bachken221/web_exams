import { Router } from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  toggleExamPublish,
  deleteExam,
  getTeacherDashboardStats,
} from '../controllers/examController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Thống kê Dashboard dành cho Giảng viên
router.get(
  '/teacher/stats',
  verifyToken,
  authorizeRoles('teacher', 'admin'),
  getTeacherDashboardStats
);

// Lấy danh sách đề thi (Tự động lọc theo role ở Controller)
router.get('/', verifyToken, getExams);

// Chi tiết 1 đề thi
router.get('/:id', verifyToken, getExamById);

// Tạo, Sửa, Mở/Khóa, Xóa đề thi (Dành cho Giảng viên & Admin, có kiểm tra Ownership ở Controller)
router.post('/', verifyToken, authorizeRoles('teacher', 'admin'), createExam);
router.put('/:id', verifyToken, authorizeRoles('teacher', 'admin'), updateExam);
router.patch('/:id/publish', verifyToken, authorizeRoles('teacher', 'admin'), toggleExamPublish);
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteExam);

export default router;

