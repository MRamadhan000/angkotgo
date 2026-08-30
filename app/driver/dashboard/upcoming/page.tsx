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
  FaArrowLeft,
} from "react-icons/fa";

import Link from "next/link";
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
  const { user } = useAuth();

  const {
    historySchedule,
    historyLoading,
    historyError,
    fetchDriverTripHistory,
  } = usePersonnelSchedule();

  useEffect(() => {
    if (!user?.id) return;

    void fetchDriverTripHistory(Number(user.id)).catch(() => {
      // Error is handled by the hook
    });
  }, [user?.id, fetchDriverTripHistory]);

  const upcomingSchedules = useMemo(() => {
    const today = getTodayDateKey();

    return (historySchedule ?? [])
      .filter((item: TripHistoryItem) => {
        return (
          getDateKey(item.date) > today &&
          (item.status === AssignmentStatus.SCHEDULED || item.status === "ONGOING")
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
      });
  }, [historySchedule]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <Link
          href="/driver/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-600 shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:-translate-x-1"
        >
          <FaArrowLeft />
          Kembali ke Dashboard
        </Link>
        <DashboardHeader user={user} />

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

          {historyLoading && (
            <p className="py-8 text-center text-xs text-gray-400">
              Memuat jadwal mendatang...
            </p>
          )}

          {!historyLoading && historyError && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {historyError}
            </p>
          )}

          {!historyLoading && !historyError && upcomingSchedules.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-400">
              Belum ada jadwal mendatang.
            </p>
          )}

          {!historyLoading && !historyError && upcomingSchedules.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-blue-50/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Rute</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Waktu / Armada</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Kondektur</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {upcomingSchedules.map((assignment) => {
                    const isForward =
                      assignment.direction === DirectionType.FORWARD;

                    return (
                      <tr
                        key={assignment.assignmentId}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-800">
                            {formatDate(assignment.date)}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-slate-900">
                            {assignment.routeName || "-"}
                          </p>
                          <p className="text-xs font-semibold text-blue-600">
                            {assignment.routeCode || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-800">
                            {assignment.startTime || "-"} -{" "}
                            {assignment.endTime || "-"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {assignment.vehicle?.plateNumber || "-"} (
                            {assignment.vehicle?.vehicleCode || "-"})
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium text-slate-700">
                            {assignment.conductor?.name || "Tidak ada"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide">
                              {assignment.status}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${isForward
                                ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                            >
                              {assignment.direction || "-"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
