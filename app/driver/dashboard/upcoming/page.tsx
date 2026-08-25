"use client";

import { useEffect, useMemo } from "react";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaMapMarkedAlt,
  FaRoute,
  FaUserAlt,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { AssignmentStatus, DirectionType } from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | Date): string {
  const dateKey = getDateKey(value);
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DriverUpcomingPage() {
  const { user, logout } = useAuth();

  const {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,
  } = usePersonnelSchedule();

  useEffect(() => {
    if (!user?.id) return;

    void fetchActiveScheduleByPersonnel({
      driverId: Number(user.id),
    }).catch(() => {
      // Error sudah disimpan oleh hook dan ditampilkan melalui activeError.
    });
  }, [user?.id, fetchActiveScheduleByPersonnel]);

  const upcomingSchedules = useMemo(() => {
    const today = getTodayDateKey();

    return (activeSchedule ?? [])
      .filter((item: TripHistoryItem) => {
        return (
          getDateKey(item.date) > today &&
          item.status === AssignmentStatus.SCHEDULED
        );
      })
      .sort((first, second) => {
        const dateComparison = getDateKey(first.date).localeCompare(
          getDateKey(second.date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return first.startTime.localeCompare(second.startTime);
      })
      .slice(0, 3);
  }, [activeSchedule]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DashboardHeader user={user} onLogout={logout} />

        <PersonalInfoWidget user={user} />

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="mt-1 shrink-0 text-blue-600" />

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Jadwal Mendatang
              </h1>

              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                Halaman ini menampilkan jadwal penugasan driver setelah hari
                ini. Detail jadwal dapat diakses ketika tanggal penugasan tiba.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
            <FaMapMarkedAlt className="text-blue-600" />

            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Daftar Jadwal Mendatang
            </h2>
          </div>

          {activeLoading && (
            <p className="py-8 text-center text-xs text-gray-400">
              Memuat jadwal mendatang...
            </p>
          )}

          {!activeLoading && activeError && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {activeError}
            </p>
          )}

          {!activeLoading && !activeError && upcomingSchedules.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-400">
              Belum ada jadwal mendatang.
            </p>
          )}

          {!activeLoading && !activeError && upcomingSchedules.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {upcomingSchedules.map((assignment) => (
                <UpcomingScheduleCard
                  key={assignment.assignmentId}
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function PersonalInfoWidget({ user }: { user: any }) {
  const name = user?.name || "Driver";

  const initials = name
    .split(" ")
    .map((part: string) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">
        {initials}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-blue-100">Profil Pengemudi</p>

        <h2 className="truncate text-lg font-bold">{name}</h2>

        <p className="truncate text-xs text-blue-100">
          {user?.email || "Email belum tersedia"}
        </p>
      </div>
    </section>
  );
}

function UpcomingScheduleCard({ assignment }: { assignment: TripHistoryItem }) {
  const isForward = assignment.direction === DirectionType.FORWARD;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
            {assignment.status}
          </span>

          <span
            className={`rounded-md border px-2 py-1 text-[10px] font-bold ${
              isForward
                ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {assignment.direction || "-"}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Nama Rute
          </p>

          <h3 className="mt-1 text-base font-bold text-slate-900">
            {assignment.routeName || "-"}
          </h3>

          <p className="text-xs font-semibold text-blue-600">
            Kode Rute: {assignment.routeCode || "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-gray-100 py-4">
          <InfoItem
            icon={<FaCalendarAlt />}
            label="Waktu"
            value={formatDate(assignment.date)}
          />

          <InfoItem
            icon={<FaClock />}
            label="Jam"
            value={`${assignment.startTime || "-"} - ${
              assignment.endTime || "-"
            }`}
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
            value={assignment.conductor?.name || "Tidak ada"}
          />
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Detail tersedia pada hari penugasan"
        className="mt-4 flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-500"
      >
        Detail
        <FaArrowRight className="text-[10px]" />
      </button>
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
