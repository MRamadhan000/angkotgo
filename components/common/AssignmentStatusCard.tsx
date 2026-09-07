"use client";

import React from "react";
import {
  FaEdit,
  FaBus,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { FaCircleDot, FaClock } from "react-icons/fa6";
import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";

interface AssignmentStatusCardProps {
  status?: AssignmentStatus | string;
  onOpenModal: () => void;
}

interface StatusConfig {
  label: string;
  badgeText: string;
  containerClass: string;
  iconBgClass: string;
  icon: React.ReactNode;
  subIcon?: React.ReactNode;
  buttonClass: string;
  textColorClass: string;
  isLivePing?: boolean;
}

export function AssignmentStatusCard({
  status,
  onOpenModal,
}: AssignmentStatusCardProps) {
  if (!status) return null;

  const currentStatus = status.toUpperCase();

  // Konfigurasi UI berdasarkan Enum AssignmentStatus (4 Status Utama)
  const statusMap: Record<string, StatusConfig> = {
    [AssignmentStatus.ONGOING]: {
      label: "ONGOING (BERLANGSUNG)",
      badgeText: "Status Penugasan Saat Ini",
      containerClass:
        "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30",
      iconBgClass:
        "bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-inner",
      icon: <FaBus className="text-xl" />,
      subIcon: (
        <FaCircleDot className="text-[9px] text-emerald-300 animate-pulse" />
      ),
      buttonClass:
        "bg-white text-emerald-800 hover:bg-emerald-50 shadow-md hover:shadow-lg",
      textColorClass: "text-emerald-100",
      isLivePing: true,
    },
    [AssignmentStatus.SCHEDULED]: {
      label: "SCHEDULED (TERJADWAL)",
      badgeText: "Status Penugasan Saat Ini",
      containerClass:
        "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30",
      iconBgClass:
        "bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-inner",
      icon: <FaCalendarAlt className="text-xl" />,
      subIcon: <FaClock className="text-[10px] text-blue-200" />,
      buttonClass:
        "bg-white text-blue-800 hover:bg-blue-50 shadow-md hover:shadow-lg",
      textColorClass: "text-blue-100",
    },
    [AssignmentStatus.COMPLETED]: {
      label: "COMPLETED (SELESAI)",
      badgeText: "Status Penugasan Saat Ini",
      containerClass:
        "bg-slate-900 text-white shadow-md border border-slate-800",
      iconBgClass:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      icon: <FaCheckCircle className="text-xl" />,
      buttonClass:
        "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 shadow-sm",
      textColorClass: "text-slate-400",
    },
    [AssignmentStatus.CANCELLED]: {
      label: "CANCELLED (DIBATALKAN)",
      badgeText: "Status Penugasan Saat Ini",
      containerClass:
        "bg-rose-50 text-rose-900 border border-rose-200 shadow-xs",
      iconBgClass: "bg-rose-100 text-rose-600 border border-rose-200",
      icon: <FaTimesCircle className="text-xl" />,
      buttonClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
      textColorClass: "text-rose-500",
    },
  };

  // Konfigurasi fallback jika status tidak sesuai dengan enum
  const config = statusMap[currentStatus] || {
    label: currentStatus,
    badgeText: "Status Penugasan Saat Ini",
    containerClass:
      "bg-white text-slate-800 border border-slate-200/80 shadow-xs",
    iconBgClass: "bg-slate-100 text-slate-500 border border-slate-200/50",
    icon: <FaInfoCircle className="text-xl" />,
    buttonClass: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    textColorClass: "text-slate-400",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${config.containerClass}`}
    >
      {/* Background Ambient Glow untuk status gradient */}
      {(currentStatus === AssignmentStatus.ONGOING ||
        currentStatus === AssignmentStatus.SCHEDULED) && (
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      )}

      {/* Detail Status & Icon */}
      <div className="flex items-center gap-3.5 z-10">
        <div
          className={`relative h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${config.iconBgClass}`}
        >
          {config.icon}
          {config.isLivePing && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
            </span>
          )}
        </div>

        <div>
          <div
            className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.textColorClass}`}
          >
            {config.subIcon}
            <span>{config.badgeText}</span>
          </div>
          <div className="text-base sm:text-lg font-black tracking-wide mt-0.5">
            {config.label}
          </div>
        </div>
      </div>

      {/* Tombol Modal Ubah Status */}
      <button
        type="button"
        onClick={onOpenModal}
        className={`z-10 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer ${config.buttonClass}`}
      >
        <FaEdit className="text-xs" />
        <span>Ubah Status</span>
      </button>
    </div>
  );
}