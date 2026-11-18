export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_locked: boolean;
  created_at?: string;
  attempt_count?: number;
  created_exam_count?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
