import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { JwtUserPayload } from '../types/express';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'quiz_web_cuoiki_secret_key_2026';

// Middleware 1: Xác thực JWT Token (verifyToken)
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc thiếu Token xác thực',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;

    // Kiểm tra trạng thái tài khoản thực tế trong DB (tránh trường hợp user vừa bị khóa)
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, role, is_locked FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không còn tồn tại trên hệ thống',
        data: null,
      });
    }

    const currentUser = rows[0];
    if (currentUser.is_locked) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên',
        data: null,
      });
    }

    // Gắn thông tin người dùng vào req.user
    req.user = {
      id: currentUser.id,
      full_name: currentUser.full_name,
      email: currentUser.email,
      role: currentUser.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      data: null,
    });
  }
};

// Middleware 2: Kiểm tra phân quyền theo vai trò (RBAC)
export const authorizeRoles = (...allowedRoles: Array<'student' | 'teacher' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng',
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập vào khu vực hoặc chức năng này (403 Forbidden)',
        data: null,
      });
    }

    next();
  };
};

