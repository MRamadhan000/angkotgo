"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaMapMarkedAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useVehicleAssignmentFinancial } from "@/hooks/payment/useVehicleAssignmentFinancial";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

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

function getStatusClass(status: AssignmentStatus): string {
  switch (status) {
    case AssignmentStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-700";

    case AssignmentStatus.CANCELLED:
      return "bg-red-100 text-red-700";

    case AssignmentStatus.ONGOING:
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function DriverHistoryPage() {
  const { user, logout } = useAuth();

  const {
    historySchedule,
    historyLoading,
    historyError,
    fetchDriverTripHistory,
  } = usePersonnelSchedule();

  useEffect(() => {
    if (!user?.id) return;

    void fetchDriverTripHistory(Number(user.id));
  }, [user?.id, fetchDriverTripHistory]);

  const pastSchedules = useMemo(() => {
    const today = getDateKey(new Date());

    return [...(historySchedule ?? [])]
      .filter((assignment: TripHistoryItem) => {
        return getDateKey(assignment.date) < today;
      })
      .sort((first, second) => {
        const dateComparison = getDateKey(second.date).localeCompare(
          getDateKey(first.date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return second.startTime.localeCompare(first.startTime);
      });
  }, [historySchedule]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DashboardHeader user={user} onLogout={logout} />

        <PersonalInfoWidget user={user} />

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <FaHistory className="mt-1 shrink-0 text-blue-600" />

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Riwayat Jadwal
              </h1>

              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                Menampilkan jadwal penugasan yang telah lewat dari hari ini.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
            <FaMapMarkedAlt className="text-blue-600" />

            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Data Riwayat Penugasan
            </h2>
          </div>

          {historyLoading && (
            <p className="py-8 text-center text-xs text-gray-400">
              Memuat riwayat jadwal...
            </p>
          )}

          {!historyLoading && historyError && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {historyError}
            </p>
          )}

          {!historyLoading && !historyError && pastSchedules.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-400">
              Belum ada riwayat jadwal sebelum hari ini.
            </p>
          )}

          {!historyLoading && !historyError && pastSchedules.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3 font-bold">Tanggal</th>
                    <th className="px-3 py-3 font-bold">Rute</th>
                    <th className="px-3 py-3 font-bold">Status Penugasan</th>
                    <th className="px-3 py-3 font-bold">Jam</th>
                    <th className="px-3 py-3 font-bold">Pemasukan</th>
                    <th className="px-3 py-3 text-center font-bold">Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {pastSchedules.map((assignment) => (
                    <HistoryTableRow
                      key={assignment.assignmentId}
                      assignment={assignment}
                    />
                  ))}
                </tbody>
              </table>
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
    <section className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm">
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

function HistoryTableRow({ assignment }: { assignment: TripHistoryItem }) {
  const { summary, isLoading, error } = useVehicleAssignmentFinancial(
    assignment.assignmentId,
  );

  return (
    <tr className="border-b border-gray-100 text-xs transition hover:bg-blue-50/50">
      <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-400" />
          {formatDate(assignment.date)}
        </div>
      </td>

      <td className="px-3 py-4">
        <p className="font-bold text-slate-900">
          {assignment.routeName || "-"}
        </p>

        <p className="mt-1 text-[10px] font-semibold text-blue-600">
          {assignment.routeCode || "-"}
        </p>
      </td>

      <td className="px-3 py-4">
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(
            assignment.status,
          )}`}
        >
          {assignment.status}
        </span>
      </td>

      <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <FaClock className="text-gray-400" />
          {assignment.startTime || "-"} - {assignment.endTime || "-"}
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-4">
        {isLoading ? (
          <span className="text-xs text-gray-400">Memuat...</span>
        ) : error ? (
          <span className="text-xs text-red-500">Gagal dimuat</span>
        ) : (
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-emerald-600" />

            <span className="font-semibold text-emerald-600">
              {formatCurrency(summary?.totalPaid ?? 0)}
            </span>
          </div>
        )}
      </td>

      <td className="px-3 py-4 text-center">
        <Link
          href={`/driver/dashboard/now/${assignment.assignmentId}`}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-blue-700"
        >
          Detail
          <FaArrowRight className="text-[9px]" />
        </Link>
      </td>
    </tr>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
