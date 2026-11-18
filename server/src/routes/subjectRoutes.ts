import { Router } from 'express';
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Tất cả người dùng đã đăng nhập đều có thể xem danh sách môn học
router.get('/', verifyToken, getAllSubjects);

// Chỉ Admin mới có quyền CRUD Môn học
router.post('/', verifyToken, authorizeRoles('admin'), createSubject);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateSubject);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteSubject);

export default router;

