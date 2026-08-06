import { FiClock, FiPlayCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";

export const renderStatusBadge = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <FiClock className="w-3.5 h-3.5" /> Scheduled
        </span>
      );
    case "ONGOING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <FiPlayCircle className="w-3.5 h-3.5" /> Ongoing
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <FiCheckCircle className="w-3.5 h-3.5" /> Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <FiXCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-200">
          {status}
        </span>
      );
  }
};