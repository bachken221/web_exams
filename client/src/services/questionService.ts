import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { Exam, Question } from '../types/exam.types';

export interface QuestionPayload {
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export const questionService = {
  async getQuestionsByExam(
    examId: number
  ): Promise<{ exam: Exam; questions: Question[] }> {
    const response = await axiosClient.get<
      ApiResponse<{ exam: Exam; questions: Question[] }>
    >(`/questions/exam/${examId}`);
    return response.data.data;
  },

  async createQuestion(examId: number, payload: QuestionPayload): Promise<Question> {
    const response = await axiosClient.post<ApiResponse<Question>>(
      `/questions/exam/${examId}`,
      payload
    );
    return response.data.data;
  },

  async updateQuestion(id: number, payload: QuestionPayload): Promise<void> {
    await axiosClient.put(`/questions/${id}`, payload);
  },

  async deleteQuestion(id: number): Promise<void> {
    await axiosClient.delete(`/questions/${id}`);
  },
};

