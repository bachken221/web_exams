import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDetailItem {
  label: string;
  value: React.ReactNode;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: ConfirmDetailItem[];
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'amber' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const iconBoxStyle =
    variant === 'danger'
      ? 'bg-rose-50 border-rose-200 text-rose-700'
      : variant === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : 'bg-teal-50 border-teal-200 text-teal-700';

  const renderIcon = () => {
    if (variant === 'danger') return <AlertTriangle className="w-5 h-5" />;
    if (variant === 'amber') return <Info className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  return createPortal(
    <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden my-8">
        {/* Tiêu đề Popup */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-stone-50">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-slate-500 hover:text-slate-800 p-1 rounded disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung xác nhận */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${iconBoxStyle}`}
            >
              {renderIcon()}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{message}</p>
          </div>

          {/* Bảng thông tin tóm tắt */}
          {details && details.length > 0 && (
            <div className="p-3.5 rounded bg-stone-50 border border-slate-200 space-y-2 text-xs">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3">
                  <span className="text-slate-500 shrink-0">{item.label}:</span>
                  <span className="font-semibold text-slate-900 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Nút thao tác */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
