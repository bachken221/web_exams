import axiosClient from './axiosClient';
import { ApiResponse, User, UserRole } from '../types/auth.types';
import { AdminDashboardStats } from '../types/user.types';

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  full_name: string;
  email: string;
  role: UserRole;
  new_password?: string;
}

export const userService = {
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await axiosClient.get<ApiResponse<AdminDashboardStats>>('/users/stats');
    return response.data.data;
  },

  async getAllUsers(params?: { role?: string; search?: string }): Promise<User[]> {
    const response = await axiosClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await axiosClient.post<ApiResponse<User>>('/users', payload);
    return response.data.data;
  },

  async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    const response = await axiosClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data.data;
  },

  async updateRole(id: number, role: UserRole): Promise<{ id: number; role: UserRole }> {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; role: UserRole }>
    >(`/users/${id}/role`, { role });
    return response.data.data;
  },

  async toggleLock(id: number): Promise<{ id: number; is_locked: boolean }> {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; is_locked: boolean }>
    >(`/users/${id}/lock`);
    return response.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axiosClient.delete(`/users/${id}`);
  },
};
