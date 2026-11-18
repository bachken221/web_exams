import axiosClient from './axiosClient';
import { ApiResponse, AuthResponse, User } from '../types/auth.types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  async register(full_name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', {
      full_name,
      email,
      password,
    });
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async updateProfile(payload: { full_name: string; email: string }): Promise<User> {
    const response = await axiosClient.put<ApiResponse<User>>('/auth/profile', payload);
    return response.data.data;
  },

  async changePassword(payload: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    await axiosClient.put('/auth/change-password', payload);
  },
};
