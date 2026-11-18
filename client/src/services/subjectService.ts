import axiosClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { Subject } from '../types/exam.types';

export interface SubjectPayload {
  code: string;
  name: string;
  description: string;
}

export const subjectService = {
  async getAllSubjects(): Promise<Subject[]> {
    const response = await axiosClient.get<ApiResponse<Subject[]>>('/subjects');
    return response.data.data;
  },

  async createSubject(payload: SubjectPayload): Promise<Subject> {
    const response = await axiosClient.post<ApiResponse<Subject>>('/subjects', payload);
    return response.data.data;
  },

  async updateSubject(id: number, payload: SubjectPayload): Promise<Subject> {
    const response = await axiosClient.put<ApiResponse<Subject>>(`/subjects/${id}`, payload);
    return response.data.data;
  },

  async deleteSubject(id: number): Promise<void> {
    await axiosClient.delete(`/subjects/${id}`);
  },
};

