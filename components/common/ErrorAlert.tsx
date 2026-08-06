import { FiAlertCircle } from "react-icons/fi";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export default function ErrorAlert({
  message,
  className = "",
}: ErrorAlertProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 ${className}`}
    >
      <FiAlertCircle className="h-5 w-5 shrink-0" />

      <span>{message}</span>
    </div>
  );
}