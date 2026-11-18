import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/error';

interface UseAsyncDataOptions<T> {
  initialData: T;
  autoFetch?: boolean;
  fallbackError?: string;
  onForbidden?: () => void;
}

// Custom Hook chuẩn hóa việc gọi API bất đồng bộ (quản lý loading, error, data và reload)
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions<T>
) {
  const {
    initialData,
    autoFetch = true,
    fallbackError = 'Không thể tải dữ liệu từ máy chủ',
    onForbidden,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string>('');

  const execute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err: any) {
      if (err?.response?.status === 403 && onForbidden) {
        onForbidden();
        return null;
      }
      setError(getErrorMessage(err, fallbackError));
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [execute, autoFetch]);

  return {
    data,
    setData,
    loading,
    error,
    setError,
    reload: execute,
  };
}
