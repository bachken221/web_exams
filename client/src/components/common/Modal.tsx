import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div
        className={`w-full ${maxWidth} bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden my-8`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-stone-50">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};
