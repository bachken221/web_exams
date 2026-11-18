import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Lấy danh sách đề thi theo phân quyền:
// - Student: chỉ lấy đề thi đang mở (is_published = TRUE) và có ít nhất 1 câu hỏi (hoặc tất cả đề đang mở)
// - Teacher: lấy danh sách đề thi do chính giảng viên đó tạo (created_by = req.user.id)
// - Admin: lấy toàn bộ đề thi của tất cả giảng viên
export const getExams = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { subject_id, search } = req.query;

    let sql = `
      SELECT 
        e.id,
        e.subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        e.created_by,
        u.full_name AS creator_name,
        e.title,
        e.description,
        e.duration_minutes,
        e.pass_score,
        e.is_published,
        e.created_at,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count,
        (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.exam_id = e.id) AS attempt_count
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      JOIN users u ON e.created_by = u.id
      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (user.role === 'student') {
      sql += ' AND e.is_published = TRUE';
    } else if (user.role === 'teacher') {
      sql += ' AND e.created_by = ?';
      params.push(user.id);
    }

    if (subject_id && subject_id !== 'all') {
      sql += ' AND e.subject_id = ?';
      params.push(Number(subject_id));
    }

    if (search && String(search).trim() !== '') {
      const keyword = `%${String(search).trim()}%`;
      sql += ' AND (e.title LIKE ? OR s.code LIKE ? OR s.name LIKE ?)';
      params.push(keyword, keyword, keyword);
    }

    sql += ' ORDER BY e.created_at DESC, e.id DESC';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    const formatted = rows.map((row) => ({
      ...row,
      pass_score: Number(row.pass_score),
      is_published: Boolean(row.is_published),
      question_count: Number(row.question_count),
      attempt_count: Number(row.attempt_count),
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đề thi thành công',
      data: formatted,
    });
  } catch (error) {
    console.error('Lỗi getExams:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách đề thi',
      data: null,
    });
  }
};

// Lấy thông tin chi tiết 1 đề thi
export const getExamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.id,
        e.subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        e.created_by,
        u.full_name AS creator_name,
        e.title,
        e.description,
        e.duration_minutes,
        e.pass_score,
        e.is_published,
        e.created_at,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count,
        (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.exam_id = e.id) AS attempt_count
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
        data: null,
      });
    }

    const exam = rows[0];

    // Kiểm tra quyền truy cập đề thi:
    // - Sinh viên không được xem đề đang khóa (is_published = FALSE)
    // - Giảng viên chỉ được xem/quản lý đề của chính mình tạo
    if (user.role === 'student' && !exam.is_published) {
      return res.status(403).json({
        success: false,
        message: 'Đề thi này hiện đang đóng hoặc chưa được công bố',
        data: null,
      });
    }

    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin đề thi thành công',
      data: {
        ...exam,
        pass_score: Number(exam.pass_score),
        is_published: Boolean(exam.is_published),
        question_count: Number(exam.question_count),
        attempt_count: Number(exam.attempt_count),
      },
    });
  } catch (error) {
    console.error('Lỗi getExamById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết đề thi',
      data: null,
    });
  }
};

// Tạo đề thi mới (Teacher / Admin)
export const createExam = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { subject_id, title, description, duration_minutes, pass_score, is_published } = req.body;

    if (!subject_id || !title || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ môn học, tiêu đề đề thi và thời gian làm bài',
        data: null,
      });
    }

    const duration = Number(duration_minutes);
    const passScore = pass_score !== undefined ? Number(pass_score) : 5.0;

    if (duration <= 0 || duration > 300) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian làm bài phải từ 1 đến 300 phút',
        data: null,
      });
    }

    if (passScore < 0 || passScore > 10) {
      return res.status(400).json({
        success: false,
        message: 'Điểm đạt phải nằm trong thang điểm từ 0 đến 10',
        data: null,
      });
    }

    const publishedFlag = is_published !== undefined ? Boolean(is_published) : true;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO exams (subject_id, created_by, title, description, duration_minutes, pass_score, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(subject_id),
        user.id,
        title.trim(),
        description ? description.trim() : '',
        duration,
        passScore,
        publishedFlag,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Tạo đề thi mới thành công',
      data: {
        id: result.insertId,
        subject_id: Number(subject_id),
        created_by: user.id,
        title: title.trim(),
        description: description ? description.trim() : '',
        duration_minutes: duration,
        pass_score: passScore,
        is_published: publishedFlag,
      },
    });
  } catch (error) {
    console.error('Lỗi createExam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo đề thi',
      data: null,
    });
  }
};

// Cập nhật đề thi (Kiểm tra chặt chẽ Ownership: Giảng viên chỉ được sửa đề của mình)
export const updateExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { subject_id, title, description, duration_minutes, pass_score, is_published } = req.body;

    // Kiểm tra đề thi có tồn tại và ai là người tạo
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, created_by FROM exams WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi cần cập nhật',
        data: null,
      });
    }

    const exam = existingRows[0];

    // Kiểm tra quyền sở hữu (Ownership Check)
    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    if (!subject_id || !title || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ môn học, tiêu đề và thời gian làm bài',
        data: null,
      });
    }

    await pool.query(
      `UPDATE exams 
       SET subject_id = ?, title = ?, description = ?, duration_minutes = ?, pass_score = ?, is_published = ?
       WHERE id = ?`,
      [
        Number(subject_id),
        title.trim(),
        description ? description.trim() : '',
        Number(duration_minutes),
        Number(pass_score),
        Boolean(is_published),
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin đề thi thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi updateExam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật đề thi',
      data: null,
    });
  }
};

// Bật / tắt trạng thái mở đề thi nhanh (Publish / Unpublish)
export const toggleExamPublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, created_by, is_published FROM exams WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
        data: null,
      });
    }

    const exam = existingRows[0];

    // Kiểm tra quyền sở hữu nếu là giảng viên
    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi trạng thái đề thi của giảng viên khác',
        data: null,
      });
    }

    const newStatus = !exam.is_published;
    await pool.query('UPDATE exams SET is_published = ? WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      message: newStatus ? 'Đã mở xuất bản đề thi cho sinh viên' : 'Đã tạm khóa / ẩn đề thi',
      data: { id: Number(id), is_published: newStatus },
    });
  } catch (error) {
    console.error('Lỗi toggleExamPublish:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đổi trạng thái đề thi',
      data: null,
    });
  }
};

// Xóa đề thi (Kiểm tra Ownership)
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, created_by FROM exams WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi cần xóa',
        data: null,
      });
    }

    const exam = existingRows[0];

    // Kiểm tra quyền sở hữu nếu là giảng viên
    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    await pool.query('DELETE FROM exams WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa đề thi và các câu hỏi liên quan thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi deleteExam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa đề thi',
      data: null,
    });
  }
};

// Thống kê Dashboard dành riêng cho Giảng viên
export const getTeacherDashboardStats = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;

    // Tổng số đề thi giảng viên đã tạo
    const [examCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total_exams, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS published_exams FROM exams WHERE created_by = ?',
      [teacherId]
    );

    // Tổng số câu hỏi thuộc các đề của giảng viên
    const [questionCountRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(q.id) AS total_questions
       FROM questions q
       JOIN exams e ON q.exam_id = e.id
       WHERE e.created_by = ?`,
      [teacherId]
    );

    // Thống kê lượt thi và tỷ lệ qua môn trên các đề của giảng viên
    const [attemptStatsRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(ea.id) AS total_attempts,
        SUM(CASE WHEN ea.score >= e.pass_score THEN 1 ELSE 0 END) AS passed_attempts,
        AVG(ea.score) AS average_score
       FROM exam_attempts ea
       JOIN exams e ON ea.exam_id = e.id
       WHERE e.created_by = ?`,
      [teacherId]
    );

    // 5 lượt nộp bài gần nhất của sinh viên vào đề của giảng viên
    const [recentAttempts] = await pool.query<RowDataPacket[]>(
      `SELECT 
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
       JOIN exams e ON ea.exam_id = e.id
       JOIN subjects s ON e.subject_id = s.id
       JOIN users u ON ea.user_id = u.id
       WHERE e.created_by = ?
       ORDER BY ea.submitted_at DESC
       LIMIT 6`,
      [teacherId]
    );

    const totalAttempts = Number(attemptStatsRows[0]?.total_attempts || 0);
    const passedAttempts = Number(attemptStatsRows[0]?.passed_attempts || 0);
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê giảng viên thành công',
      data: {
        total_exams: Number(examCountRows[0]?.total_exams || 0),
        published_exams: Number(examCountRows[0]?.published_exams || 0),
        total_questions: Number(questionCountRows[0]?.total_questions || 0),
        total_attempts: totalAttempts,
        passed_attempts: passedAttempts,
        pass_rate: passRate,
        average_score: Number(Number(attemptStatsRows[0]?.average_score || 0).toFixed(2)),
        recent_attempts: recentAttempts.map((item) => ({
          ...item,
          score: Number(item.score),
          pass_score: Number(item.pass_score),
          is_passed: Number(item.score) >= Number(item.pass_score),
        })),
      },
    });
  } catch (error) {
    console.error('Lỗi getTeacherDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải thống kê giảng viên',
      data: null,
    });
  }
};

