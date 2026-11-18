import { useEffect, useMemo, useState } from 'react';

// Custom Hook tái sử dụng logic phân trang cho các bảng dữ liệu
export function usePagination<T>(items: T[], itemsPerPage = 8) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  // Tự động điều chỉnh về trang hợp lệ khi danh sách lọc thay đổi
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    resetPage,
  };
}
