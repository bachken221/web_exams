import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// 1. Thống kê tổng quan & phân tích chuyên sâu toàn hệ thống cho Admin Dashboard
export const getAdminDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [userCounts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS total_students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) AS total_teachers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins,
        SUM(CASE WHEN is_locked = 1 THEN 1 ELSE 0 END) AS locked_users
      FROM users
    `);

    const [subjectCounts] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total_subjects FROM subjects'
    );

    const [examCounts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) AS total_exams,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS published_exams,
        (SELECT COUNT(*) FROM questions) AS total_questions
      FROM exams
    `);

    // Thống kê điểm số & phân bố phổ điểm toàn hệ thống
    const [attemptStats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(ea.id) AS total_attempts,
        AVG(ea.score) AS average_score,
        MAX(ea.score) AS highest_score,
        SUM(CASE WHEN ea.score >= e.pass_score THEN 1 ELSE 0 END) AS passed_attempts,
        SUM(CASE WHEN ea.score >= 8.5 THEN 1 ELSE 0 END) AS excellent_count,
        SUM(CASE WHEN ea.score >= 7.0 AND ea.score < 8.5 THEN 1 ELSE 0 END) AS good_count,
        SUM(CASE WHEN ea.score >= 5.0 AND ea.score < 7.0 THEN 1 ELSE 0 END) AS average_count,
        SUM(CASE WHEN ea.score < 5.0 THEN 1 ELSE 0 END) AS fail_count
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
    `);

    // Thống kê chất lượng khảo thí theo từng môn học
    const [subjectStats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.code,
        s.name,
        COUNT(DISTINCT e.id) AS exam_count,
        COUNT(ea.id) AS attempt_count,
        COALESCE(AVG(ea.score), 0) AS avg_score,
        SUM(CASE WHEN ea.score >= e.pass_score THEN 1 ELSE 0 END) AS pass_count
      FROM subjects s
      LEFT JOIN exams e ON s.id = e.subject_id
      LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
      GROUP BY s.id
      ORDER BY s.code ASC
    `);

    // Danh sách lượt thi gần đây
    const [recentAttempts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        ea.id,
        ea.score,
        ea.total_correct,
        ea.total_questions,
        ea.submitted_at,
        u.full_name AS student_name,
        u.email AS student_email,
        e.id AS exam_id,
        e.title AS exam_title,
        e.pass_score,
        s.code AS subject_code
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id
      JOIN exams e ON ea.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      ORDER BY ea.submitted_at DESC
      LIMIT 6
    `);

    // Danh sách tài khoản mới tham gia gần đây
    const [recentUsers] = await pool.query<RowDataPacket[]>(`
      SELECT id, full_name, email, role, is_locked, created_at
      FROM users
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `);

    const totalAttempts = Number(attemptStats[0]?.total_attempts || 0);
    const passedAttempts = Number(attemptStats[0]?.passed_attempts || 0);
    const passRate =
      totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê quản trị hệ thống thành công',
      data: {
        total_users: Number(userCounts[0]?.total_users || 0),
        total_students: Number(userCounts[0]?.total_students || 0),
        total_teachers: Number(userCounts[0]?.total_teachers || 0),
        total_admins: Number(userCounts[0]?.total_admins || 0),
        locked_users: Number(userCounts[0]?.locked_users || 0),
        total_subjects: Number(subjectCounts[0]?.total_subjects || 0),
        total_exams: Number(examCounts[0]?.total_exams || 0),
        published_exams: Number(examCounts[0]?.published_exams || 0),
        total_questions: Number(examCounts[0]?.total_questions || 0),
        total_attempts: totalAttempts,
        passed_attempts: passedAttempts,
        pass_rate: passRate,
        average_score: Number(Number(attemptStats[0]?.average_score || 0).toFixed(2)),
        highest_score: Number(Number(attemptStats[0]?.highest_score || 0).toFixed(2)),
        score_distribution: {
          excellent: Number(attemptStats[0]?.excellent_count || 0),
          good: Number(attemptStats[0]?.good_count || 0),
          average: Number(attemptStats[0]?.average_count || 0),
          fail: Number(attemptStats[0]?.fail_count || 0),
        },
        subject_stats: subjectStats.map((s) => {
          const attCount = Number(s.attempt_count || 0);
          const pCount = Number(s.pass_count || 0);
          return {
            id: s.id,
            code: s.code,
            name: s.name,
            exam_count: Number(s.exam_count || 0),
            attempt_count: attCount,
            avg_score: Number(Number(s.avg_score || 0).toFixed(2)),
            pass_rate: attCount > 0 ? Math.round((pCount / attCount) * 100) : 0,
          };
        }),
        recent_attempts: recentAttempts.map((item) => ({
          ...item,
          score: Number(item.score),
          pass_score: Number(item.pass_score),
          is_passed: Number(item.score) >= Number(item.pass_score),
        })),
        recent_users: recentUsers.map((u) => ({
          ...u,
          is_locked: Boolean(u.is_locked),
        })),
      },
    });
  } catch (error) {
    console.error('Lỗi getAdminDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải thống kê hệ thống',
      data: null,
    });
  }
};

// 2. Lấy danh sách tất cả người dùng kèm số liệu hoạt động
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.is_locked,
        u.created_at,
        (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.user_id = u.id) AS attempt_count,
        (SELECT COUNT(*) FROM exams e WHERE e.created_by = u.id) AS created_exam_count
      FROM users u
      WHERE 1 = 1
    `;
    const params: any[] = [];

    if (role && role !== 'all') {
      if (role === 'locked') {
        sql += ' AND u.is_locked = 1';
      } else {
        sql += ' AND u.role = ?';
        params.push(role);
      }
    }

    if (search && String(search).trim() !== '') {
      const keyword = `%${String(search).trim()}%`;
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(keyword, keyword);
    }

    sql += ' ORDER BY u.id ASC';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    const users = rows.map((u) => ({
      ...u,
      is_locked: Boolean(u.is_locked),
      attempt_count: Number(u.attempt_count || 0),
      created_exam_count: Number(u.created_exam_count || 0),
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      data: users,
    });
  } catch (error) {
    console.error('Lỗi getAllUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách người dùng',
      data: null,
    });
  }
};

// 3. Admin tạo tài khoản mới
export const createUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email, mật khẩu và vai trò',
        data: null,
      });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ',
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

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã tồn tại trên hệ thống',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (full_name, email, password, role, is_locked) VALUES (?, ?, ?, ?, FALSE)',
      [full_name.trim(), email.trim(), hashedPassword, role]
    );

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng mới thành công',
      data: {
        id: result.insertId,
        full_name: full_name.trim(),
        email: email.trim(),
        role,
        is_locked: false,
      },
    });
  } catch (error) {
    console.error('Lỗi createUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo người dùng mới',
      data: null,
    });
  }
};

// 4. Admin cập nhật thông tin người dùng (Họ tên, Email, Role, và tùy chọn Đặt lại mật khẩu)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, new_password } = req.body;
    const currentAdminId = req.user!.id;

    if (!full_name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên, email và vai trò không được để trống',
        data: null,
      });
    }

    if (Number(id) === currentAdminId && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự hạ quyền của tài khoản quản trị đang đăng nhập',
        data: null,
      });
    }

    // Kiểm tra trùng email với người khác
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim(), id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng cho tài khoản khác',
        data: null,
      });
    }

    if (new_password && String(new_password).trim() !== '') {
      if (String(new_password).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu đặt lại phải từ 6 ký tự trở lên',
          data: null,
        });
      }
      const hashedPassword = await bcrypt.hash(String(new_password), 10);
      await pool.query(
        'UPDATE users SET full_name = ?, email = ?, role = ?, password = ? WHERE id = ?',
        [full_name.trim(), email.trim(), role, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?',
        [full_name.trim(), email.trim(), role, id]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công',
      data: {
        id: Number(id),
        full_name: full_name.trim(),
        email: email.trim(),
        role,
      },
    });
  } catch (error) {
    console.error('Lỗi updateUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật tài khoản',
      data: null,
    });
  }
};

// 5. Admin thay đổi nhanh vai trò (Role) của người dùng
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user!.id;

    if (Number(id) === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự thay đổi quyền hạn của tài khoản đang đăng nhập',
        data: null,
      });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ',
        data: null,
      });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: { id: Number(id), role },
    });
  } catch (error) {
    console.error('Lỗi updateUserRole:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật vai trò',
      data: null,
    });
  }
};

// 6. Admin Khóa / Mở khóa tài khoản người dùng
export const toggleUserLock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user!.id;

    if (Number(id) === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản của chính mình',
        data: null,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, is_locked FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản người dùng',
        data: null,
      });
    }

    const newLockStatus = !rows[0].is_locked;
    await pool.query('UPDATE users SET is_locked = ? WHERE id = ?', [newLockStatus, id]);

    return res.status(200).json({
      success: true,
      message: newLockStatus ? 'Đã khóa tài khoản người dùng' : 'Đã mở khóa tài khoản người dùng',
      data: { id: Number(id), is_locked: newLockStatus },
    });
  } catch (error) {
    console.error('Lỗi toggleUserLock:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thay đổi trạng thái khóa tài khoản',
      data: null,
    });
  }
};

// 7. Admin xóa tài khoản người dùng
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user!.id;

    if (Number(id) === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản đang đăng nhập',
        data: null,
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản người dùng thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa người dùng',
      data: null,
    });
  }
};
