import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// 1. Lấy danh sách câu hỏi cho Phòng thi Sinh viên (GET /api/attempts/exam/:examId/questions)
// BẢO MẬT QUAN TRỌNG: Tuyệt đối KHÔNG SELECT cột correct_option và explanation
// để chống sinh viên bật F12 (Network Tab) xem trước đáp án.
export const getExamQuestionsForStudent = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    // Kiểm tra đề thi có tồn tại và đang mở (is_published = TRUE) không
    const [examRows] = await pool.query<RowDataPacket[]>(
      `SELECT e.id, e.title, e.description, e.duration_minutes, e.pass_score, e.is_published,
              s.code AS subject_code, s.name AS subject_name, u.full_name AS creator_name
       FROM exams e
       JOIN subjects s ON e.subject_id = s.id
       JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [examId]
    );

    if (examRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi này',
        data: null,
      });
    }

    const exam = examRows[0];

    if (!exam.is_published) {
      return res.status(403).json({
        success: false,
        message: 'Đề thi này hiện đang đóng, bạn không thể vào phòng thi',
        data: null,
      });
    }

    // Chỉ lấy id, exam_id, content và 4 phương án lựa chọn
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT id, exam_id, content, option_a, option_b, option_c, option_d
       FROM questions
       WHERE exam_id = ?
       ORDER BY id ASC`,
      [examId]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đề thi này chưa có câu hỏi nào. Vui lòng quay lại sau.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tải dữ liệu phòng thi thành công',
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
    console.error('Lỗi getExamQuestionsForStudent:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải câu hỏi phòng thi',
      data: null,
    });
  }
};

// 2. Sinh viên nộp bài và chấm điểm tự động tại Backend (POST /api/attempts/exam/:examId/submit)
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const user = req.user!;
    const { answers, started_at } = req.body;

    // Kiểm tra đề thi
    const [examRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, pass_score, is_published FROM exams WHERE id = ?',
      [examId]
    );

    if (examRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi',
        data: null,
      });
    }

    // Lấy đáp án chuẩn từ Database để chấm điểm
    const [questions] = await pool.query<RowDataPacket[]>(
      'SELECT id, correct_option FROM questions WHERE exam_id = ?',
      [examId]
    );

    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đề thi không có câu hỏi để chấm điểm',
        data: null,
      });
    }

    const userAnswersMap: Record<string, string> =
      answers && typeof answers === 'object' ? answers : {};

    // Thuật toán chấm điểm tự động trên thang điểm 10
    let totalCorrect = 0;
    for (const q of questions) {
      const studentChoice = userAnswersMap[String(q.id)];
      if (studentChoice && studentChoice === q.correct_option) {
        totalCorrect += 1;
      }
    }

    const rawScore = (totalCorrect / totalQuestions) * 10;
    const score = Number(rawScore.toFixed(2));

    // Chuyển đổi thời gian bắt đầu làm bài sang định dạng MySQL DATETIME
    const startTime = started_at ? new Date(started_at) : new Date();
    const formattedStart = isNaN(startTime.getTime()) ? new Date() : startTime;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO exam_attempts (user_id, exam_id, score, total_correct, total_questions, user_answers, started_at, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        Number(examId),
        score,
        totalCorrect,
        totalQuestions,
        JSON.stringify(userAnswersMap),
        formattedStart,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Nộp bài và chấm điểm thành công',
      data: {
        attempt_id: result.insertId,
        exam_id: Number(examId),
        score,
        total_correct: totalCorrect,
        total_questions: totalQuestions,
        is_passed: score >= Number(examRows[0].pass_score),
      },
    });
  } catch (error) {
    console.error('Lỗi submitExam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi nộp bài thi',
      data: null,
    });
  }
};

// 3. Xem chi tiết kết quả 1 lượt làm bài kèm giải thích đáp án (GET /api/attempts/:attemptId)
export const getAttemptDetail = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const user = req.user!;

    const [attemptRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ea.id,
        ea.user_id,
        u.full_name AS student_name,
        u.email AS student_email,
        ea.exam_id,
        e.title AS exam_title,
        e.duration_minutes,
        e.pass_score,
        e.created_by AS exam_creator_id,
        s.code AS subject_code,
        s.name AS subject_name,
        ea.score,
        ea.total_correct,
        ea.total_questions,
        ea.user_answers,
        ea.started_at,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      JOIN users u ON ea.user_id = u.id
      WHERE ea.id = ?`,
      [attemptId]
    );

    if (attemptRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kết quả bài thi này',
        data: null,
      });
    }

    const attempt = attemptRows[0];

    // Kiểm tra quyền xem chi tiết bài làm:
    // - Sinh viên chỉ được xem bài làm của chính mình
    // - Giảng viên chỉ được xem bài làm thuộc đề thi do mình tạo
    // - Admin được xem tất cả
    if (user.role === 'student' && attempt.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem kết quả bài thi của sinh viên khác (403 Forbidden)',
        data: null,
      });
    }

    if (user.role === 'teacher' && attempt.exam_creator_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem kết quả đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    // Parse JSON user_answers
    let parsedAnswers: Record<string, string> = {};
    if (typeof attempt.user_answers === 'string') {
      try {
        parsedAnswers = JSON.parse(attempt.user_answers);
      } catch {
        parsedAnswers = {};
      }
    } else if (attempt.user_answers && typeof attempt.user_answers === 'object') {
      parsedAnswers = attempt.user_answers;
    }

    // Lấy toàn bộ câu hỏi kèm đáp án đúng và lời giải thích (vì lúc này đã nộp bài xong)
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT id, content, option_a, option_b, option_c, option_d, correct_option, explanation
       FROM questions
       WHERE exam_id = ?
       ORDER BY id ASC`,
      [attempt.exam_id]
    );

    const detailedQuestions = questions.map((q) => {
      const selectedOption = parsedAnswers[String(q.id)] || null;
      return {
        ...q,
        selected_option: selectedOption,
        is_correct: selectedOption === q.correct_option,
      };
    });

    const scoreNum = Number(attempt.score);
    const passScoreNum = Number(attempt.pass_score);

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết kết quả bài thi thành công',
      data: {
        attempt: {
          id: attempt.id,
          user_id: attempt.user_id,
          student_name: attempt.student_name,
          student_email: attempt.student_email,
          exam_id: attempt.exam_id,
          exam_title: attempt.exam_title,
          subject_code: attempt.subject_code,
          subject_name: attempt.subject_name,
          duration_minutes: attempt.duration_minutes,
          pass_score: passScoreNum,
          score: scoreNum,
          is_passed: scoreNum >= passScoreNum,
          total_correct: attempt.total_correct,
          total_questions: attempt.total_questions,
          started_at: attempt.started_at,
          submitted_at: attempt.submitted_at,
        },
        questions: detailedQuestions,
      },
    });
  } catch (error) {
    console.error('Lỗi getAttemptDetail:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải chi tiết kết quả',
      data: null,
    });
  }
};

// 4. Lịch sử thi cá nhân của Sinh viên (GET /api/attempts/my-history)
export const getMyHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ea.id,
        ea.exam_id,
        e.title AS exam_title,
        e.pass_score,
        e.duration_minutes,
        s.code AS subject_code,
        s.name AS subject_name,
        ea.score,
        ea.total_correct,
        ea.total_questions,
        ea.started_at,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE ea.user_id = ?
      ORDER BY ea.submitted_at DESC`,
      [userId]
    );

    const history = rows.map((row) => ({
      ...row,
      score: Number(row.score),
      pass_score: Number(row.pass_score),
      is_passed: Number(row.score) >= Number(row.pass_score),
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy lịch sử làm bài thành công',
      data: history,
    });
  } catch (error) {
    console.error('Lỗi getMyHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải lịch sử thi',
      data: null,
    });
  }
};

// 5. Giảng viên / Admin xem bảng điểm sinh viên của 1 đề thi (GET /api/attempts/exam/:examId/results)
export const getExamResultsForTeacher = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const user = req.user!;

    // Kiểm tra đề thi và quyền sở hữu của Giảng viên
    const [examRows] = await pool.query<RowDataPacket[]>(
      `SELECT e.id, e.title, e.created_by, e.duration_minutes, e.pass_score,
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

    if (user.role === 'teacher' && exam.created_by !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bảng điểm đề thi của giảng viên khác (403 Forbidden)',
        data: null,
      });
    }

    const [results] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ea.id,
        ea.user_id,
        u.full_name AS student_name,
        u.email AS student_email,
        ea.score,
        ea.total_correct,
        ea.total_questions,
        ea.started_at,
        ea.submitted_at
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.exam_id = ?
      ORDER BY ea.submitted_at DESC`,
      [examId]
    );

    const passScore = Number(exam.pass_score);
    const formattedResults = results.map((r) => ({
      ...r,
      score: Number(r.score),
      is_passed: Number(r.score) >= passScore,
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy bảng điểm sinh viên thành công',
      data: {
        exam: {
          ...exam,
          pass_score: passScore,
        },
        results: formattedResults,
      },
    });
  } catch (error) {
    console.error('Lỗi getExamResultsForTeacher:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải bảng điểm sinh viên',
      data: null,
    });
  }
};

