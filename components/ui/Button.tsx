"use client";

import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "rounded-xl bg-[#003d9b] text-white shadow-md hover:bg-[#003280]",

    secondary:
      "rounded-xl bg-transparent text-[#434654] hover:bg-[#ededf8]",

    outline:
      "rounded-xl bg-[#f3f3fd] border border-[#c3c6d6] text-[#003d9b] hover:bg-[#e7e7f2]",

    icon:
      "rounded-full bg-[#faf8ff]/90 backdrop-blur-sm text-[#434654] shadow-sm hover:bg-[#f3f3fd]",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",

    md: "h-11 sm:h-12 px-4 text-xs sm:text-sm",

    lg: "h-12 sm:h-14 px-6 text-sm sm:text-base rounded-full shadow-[0_8px_24px_0_rgba(0,82,204,0.3)]",
  };

  // Khusus icon button
  const iconSizes = {
    sm: "w-9 h-9 sm:w-10 sm:h-10 text-lg",
    md: "w-10 h-10 sm:w-11 sm:h-11 text-xl",
    lg: "w-12 h-12 text-xl",
  };

  const sizeStyle =
    variant === "icon" ? iconSizes[size] : sizes[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizeStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span>Memuat...</span>
      ) : (
        <>
          {icon && (
            <span className="flex items-center justify-center">
              {icon}
            </span>
          )}

          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
}