import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';

import authRoutes from './routes/authRoutes';
import subjectRoutes from './routes/subjectRoutes';
import examRoutes from './routes/examRoutes';
import questionRoutes from './routes/questionRoutes';
import attemptRoutes from './routes/attemptRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// API Health-Check kiểm tra kết nối MySQL Pool
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      message: 'OK',
      data: { status: 'OK', timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không thể kết nối Cơ sở dữ liệu MySQL',
      data: null,
    });
  }
});

// Gắn các nhánh Routes theo đúng kiến trúc phân tầng
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/users', userRoutes);

// Xử lý đường dẫn API không tồn tại
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'error',
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại http://localhost:${PORT}`);
});

