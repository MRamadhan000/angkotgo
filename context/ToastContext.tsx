"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Toast from "@/components/ui/Toast";

type ToastType = "success" | "error";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({
    show: false,
    type: "success" as ToastType,
    message: "",
  });

  const showToast = (type: ToastType, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const success = (message: string) => showToast("success", message);
  const error = (message: string) => showToast("error", message);
  const close = () => setToast((prev) => ({ ...prev, show: false }));

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      {/* Komponen Toast dipasang sekali di sini secara global */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={close}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}