import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import {
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";

interface StatusFilterButtonProps {
  status: string;
  active: boolean;
  onClick: () => void;
}

const STATUS_CONFIG = {
  ALL: {
    label: "Semua",
    icon: FiFilter,
    activeClass: "bg-red-600 border-red-600 text-white shadow-sm",
  },
  [AssignmentStatus.SCHEDULED]: {
    label: "Scheduled",
    icon: FiClock,
    activeClass: "bg-amber-50 border-amber-200 text-amber-800",
  },
  [AssignmentStatus.ONGOING]: {
    label: "Ongoing",
    icon: FiPlayCircle,
    activeClass: "bg-blue-50 border-blue-200 text-blue-800",
  },
  [AssignmentStatus.COMPLETED]: {
    label: "Completed",
    icon: FiCheckCircle,
    activeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  [AssignmentStatus.CANCELLED]: {
    label: "Cancelled",
    icon: FiXCircle,
    activeClass: "bg-rose-50 border-rose-200 text-rose-800",
  },
} as const;

export default function StatusFilterButton({
  status,
  active,
  onClick,
}: StatusFilterButtonProps) {
  const baseClass =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer";

  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ALL;

  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} ${
        active
          ? config.activeClass
          : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </button>
  );
}
