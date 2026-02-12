"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  title, message, confirmText = "确认", cancelText = "取消",
  onConfirm, onCancel, danger,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="animate-fade-in w-full max-w-xs rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-center text-lg font-bold" style={{ color: "#2D2016" }}>{title}</h3>
        <p className="mb-5 text-center text-sm" style={{ color: "#7A6B5D" }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border py-2.5 text-sm font-medium"
            style={{ borderColor: "#E8D4B4", color: "#7A6B5D" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full py-2.5 text-sm font-bold text-white"
            style={{ background: danger ? "#F44336" : "#FF8A00" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
