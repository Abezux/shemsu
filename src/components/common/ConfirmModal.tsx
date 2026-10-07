import React from 'react';
import BottomSheet from './BottomSheet';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} maxWidthClass="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-agora-ink-muted leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-agora-ink-muted hover:text-agora-ink rounded-xl hover:bg-agora-bg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
              isDanger
                ? 'bg-agora-brick hover:bg-agora-brick/90'
                : 'bg-agora-terracotta hover:bg-agora-terracotta/90'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
