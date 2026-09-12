"use client";

import React from "react";

type AlertDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  variant?: "info" | "warning" | "error";
  onClose: () => void;
};

export function AlertDialog({
  isOpen,
  title,
  description,
  variant = "info",
  onClose,
}: AlertDialogProps) {
  if (!isOpen) return null;

  const headerColor = {
    info: "text-gray-900",
    warning: "text-amber-600",
    error: "text-red-600",
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all">
        <h3 className={`text-lg font-semibold ${headerColor}`}>{title}</h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}