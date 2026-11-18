import { useCallback, useState } from 'react';
import { getErrorMessage } from '../utils/error';

// Custom Hook quản lý thông báo lỗi và thành công tái sử dụng cho mọi màn hình
export function useNotification() {
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const showError = useCallback((err: unknown, fallback?: string) => {
    setSuccessMsg('');
    if (typeof err === 'string') {
      setError(err);
    } else {
      setError(getErrorMessage(err, fallback));
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    setError('');
    setSuccessMsg(message);
  }, []);

  const clearNotifications = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    error,
    successMsg,
    setError,
    setSuccessMsg,
    showError,
    showSuccess,
    clearNotifications,
  };
}
