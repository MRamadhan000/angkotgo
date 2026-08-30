"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaMapMarkedAlt,
  FaRoute,
  FaUserAlt,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function DriverDashboardPage() {
  const { user, logout } = useAuth();

  const {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,
  } = usePersonnelSchedule();

  useEffect(() => {
    if (!user?.id) return;

    fetchActiveScheduleByPersonnel({
      driverId: Number(user.id),
      targetDate: getTodayDateString(),
    });
  }, [user?.id, fetchActiveScheduleByPersonnel]);

  const schedules = useMemo<TripHistoryItem[]>(
    () => activeSchedule ?? [],
    [activeSchedule],
  );

  // Prioritaskan ONGOING. Jika belum berjalan, tampilkan SCHEDULED hari ini.
  const currentSchedule = useMemo<TripHistoryItem | null>(() => {
    return (
      schedules.find((item) => item.status === AssignmentStatus.ONGOING) ??
      schedules.find((item) => item.status === AssignmentStatus.SCHEDULED) ??
      null
    );
  }, [schedules]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DashboardHeader user={user} onLogout={logout} />

        <PersonalInfoWidget user={user} />

        <CurrentScheduleWidget
          schedule={currentSchedule}
          loading={activeLoading}
          error={activeError}
        />

        <DashboardMenu />
      </div>
    </div>
  );
}

function PersonalInfoWidget({ user }: { user: any }) {
  const name = user?.name || "Driver";

  const initials = name
    .split(" ")
    .map((item: string) => item[0])
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

function CurrentScheduleWidget({
  schedule,
  loading,
  error,
}: {
  schedule: TripHistoryItem | null;
  loading: boolean;
  error?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
          <FaMapMarkedAlt className="text-blue-600" />
          Jadwal Saat Ini
        </h2>

        {schedule && (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              schedule.status === AssignmentStatus.ONGOING
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {schedule.status}
          </span>
        )}
      </div>

      {loading && (
        <div className="py-6 text-center text-xs text-gray-400">
          Memuat jadwal saat ini...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && !schedule && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-400">
          Tidak ada jadwal driver untuk hari ini.
        </div>
      )}

      {!loading && !error && schedule && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Nama Rute
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {schedule.routeName || "-"}
            </h3>

            <p className="text-xs font-semibold text-blue-600">
              Kode Rute: {schedule.routeCode || "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-y border-gray-100 py-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoItem
              icon={<FaRoute />}
              label="Arah"
              value={schedule.direction || "-"}
            />

            <InfoItem
              icon={<FaCalendarAlt />}
              label="Waktu"
              value={formatDate(schedule.date)}
            />

            <InfoItem
              icon={<FaClock />}
              label="Jam"
              value={`${schedule.startTime || "-"} - ${schedule.endTime || "-"}`}
            />

            <InfoItem
              icon={<FaBus />}
              label="Armada"
              value={schedule.vehicle?.vehicleCode || "-"}
            />

            <InfoItem
              icon={<FaBus />}
              label="Kendaraan"
              value={schedule.vehicle?.plateNumber || "-"}
            />

            <InfoItem
              icon={<FaUserAlt />}
              label="Driver"
              value={schedule.driver?.name || "-"}
            />

            <InfoItem
              icon={<FaUserAlt />}
              label="Kondektur"
              value={schedule.conductor?.name || "Tidak ada"}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href={`/driver/dashboard/now/${schedule.assignmentId}`}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Detail
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardMenu() {
  const menus = [
    {
      title: "Jadwal Mendatang",
      description: "Lihat penugasan perjalanan yang akan datang.",
      href: "/driver/dashboard/upcoming",
      icon: <FaCalendarAlt />,
    },
    {
      title: "Riwayat Jadwal",
      description: "Lihat riwayat perjalanan yang telah diselesaikan.",
      href: "/driver/dashboard/history",
      icon: <FaHistory />,
    },
    {
      title: "Profil Pengguna",
      description: "Kelola informasi profil dan data akun Anda.",
      href: "/driver/dashboard/profile",
      icon: <FaUserAlt />,
    },
  ];

  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-gray-400 sm:mb-4 sm:text-sm">
        Menu Utama
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="group relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:flex-col sm:p-6 sm:text-center"
          >
            <div className="rounded-full bg-blue-50 p-4 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
              {menu.icon}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 sm:text-base">
                {menu.title}
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {menu.description}
              </p>
            </div>

            <FaArrowRight className="shrink-0 text-gray-300 group-hover:text-blue-600 sm:absolute sm:bottom-4 sm:right-4" />
          </Link>
        ))}
      </div>
    </section>
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

function formatDate(date: string | Date | undefined) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
