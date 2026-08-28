"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "icon"
    | "mapAction"
    | "textAction"
    | "inputClear";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Memuat...",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70";

  const variants = {
    primary: "rounded-xl bg-[#003d9b] text-white shadow-md hover:bg-[#003280]",

    secondary: "rounded-xl bg-transparent text-[#434654] hover:bg-[#ededf8]",

    outline:
      "rounded-xl border border-[#c3c6d6] bg-[#f3f3fd] text-[#003d9b] hover:bg-[#e7e7f2]",

    icon: "rounded-full bg-[#faf8ff]/90 text-[#434654] shadow-sm backdrop-blur-sm hover:bg-[#f3f3fd]",

    mapAction:
      "w-full rounded-xl border border-white/80 bg-white/95 text-[#003d9b] shadow-xl backdrop-blur-md hover:bg-white",

    textAction:
      "mt-1 w-full rounded-lg text-[11px] font-semibold text-[#003d9b] hover:bg-blue-50",

    inputClear:
      "absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",

    md: "h-11 px-4 text-xs sm:h-12 sm:text-sm",

    lg: "h-12 rounded-full px-6 text-sm shadow-[0_8px_24px_0_rgba(0,82,204,0.3)] sm:h-14 sm:text-base",
  };

  const iconSizes = {
    sm: "h-9 w-9 text-lg sm:h-10 sm:w-10",

    md: "h-10 w-10 text-xl sm:h-11 sm:w-11",

    lg: "h-12 w-12 text-xl",
  };

  const sizeStyle = variant === "icon" ? iconSizes[size] : sizes[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizeStyle} ${className}`}
      {...props}
    >
      {icon && (
        <span
          className={`flex shrink-0 items-center justify-center ${
            isLoading ? "opacity-80" : ""
          }`}
        >
          {icon}
        </span>
      )}

      {(children || isLoading) && (
        <span>{isLoading ? loadingText : children}</span>
      )}
    </button>
  );
}
