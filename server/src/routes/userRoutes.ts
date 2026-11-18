import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserLock,
  deleteUser,
} from '../controllers/userController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken, authorizeRoles('admin'));

router.get('/stats', getAdminDashboardStats);
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/lock', toggleUserLock);
router.delete('/:id', deleteUser);

export default router;
