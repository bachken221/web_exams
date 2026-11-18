import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Đang tải dữ liệu...',
  fullScreen = false,
}) => {
  const wrapperClass = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6'
    : 'py-12 flex flex-col items-center justify-center';

  return (
    <div className={wrapperClass}>
      <div className="w-8 h-8 border-2 border-slate-300 border-t-teal-700 rounded-full animate-spin" />
      <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

