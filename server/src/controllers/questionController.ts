import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Lấy danh sách câu hỏi kèm đáp án đúng của 1 đề thi (Dành cho Giảng viên tạo đề & Admin)
export const getQuestionsByExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const user = req.user!;

    // Kiểm tra đề thi có tồn tại và kiểm tra quyền sở hữu (Ownership Check)
    const [examRows] = await pool.query<RowDataPacket[]>(
      `SELECT e.id, e.title, e.created_by, e.duration_minutes, e.pass_score, e.is_published,
              s.code AS subject_code, s.name AS subject_name
       FROM exams e
       JOIN subjects s ON e.subject_id = s.id
       WHERE e.id = ?`,
      [examId]
    );

    if (examRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
        data: null,
      });
    }

    const exam = examRows[0];

    // Giảng viên A không được phép xem/chỉnh sửa ngân hàng câu hỏi của Giảng viên B
    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền quản lý ngân hàng câu hỏi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT id, exam_id, content, option_a, option_b, option_c, option_d, correct_option, explanation
       FROM questions
       WHERE exam_id = ?
       ORDER BY id ASC`,
      [examId]
    );

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách câu hỏi thành công',
      data: {
        exam: {
          ...exam,
          pass_score: Number(exam.pass_score),
          is_published: Boolean(exam.is_published),
        },
        questions,
      },
    });
  } catch (error) {
    console.error('Lỗi getQuestionsByExam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách câu hỏi',
      data: null,
    });
  }
};

// Thêm câu hỏi mới vào đề thi (Kiểm tra Ownership)
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const user = req.user!;
    const { content, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

    // Kiểm tra quyền sở hữu đề thi
    const [examRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, created_by FROM exams WHERE id = ?',
      [examId]
    );

    if (examRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
        data: null,
      });
    }

    const exam = examRows[0];
    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm câu hỏi vào đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    if (!content || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ nội dung câu hỏi, 4 phương án A/B/C/D và chọn đáp án đúng',
        data: null,
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
      return res.status(400).json({
        success: false,
        message: 'Đáp án đúng phải là một trong 4 giá trị A, B, C hoặc D',
        data: null,
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(examId),
        content.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct_option,
        explanation ? explanation.trim() : '',
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thêm câu hỏi mới thành công',
      data: {
        id: result.insertId,
        exam_id: Number(examId),
        content: content.trim(),
        option_a: option_a.trim(),
        option_b: option_b.trim(),
        option_c: option_c.trim(),
        option_d: option_d.trim(),
        correct_option,
        explanation: explanation ? explanation.trim() : '',
      },
    });
  } catch (error) {
    console.error('Lỗi createQuestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm câu hỏi',
      data: null,
    });
  }
};

// Cập nhật câu hỏi (Kiểm tra Ownership thông qua bảng exams)
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { content, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

    // Kiểm tra câu hỏi thuộc đề thi nào và ai là người tạo đề thi đó
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT q.id, q.exam_id, e.created_by
       FROM questions q
       JOIN exams e ON q.exam_id = e.id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi cần chỉnh sửa',
        data: null,
      });
    }

    const questionInfo = rows[0];
    if (user.role === 'teacher' && questionInfo.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa câu hỏi thuộc đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    if (!content || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ nội dung câu hỏi, 4 phương án A/B/C/D và đáp án đúng',
        data: null,
      });
    }

    await pool.query(
      `UPDATE questions
       SET content = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, explanation = ?
       WHERE id = ?`,
      [
        content.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct_option,
        explanation ? explanation.trim() : '',
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi updateQuestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật câu hỏi',
      data: null,
    });
  }
};

// Xóa câu hỏi (Kiểm tra Ownership thông qua bảng exams)
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT q.id, q.exam_id, e.created_by
       FROM questions q
       JOIN exams e ON q.exam_id = e.id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi cần xóa',
        data: null,
      });
    }

    const questionInfo = rows[0];
    if (user.role === 'teacher' && questionInfo.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa câu hỏi thuộc đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    await pool.query('DELETE FROM questions WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa câu hỏi khỏi đề thi',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi deleteQuestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa câu hỏi',
      data: null,
    });
  }
};

