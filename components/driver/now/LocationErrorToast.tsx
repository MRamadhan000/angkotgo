"use client";

import React, { useEffect, useState } from "react";
import { FaTriangleExclamation, FaXmark } from "react-icons/fa6";

interface LocationErrorToastProps {
  message: string | null;
}

export function LocationErrorToast({ message }: LocationErrorToastProps) {
  const [visible, setVisible] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setVisible(true);
    } else {
      setVisible(false);
      // Keep message for exit animation
      const timeout = setTimeout(() => setDisplayedMessage(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!displayedMessage) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-white shadow-lg shadow-red-600/30">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
          <FaTriangleExclamation className="text-sm" />
        </div>
        <p className="flex-1 text-xs font-medium leading-snug sm:text-sm">
          {displayedMessage}
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white/90 transition-colors hover:bg-white/30 active:scale-95"
          aria-label="Tutup notifikasi"
        >
          <FaXmark className="text-xs" />
        </button>
      </div>
    </div>
  );
}
