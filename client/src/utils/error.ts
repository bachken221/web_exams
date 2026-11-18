// Hàm tiện ích trích xuất thông báo lỗi thống nhất từ phản hồi API Axios
export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Đã xảy ra lỗi kết nối máy chủ. Vui lòng thử lại.'
): string {
  if (error && typeof error === 'object') {
    const axiosErr = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return fallbackMessage;
}
