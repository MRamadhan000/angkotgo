"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaMapMarkedAlt,
  FaRoute,
  FaTimesCircle,
  FaUserAlt,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { useSeatManagement } from "@/hooks/vehicles/useSeatManagement";
import { SeatGridControl } from "@/components/now/SeatGridControl";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function DriverActivePage() {
  const { user, logout } = useAuth();

  const {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,
  } = usePersonnelSchedule();

  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());

  useEffect(() => {
    if (!user?.id) return;

    fetchActiveScheduleByPersonnel({
      driverId: Number(user.id),
      targetDate: selectedDate || undefined,
    });
  }, [user?.id, selectedDate, fetchActiveScheduleByPersonnel]);

  const displaySchedule = useMemo<TripHistoryItem[]>(() => {
    return activeSchedule || [];
  }, [activeSchedule]);

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, TripHistoryItem[]> = {};

    displaySchedule.forEach((item) => {
      const dateKey =
        typeof item.date === "string"
          ? item.date.split("T")[0]
          : new Date(item.date).toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(item);
    });

    return Object.entries(groups)
      .sort(
        ([firstDate], [secondDate]) =>
          new Date(firstDate).getTime() - new Date(secondDate).getTime(),
      )
      .map(([dateKey, items]) => ({
        dateKey,
        formattedDate: new Date(`${dateKey}T00:00:00`).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ),
        items,
      }));
  }, [displaySchedule]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          onLogout={logout}
          title="Jadwal Penugasan Driver"
          description="Kelola dan pantau daftar rute penugasan kendaraan Anda."
        />

        <section className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
              <FaMapMarkedAlt className="shrink-0 text-blue-600" />
              <span>Jadwal Aktif Driver</span>
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="schedule-date"
                className="flex items-center gap-1 text-xs font-semibold text-gray-500"
              >
                <FaCalendarAlt className="text-gray-400" />
                Tanggal:
              </label>

              <input
                id="schedule-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm"
              />

              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedDate === ""
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaTimesCircle />
                Semua Tanggal
              </button>
            </div>
          </div>

          {activeLoading && (
            <div className="py-8 text-center text-xs text-gray-500 sm:text-sm">
              Memuat jadwal driver...
            </div>
          )}

          {activeError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 sm:text-sm">
              {activeError}
            </div>
          )}

          {!activeLoading && !activeError && displaySchedule.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-xs text-gray-400 sm:text-sm">
              {selectedDate
                ? `Tidak ada jadwal driver untuk tanggal ${selectedDate}.`
                : "Tidak ada jadwal driver."}
            </div>
          )}

          {!activeLoading && !activeError && displaySchedule.length > 0 && (
            <div className="space-y-5">
              {groupedSchedule.map((group) => (
                <div
                  key={group.dateKey}
                  className="space-y-4 rounded-xl border border-gray-200 bg-slate-50/60 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-800 sm:text-base">
                      <FaCalendarAlt className="shrink-0 text-blue-600" />
                      <span className="truncate">{group.formattedDate}</span>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 sm:text-xs">
                      {group.items.length} Jadwal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {group.items.map((item) => (
                      <DriverAssignmentCard
                        key={item.assignmentId}
                        assignment={item}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DriverAssignmentCard({ assignment }: { assignment: TripHistoryItem }) {
  const {
    status,
    loading,
    error,
    canControl,
    toggleSeat,
    toggleJourneyStatus,
  } = useSeatManagement(String(assignment.assignmentId), false);

  const isOngoing = status?.status === AssignmentStatus.ONGOING;

  const statusClass =
    assignment.status === AssignmentStatus.ONGOING
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : "border-blue-200 bg-blue-100 text-blue-800";

  const vehicleClass =
    assignment.vehicle?.type === "PREMIUM"
      ? "border-purple-200 bg-purple-100 text-purple-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}
            >
              {assignment.status}
            </span>

            {assignment.vehicle?.type && (
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${vehicleClass}`}
              >
                {assignment.vehicle.type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Arah:</span>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                assignment.direction === "FORWARD"
                  ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {assignment.direction}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Nama Rute
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {assignment.routeName || "-"}
          </h3>
          <p className="text-xs font-semibold text-blue-600">
            Kode Rute: {assignment.routeCode || "-"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 border-y border-gray-100 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            icon={<FaClock />}
            label="Waktu"
            value={`${assignment.startTime || "-"} - ${assignment.endTime || "-"}`}
          />

          <InfoItem
            icon={<FaBus />}
            label="Kendaraan"
            value={assignment.vehicle?.plateNumber || "-"}
          />

          <InfoItem
            icon={<FaRoute />}
            label="Armada"
            value={assignment.vehicle?.vehicleCode || "-"}
          />

          <InfoItem
            icon={<FaUserAlt />}
            label="Driver"
            value={assignment.driver?.name || "-"}
          />

          <InfoItem
            icon={<FaUserAlt />}
            label="Kondektur"
            value={assignment.conductor?.name || "Tidak ada kondektur"}
          />

          <InfoItem
            icon={<FaBus />}
            label="Kapasitas"
            value={`${assignment.vehicle?.capacity || 0} kursi`}
          />
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Kontrol Perjalanan
              </h4>
              <p className="text-xs text-gray-500">
                Status operasional:{" "}
                <span className="font-semibold text-slate-700">
                  {status?.status || "Memuat..."}
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={loading || !status || !canControl}
              onClick={toggleJourneyStatus}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                loading || !status || !canControl
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : isOngoing
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isOngoing ? "Selesaikan Perjalanan" : "Mulai Perjalanan"}
            </button>
          </div>

          <SeatGridControl
            seats={status?.seats || []}
            canControl={canControl}
            onToggleSeat={toggleSeat}
            hasConductor={status?.hasConductor || false}
            isUserConductor={false}
          />

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-3">
          <Link
            href={`/driver/dashboard/now/${assignment.assignmentId}`}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
          >
            Detail Perjalanan
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 shrink-0 text-xs text-gray-400">{icon}</span>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase text-gray-400">
          {label}
        </p>
        <p className="truncate text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
