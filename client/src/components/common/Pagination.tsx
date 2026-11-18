import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-white">
      <p className="text-xs text-slate-600">
        Trang <span className="font-semibold text-slate-900">{currentPage}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-stone-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-xs font-medium rounded border ${
              page === currentPage
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-stone-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-stone-50 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

