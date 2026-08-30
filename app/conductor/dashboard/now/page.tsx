"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FaMapMarkedAlt,
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaRoute,
  FaTimesCircle,
  FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { DetailHeader } from "@/components/common/DetailHeader";
import { useSeatManagement } from "@/hooks/vehicles/useSeatManagement";
import { SeatGridControl } from "@/components/now/SeatGridControl";
import {
  AssignmentStatus,
  DirectionType,
  VehicleStatus,
  VehicleType,
} from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

export default function ConductorActivePage() {
  const { user, logout } = useAuth();
  const {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,
  } = usePersonnelSchedule();

  const getTodayDateString = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());

  const displaySchedule: TripHistoryItem[] = activeSchedule || [];

  useEffect(() => {
    if (user?.id) {
      fetchActiveScheduleByPersonnel({
        targetDate: selectedDate !== "" ? selectedDate : undefined,
        conductorId: Number(user.id),
      });
    }
  }, [user, selectedDate, fetchActiveScheduleByPersonnel]);

  // Mengelompokkan activeSchedule berdasarkan tanggal
  const groupedSchedule = useMemo(() => {
    const groups: { [key: string]: typeof activeSchedule } = {};

    displaySchedule.forEach((item: any) => {
      const dateKey =
        typeof item.date === "string"
          ? item.date.split("T")[0]
          : new Date(item.date).toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((dateKey) => ({
        dateKey,
        formattedDate: new Date(dateKey).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: groups[dateKey],
      }));
  }, [displaySchedule]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          title="Jadwal Penugasan Kondektur"
          description="Kelola dan pantau daftar rute penugasan kendaraan aktif Anda."
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
          {/* Header & Filter Tanggal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FaMapMarkedAlt className="text-blue-600 shrink-0" />
              <span className="truncate">Jadwal Aktif Kondektur</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <label
                  htmlFor="schedule-date"
                  className="text-xs font-semibold text-gray-500 flex items-center gap-1 shrink-0"
                >
                  <FaCalendarAlt className="text-gray-400" />
                  Tanggal:
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${selectedDate === ""
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
              >
                <FaTimesCircle
                  className={
                    selectedDate === "" ? "text-white" : "text-gray-400"
                  }
                />
                Semua Tanggal
              </button>
            </div>
          </div>

          {activeLoading && (
            <div className="text-center py-8 text-xs sm:text-sm text-gray-500">
              Memuat jadwal aktif...
            </div>
          )}

          {activeError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs sm:text-sm">
              {activeError}
            </div>
          )}

          {!activeLoading && !activeError && displaySchedule.length === 0 && (
            <div className="text-center py-10 px-4 text-xs sm:text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              {selectedDate
                ? `Tidak ada jadwal penugasan aktif untuk tanggal ${selectedDate}.`
                : "Tidak ada jadwal penugasan aktif secara keseluruhan."}
            </div>
          )}

          {!activeLoading && !activeError && displaySchedule.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {groupedSchedule.map((group) => (
                <div
                  key={group.dateKey}
                  className="bg-slate-50/60 rounded-xl border border-gray-200/80 p-3 sm:p-5 space-y-3 sm:space-y-4"
                >
                  {/* Header Container per Tanggal */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-200 text-slate-800 font-bold text-xs sm:text-base">
                    <div className="flex items-center gap-2 truncate">
                      <FaCalendarAlt className="text-blue-600 shrink-0" />
                      <span className="truncate">{group.formattedDate}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                      {group.items.length} Jadwal
                    </span>
                  </div>

                  {/* Grid Card dalam Container Tanggal Tersebut */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {group.items.map((item: TripHistoryItem) => {
                      const statusBadge =
                        item.status === AssignmentStatus.ONGOING
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-blue-100 text-blue-800 border-blue-200";

                      const vehicleTypeBadge =
                        item.vehicle?.type === "PREMIUM"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : "bg-slate-100 text-slate-700 border-slate-200";

                      return (
                        <div
                          key={item.assignmentId}
                          className="group bg-white rounded-xl border border-gray-200 p-3.5 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between gap-3 relative"
                        >
                          <div className="space-y-2.5 sm:space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full border uppercase tracking-wider ${statusBadge}`}
                                >
                                  {item.status}
                                </span>
                                {item.vehicle?.type && (
                                  <span
                                    className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md border uppercase ${vehicleTypeBadge}`}
                                  >
                                    {item.vehicle.type}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] sm:text-xs text-gray-500">
                                  Arah:
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wide border ${item.direction === "FORWARD"
                                    ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                >
                                  {item.direction}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-start gap-1.5">
                                <FaClock className="text-gray-400 shrink-0 mt-0.5 text-xs" />
                                <div className="min-w-0">
                                  <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold">
                                    Waktu
                                  </div>
                                  <span className="font-semibold text-slate-700 text-xs sm:text-sm block truncate">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-start gap-1.5">
                                <FaBus className="text-gray-400 shrink-0 mt-0.5 text-xs" />
                                <div className="min-w-0">
                                  <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold">
                                    Kendaraan
                                  </div>
                                  <span className="font-semibold text-slate-700 text-xs sm:text-sm block truncate">
                                    {item.vehicle?.plateNumber || "-"} (
                                    {item.vehicle?.vehicleCode || "-"})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Seat control for conductor (isUserConductor = true) */}
                          <div className="mt-2">
                            <AssignmentSeatWidget
                              assignmentId={item.assignmentId}
                            />
                          </div>

                          <div className="pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] sm:text-xs">
                            <div className="text-gray-500 truncate pr-2">
                              Driver:{" "}
                              <span className="font-medium text-slate-700">
                                {item.driver?.name || "Tidak ada"}
                              </span>
                            </div>
                            <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                              Detail{" "}
                              <FaArrowRight className="text-[9px] sm:text-[10px]" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentSeatWidget({ assignmentId }: { assignmentId: number }) {
  const {
    status,
    loading: seatsLoading,
    error: seatsError,
    canControl,
    toggleSeat,
    toggleJourneyStatus,
  } = useSeatManagement(String(assignmentId), true);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">
            Kontrol Perjalanan
          </h3>
          <p className="text-xs text-gray-500">
            Status:{" "}
            <span className="font-semibold text-slate-800">
              {status?.status || "-"}
            </span>
          </p>
        </div>
        <button
          type="button"
          disabled={!canControl || !status}
          onClick={toggleJourneyStatus}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${canControl && status
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          {status?.status === AssignmentStatus.ONGOING
            ? "Set Selesai"
            : "Mulai Perjalanan"}
        </button>
      </div>

      <SeatGridControl
        seats={status?.seats || []}
        canControl={canControl}
        onToggleSeat={toggleSeat}
        hasConductor={status?.hasConductor || false}
        isUserConductor={true}
      />

      {seatsLoading && (
        <div className="text-xs text-gray-400 mt-2">Memuat status kursi...</div>
      )}
      {seatsError && (
        <div className="text-xs text-rose-600 mt-2">{seatsError}</div>
      )}
    </div>
  );
}
