"use client";

import React, { useState, useRef } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaChair,
  FaMoneyBillWave,
  FaRoute,
  FaCircleDot,
  FaPenToSquare,
} from "react-icons/fa6";
import { AssignmentStatus, VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";
import { RouteStopType } from "@/types/routes/route-stop.type";
import { DriverSeatControl } from "./DriverSeatControl";
import { DriverQuickActions } from "./DriverQuickActions";
import { RouteStopInfoBar } from "./RouteStopInfoBar";
import { PaymentMonitor } from "./PaymentMonitor";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";

export type DriverTabType = "kursi" | "pembayaran" | "halte";

interface DriverBottomSheetProps {
  assignmentDetail: VehicleAssignment;
  isUpdatingStatus: boolean;
  onUpdatePassengers: (count: number) => Promise<unknown>;
  onOpenStatusModal: () => void;
  onOpenLocationModal: () => void;
  isUpdatingLocation: boolean;
  routeStops: RouteStopType[];
  // Payments
  payments: any[];
  paymentSummary: Record<string, number> | null;
  paymentsLoading: boolean;
  paymentsError: string | null;
  paymentRealtimeStatus: { connected: boolean; joined: boolean };
}

export function DriverBottomSheet({
  assignmentDetail,
  isUpdatingStatus,
  onUpdatePassengers,
  onOpenStatusModal,
  onOpenLocationModal,
  isUpdatingLocation,
  routeStops,
  payments,
  paymentSummary,
  paymentsLoading,
  paymentsError,
  paymentRealtimeStatus,
}: DriverBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DriverTabType>("kursi");

  // Drag handling
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    // Swipe up -> expand
    if (deltaY < -40 && !isExpanded) {
      setIsExpanded(true);
    }
    // Swipe down -> collapse
    else if (deltaY > 40 && isExpanded) {
      setIsExpanded(false);
    }
    touchStartY.current = null;
  };

  const handleTabClick = (tab: DriverTabType) => {
    setActiveTab(tab);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const currentPassengers = assignmentDetail?.currentPassengers || 0;
  const capacity = assignmentDetail?.vehicle?.capacity || 8;
  const availableSeats = Math.max(0, capacity - currentPassengers);

  // Total paid calculation
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case AssignmentStatus.ONGOING:
        return {
          label: "Beroperasi",
          bg: "bg-emerald-500",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case AssignmentStatus.SCHEDULED:
        return {
          label: "Terjadwal",
          bg: "bg-blue-500",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case AssignmentStatus.COMPLETED:
        return {
          label: "Selesai",
          bg: "bg-slate-500",
          badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
        };
      case AssignmentStatus.CANCELLED:
        return {
          label: "Dibatalkan",
          bg: "bg-rose-500",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: status || "Siap Jalan",
          bg: "bg-amber-500",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  };

  const statusBadge = getStatusBadge(assignmentDetail?.status);

  return (
    <div
      className={`pointer-events-auto fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-t-[32px] border-t border-slate-200/90 bg-white/98 shadow-[0_-10px_35px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all duration-300 ease-out ${
        isExpanded ? "h-[76vh] sm:h-[72vh]" : "h-[152px] sm:h-[175px]"
      }`}
    >
      {/* DRAG HANDLE & HEADER STRIP */}
      <div
        className="shrink-0 cursor-grab px-4 pt-1.5 pb-1 touch-none select-none active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mx-auto h-1 w-10 sm:h-1.5 sm:w-12 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
      </div>

      {/* QUICK OVERVIEW BAR (Always visible in peek & expanded) */}
      <div className="shrink-0 px-2.5 sm:px-4 pb-1 sm:pb-1.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Status Badge (Click to update status) */}
          <button
            type="button"
            onClick={onOpenStatusModal}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold transition hover:opacity-90 active:scale-95 ${statusBadge.badgeBg}`}
            title="Klik untuk ubah status perjalanan"
          >
            <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${statusBadge.bg} ${assignmentDetail?.status === AssignmentStatus.ONGOING ? "animate-pulse" : ""}`} />
            <span>{statusBadge.label}</span>
            <FaPenToSquare className="ml-0.5 text-[9px] sm:text-[10px] opacity-70" />
          </button>

          {/* Sisa Kursi Pill */}
          <button
            type="button"
            onClick={() => handleTabClick("kursi")}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-slate-100/80 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition"
          >
            <FaChair className={`text-[10px] ${availableSeats > 0 ? "text-emerald-500" : "text-rose-500"}`} />
            <span>
              {currentPassengers}/{capacity} Kursi
            </span>
          </button>

          {/* Total Uang Pill */}
          <button
            type="button"
            onClick={() => handleTabClick("pembayaran")}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-emerald-50 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition"
          >
            <FaMoneyBillWave className="text-emerald-600 text-[10px] sm:text-xs" />
            <span>{formatCurrency(totalPaid)}</span>
          </button>

          {/* Expand / Minimize Toggle Icon */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
            aria-label={isExpanded ? "Tutup panel detail" : "Buka panel detail"}
          >
            {isExpanded ? (
              <FaChevronDown className="text-[10px] sm:text-xs" />
            ) : (
              <FaChevronUp className="text-[10px] sm:text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* PINTASAN TABS (Segmented Buttons for Fast thumb navigation) */}
      <div className="shrink-0 px-2.5 sm:px-4 py-1 border-b border-slate-100">
        <div className="grid grid-cols-3 gap-1 rounded-xl sm:rounded-2xl bg-slate-100/90 p-0.5 sm:p-1">
          <button
            type="button"
            onClick={() => handleTabClick("kursi")}
            className={`flex items-center justify-center gap-1 rounded-lg sm:rounded-xl py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === "kursi"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaChair className="text-[10px] sm:text-xs" />
            <span>Kursi</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("pembayaran")}
            className={`flex items-center justify-center gap-1 rounded-lg sm:rounded-xl py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === "pembayaran"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaMoneyBillWave className="text-[10px] sm:text-xs" />
            <span>Kasir</span>
            {payments.length > 0 && (
              <span className="ml-0.5 rounded-full bg-emerald-500 px-1 py-0.1 text-[8px] sm:text-[9px] font-extrabold text-white leading-none">
                {payments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("halte")}
            className={`flex items-center justify-center gap-1 rounded-lg sm:rounded-xl py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === "halte"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaRoute className="text-[10px] sm:text-xs" />
            <span>Halte</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-2 sm:py-3 pb-8 overscroll-contain">
        {activeTab === "kursi" && (
          <div className="space-y-2.5 sm:space-y-3.5">
            {/* Passenger Seat Grid */}
            <DriverSeatControl
              assignmentDetail={assignmentDetail}
              onUpdate={onUpdatePassengers}
              isUpdating={isUpdatingStatus}
            />

            {/* Status Perjalanan Card */}
            <AssignmentStatusCard
              status={assignmentDetail.status}
              onOpenModal={onOpenStatusModal}
            />
          </div>
        )}

        {activeTab === "pembayaran" && (
          <div className="space-y-3">
            <PaymentMonitor
              payments={payments}
              summary={paymentSummary}
              loading={paymentsLoading}
              error={paymentsError}
              connected={paymentRealtimeStatus.connected}
              joined={paymentRealtimeStatus.joined}
            />
          </div>
        )}

        {activeTab === "halte" && (
          <div className="space-y-3">
            <DriverQuickActions
              onSelectLocation={onOpenLocationModal}
              isSubmitting={isUpdatingLocation}
              hasRouteStops={routeStops.length > 0}
            />

            <RouteStopInfoBar
              stopCount={routeStops.length}
              direction={assignmentDetail.direction}
            />

            {/* Quick stop cards list */}
            {routeStops.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800">
                  Daftar Halte Rute
                </h4>
                <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                  {routeStops.map((stop, idx) => (
                    <div
                      key={stop.id ?? idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                          {stop.stopOrder}
                        </span>
                        <span className="truncate font-semibold text-slate-800">
                          {stop.stopName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
