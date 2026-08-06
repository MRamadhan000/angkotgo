import { ReactNode } from "react";
import { FaInfoCircle } from "react-icons/fa";

interface InfoNoticeProps {
  children: ReactNode;
  icon?: ReactNode;
  color?: "green" | "blue" | "amber" | "red";
}

const COLOR_VARIANTS = {
  green: "bg-green-50 border-green-100 text-green-700",
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  red: "bg-red-50 border-red-100 text-red-700",
} as const;

export default function InfoNotice({
  children,
  icon,
  color = "green",
}: InfoNoticeProps) {
  return (
    <div
      className={`mt-5 rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${COLOR_VARIANTS[color]}`}
    >
      <div className="flex items-start gap-2 text-[11px] leading-relaxed sm:text-xs">
        {icon ?? (
          <FaInfoCircle className="mt-0.5 shrink-0" />
        )}

        <span>{children}</span>
      </div>
    </div>
  );
}