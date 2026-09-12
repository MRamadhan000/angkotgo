// components/ui/AlertModal.tsx
import React from "react";

export type ModalState = {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
} | null;

type AlertModalProps = {
  modalState: ModalState;
  onClose: () => void;
};

export function AlertModal({ modalState, onClose }: AlertModalProps) {
  if (!modalState || !modalState.isOpen) return null;

  const {
    title = "Pemberitahuan",
    message,
    confirmText = "OK",
    cancelText,
    onConfirm,
    onCancel,
  } = modalState;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          {/* Tombol Cancel hanya muncul jika cancelText diisi */}
          {cancelText && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}