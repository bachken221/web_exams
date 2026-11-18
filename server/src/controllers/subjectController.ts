import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Lấy danh sách toàn bộ môn học kèm số lượng đề thi (dành cho tất cả các vai trò)
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.description,
        s.created_at,
        COUNT(e.id) AS exam_count
      FROM subjects s
      LEFT JOIN exams e ON s.id = e.subject_id
      GROUP BY s.id
      ORDER BY s.code ASC
    `);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách môn học thành công',
      data: rows,
    });
  } catch (error) {
    console.error('Lỗi getAllSubjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách môn học',
      data: null,
    });
  }
};

// Admin thêm môn học mới
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Mã môn học và tên môn học không được để trống',
        data: null,
      });
    }

    // Kiểm tra trùng mã môn học
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM subjects WHERE code = ?',
      [code.trim().toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Mã môn học "${code.trim().toUpperCase()}" đã tồn tại trên hệ thống`,
        data: null,
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)',
      [code.trim().toUpperCase(), name.trim(), description ? description.trim() : '']
    );

    return res.status(201).json({
      success: true,
      message: 'Thêm môn học mới thành công',
      data: {
        id: result.insertId,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description ? description.trim() : '',
      },
    });
  } catch (error) {
    console.error('Lỗi createSubject:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm môn học',
      data: null,
    });
  }
};

// Admin cập nhật môn học
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Mã môn học và tên môn học không được để trống',
        data: null,
      });
    }

    // Kiểm tra trùng mã môn với môn khác
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM subjects WHERE code = ? AND id != ?',
      [code.trim().toUpperCase(), id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Mã môn học "${code.trim().toUpperCase()}" đã được dùng cho môn học khác`,
        data: null,
      });
    }

    await pool.query(
      'UPDATE subjects SET code = ?, name = ?, description = ? WHERE id = ?',
      [code.trim().toUpperCase(), name.trim(), description ? description.trim() : '', id]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật môn học thành công',
      data: {
        id: Number(id),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description ? description.trim() : '',
      },
    });
  } catch (error) {
    console.error('Lỗi updateSubject:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật môn học',
      data: null,
    });
  }
};

// Admin xóa môn học
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM subjects WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học cần xóa',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa môn học thành công',
      data: null,
    });
  } catch (error) {
    console.error('Lỗi deleteSubject:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa môn học',
      data: null,
    });
  }
};

