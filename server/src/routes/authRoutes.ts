import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
