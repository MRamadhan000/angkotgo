import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

export default function PrimaryButton({
  children,
  loading,
  loadingText = "Loading...",
  icon,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`group flex h-12 w-full items-center justify-center gap-2 rounded-2xl
      bg-gradient-to-r
      from-blue-600
      to-cyan-500
      font-bold
      text-white
      shadow-md
      shadow-blue-500/25
      transition-all
      hover:from-blue-700
      hover:to-cyan-600
      hover:scale-[1.01]
      active:scale-[0.99]
      disabled:opacity-60
      ${className}`}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}