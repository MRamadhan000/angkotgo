"use client";

type AlertRouteProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  submitText?: string;
  cancelText?: string;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
};

export default function AlertRoute({
  isOpen,
  title = "Pemberitahuan",
  message,
  submitText = "OK",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
}: AlertRouteProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-route-title"
        aria-describedby="alert-route-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="alert-route-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p id="alert-route-message" className="mt-2 text-sm leading-relaxed text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
