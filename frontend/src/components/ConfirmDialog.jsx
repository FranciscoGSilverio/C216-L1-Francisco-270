import { useEffect, useRef } from "react";
import { buttonDanger, buttonSecondary } from "../ui";

export default function ConfirmDialog({
  title,
  message,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 text-sm text-slate-600">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            ref={cancelRef}
            className={buttonSecondary}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={buttonDanger}
            onClick={onConfirm}
            disabled={busy}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
