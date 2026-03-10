import React, { useEffect } from "react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
}) {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const btnConfirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-neutral-800 hover:bg-neutral-900 text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-neutral-200">
        <h3 id="confirm-title" className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="btn-neutral-outline py-2 min-h-[2.75rem]"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 rounded-lg font-medium min-h-[2.75rem] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 ${btnConfirmClass}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
