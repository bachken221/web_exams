import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'error',
  message,
  onClose,
}) => {
  if (!message) return null;

  // Tuân thủ bảng màu trạng thái chuẩn trong RULE_CODE.md
  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-slate-100 border-slate-300 text-slate-800',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3 rounded-md border text-sm ${styles[type]}`}>
      <div className="flex items-start gap-2.5">
        {icons[type]}
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 p-0.5"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

