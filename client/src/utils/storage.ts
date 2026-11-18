const TOKEN_KEY = 'quiz_web_token';
const USER_KEY = 'quiz_web_user';

export const storage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Không thể lưu token vào localStorage', error);
    }
  },

  getUser<T>(): T | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Không thể lưu user vào localStorage', error);
    }
  },

  clearAuth(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Không thể xóa dữ liệu xác thực', error);
    }
  },

  // Lưu trạng thái bài làm đang thi vào sessionStorage để chống mất bài khi nhấn F5
  getExamSession<T>(examId: number, userId: number): T | null {
    try {
      const key = `exam_session_${userId}_${examId}`;
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  setExamSession<T>(examId: number, userId: number, state: T): void {
    try {
      const key = `exam_session_${userId}_${examId}`;
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Lỗi lưu trạng thái phòng thi vào sessionStorage', error);
    }
  },

  clearExamSession(examId: number, userId: number): void {
    try {
      const key = `exam_session_${userId}_${examId}`;
      sessionStorage.removeItem(key);
    } catch {
      // Bỏ qua lỗi
    }
  },
};

