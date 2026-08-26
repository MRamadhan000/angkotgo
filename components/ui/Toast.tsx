"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastProps {
  show: boolean;
  type?: ToastType;
  message: string;
  onClose: () => void;
}

export default function Toast({ show, type = "success", message, onClose }: ToastProps) {
  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-zinc-950/5 ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/90 dark:text-rose-200"
          }`}
        >
          {/* Ikon Status */}
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}

          {/* Pesan */}
          <p className="text-sm font-medium">
            {message}
          </p>

          {/* Tombol Close */}
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4 opacity-60 hover:opacity-100" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}