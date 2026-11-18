import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import {
  AttemptDetailResponse,
  Exam,
  ExamAttempt,
  ExamRoomQuestion,
} from '../types/exam.types';
import { TeacherDashboardStats } from '../types/user.types';

export interface ExamPayload {
  subject_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  pass_score: number;
  is_published: boolean;
}

export const examService = {
  async getExams(params?: { subject_id?: string | number; search?: string }): Promise<Exam[]> {
    const response = await axiosClient.get<ApiResponse<Exam[]>>('/exams', { params });
    return response.data.data;
  },

  async getExamById(id: number): Promise<Exam> {
    const response = await axiosClient.get<ApiResponse<Exam>>(`/exams/${id}`);
    return response.data.data;
  },

  async createExam(payload: ExamPayload): Promise<Exam> {
    const response = await axiosClient.post<ApiResponse<Exam>>('/exams', payload);
    return response.data.data;
  },

  async updateExam(id: number, payload: ExamPayload): Promise<void> {
    await axiosClient.put(`/exams/${id}`, payload);
  },

  async togglePublish(id: number): Promise<{ id: number; is_published: boolean }> {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; is_published: boolean }>
    >(`/exams/${id}/publish`);
    return response.data.data;
  },

  async deleteExam(id: number): Promise<void> {
    await axiosClient.delete(`/exams/${id}`);
  },

  async getTeacherDashboardStats(): Promise<TeacherDashboardStats> {
    const response = await axiosClient.get<ApiResponse<TeacherDashboardStats>>(
      '/exams/teacher/stats'
    );
    return response.data.data;
  },

  // Lấy câu hỏi cho phòng thi sinh viên (Đã ẩn đáp án đúng)
  async getRoomQuestions(
    examId: number
  ): Promise<{ exam: Exam; questions: ExamRoomQuestion[] }> {
    const response = await axiosClient.get<
      ApiResponse<{ exam: Exam; questions: ExamRoomQuestion[] }>
    >(`/attempts/exam/${examId}/questions`);
    return response.data.data;
  },

  // Nộp bài thi của sinh viên
  async submitExam(
    examId: number,
    answers: Record<string, string>,
    started_at: string
  ): Promise<{
    attempt_id: number;
    exam_id: number;
    score: number;
    total_correct: number;
    total_questions: number;
    is_passed: boolean;
  }> {
    const response = await axiosClient.post<
      ApiResponse<{
        attempt_id: number;
        exam_id: number;
        score: number;
        total_correct: number;
        total_questions: number;
        is_passed: boolean;
      }>
    >(`/attempts/exam/${examId}/submit`, { answers, started_at });
    return response.data.data;
  },

  // Xem chi tiết 1 lượt thi
  async getAttemptDetail(attemptId: number): Promise<AttemptDetailResponse> {
    const response = await axiosClient.get<ApiResponse<AttemptDetailResponse>>(
      `/attempts/${attemptId}`
    );
    return response.data.data;
  },

  // Lịch sử thi cá nhân của sinh viên
  async getMyHistory(): Promise<ExamAttempt[]> {
    const response = await axiosClient.get<ApiResponse<ExamAttempt[]>>(
      '/attempts/my-history'
    );
    return response.data.data;
  },

  // Bảng điểm sinh viên theo đề thi (Dành cho Giảng viên / Admin)
  async getExamResults(
    examId: number
  ): Promise<{ exam: Exam; results: ExamAttempt[] }> {
    const response = await axiosClient.get<
      ApiResponse<{ exam: Exam; results: ExamAttempt[] }>
    >(`/attempts/exam/${examId}/results`);
    return response.data.data;
  },
};

