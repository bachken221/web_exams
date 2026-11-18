import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'quiz_web_cuoiki_secret_key_2026';

// Đăng ký tài khoản Sinh viên mới
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu',
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
        data: null,
      });
    }

    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng. Vui lòng chọn email khác.',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (full_name, email, password, role, is_locked) VALUES (?, ?, ?, ?, FALSE)',
      [full_name.trim(), email.trim(), hashedPassword, 'student']
    );

    const newUser = {
      id: result.insertId,
      full_name: full_name.trim(),
      email: email.trim(),
      role: 'student' as const,
      is_locked: false,
      created_at: new Date().toISOString(),
    };

    const token = jwt.sign(
      {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi đăng ký tài khoản',
      data: null,
    });
  }
};

// Đăng nhập hệ thống
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu',
        data: null,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, password, role, is_locked, created_at FROM users WHERE email = ?',
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
        data: null,
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
        data: null,
      });
    }

    if (user.is_locked) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn hiện đang tạm khóa. Vui lòng liên hệ quản trị viên.',
        data: null,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_locked: Boolean(user.is_locked),
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xử lý đăng nhập',
      data: null,
    });
  }
};

// Lấy thông tin cá nhân hiện tại kèm thống kê hoạt động
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập',
        data: null,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id, u.full_name, u.email, u.role, u.is_locked, u.created_at,
        (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.user_id = u.id) AS attempt_count,
        (SELECT COUNT(*) FROM exams e WHERE e.created_by = u.id) AS created_exam_count
       FROM users u
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        data: null,
      });
    }

    const user = rows[0];
    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin tài khoản thành công',
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_locked: Boolean(user.is_locked),
        created_at: user.created_at,
        attempt_count: Number(user.attempt_count || 0),
        created_exam_count: Number(user.created_exam_count || 0),
      },
    });
  } catch (error) {
    console.error('Lỗi getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin cá nhân',
      data: null,
    });
  }
};

// Cập nhật thông tin hồ sơ cá nhân (Họ tên & Email)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên và địa chỉ email không được để trống',
        data: null,
      });
    }

    // Kiểm tra trùng email với người dùng khác
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim(), userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác',
        data: null,
      });
    }

    await pool.query('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [
      full_name.trim(),
      email.trim(),
      userId,
    ]);

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, role, is_locked, created_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = rows[0];
    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ cá nhân thành công',
      data: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_locked: Boolean(updatedUser.is_locked),
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error('Lỗi updateProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật hồ sơ',
      data: null,
    });
  }
};

// Đổi mật khẩu cá nhân
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới',
        data: null,
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        data: null,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác',
        data: null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [
      hashedNewPassword,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi changePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đổi mật khẩu',
      data: null,
    });
  }
};
