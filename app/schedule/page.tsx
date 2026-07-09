"use client";

import React, { useEffect, useState } from "react";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { FaSearch, FaTimes, FaBusAlt, FaCheckCircle } from "react-icons/fa";

// ==========================================
// TYPE — konsisten dengan halaman Papan Trayek
// ==========================================
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

// ==========================================
// TOKENS — sama dengan halaman Papan Trayek biar konsisten satu produk
// ==========================================
const T = {
  canvas: "#FFFFFF",
  panel: "#F5F8FF", // tint biru sangat terang untuk beda dari canvas putih
  ink: "#0F172A",
  line: "#E2E8F0",
  blue: "#2563EB", // terjadwal
  blueDark: "#1D4ED8", // berangkat
  navy: "#1E3A8A", // tiba
  red: "#DC2626", // batal/tertunda — dipertahankan sebagai pengecualian, bukan bagian tema warna, karena status gagal perlu tetap kontras
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==========================================
// INTERFACES — mengikuti bentuk response GET /schedules
// ==========================================
interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "ACTIVE" | "INACTIVE";
}

interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
}

interface Route {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "RETURN" | string;
  color: string;
  distanceKm: string | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
}

interface Trip {
  id: number;
  tripNumber: number;
  route: Route;
  plannedDeparture: string;
  actualDeparture: string | null;
  plannedArrival: string;
  actualArrival: string | null;
  status: string; // SCHEDULED | DEPARTED | ARRIVED | CANCELLED, dst.
}

interface Schedule {
  id: number;
  workDate: string;
  shift: number;
  driver: Driver;
  vehicle: Vehicle;
  trips: Trip[];
}

// ==========================================
// HELPERS
// ==========================================
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "terjadwal", color: T.blue },
  DEPARTED: { label: "berangkat", color: T.blueDark },
  ARRIVED: { label: "tiba", color: T.navy },
  CANCELLED: { label: "batal", color: T.red },
  DELAYED: { label: "tertunda", color: T.red },
};

function statusInfo(status: string) {
  return (
    STATUS_LABEL[status] || { label: status.toLowerCase(), color: `${T.ink}80` }
  );
}

function hm(t: string | null) {
  if (!t) return "—";
  return t.slice(0, 5);
}

function formatTanggal(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "all">("all");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/schedules`);
        if (!res.ok) throw new Error("Gagal mengambil data jadwal");
        const data = await res.json();
        setSchedules(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const shifts = Array.from(new Set(schedules.map((s) => s.shift))).sort(
    (a, b) => a - b,
  );

  // Ratakan setiap trip jadi satu baris berdiri sendiri, bawa serta info sopir/armada/tanggal
  type FlatTrip = Trip & {
    workDate: string;
    shift: number;
    driver: Driver;
    vehicle: Vehicle;
  };

  const flatTrips: FlatTrip[] = schedules.flatMap((s) =>
    s.trips.map((t) => ({
      ...t,
      workDate: s.workDate,
      shift: s.shift,
      driver: s.driver,
      vehicle: s.vehicle,
    })),
  );

  const emptySchedules = schedules.filter((s) => s.trips.length === 0);

  const matchesQuery = (
    q: string,
    driverName: string,
    plate: string,
    routeCode?: string,
    routeName?: string,
  ) => {
    if (!q) return true;
    return (
      driverName.toLowerCase().includes(q) ||
      plate.toLowerCase().includes(q) ||
      (routeCode ? routeCode.toLowerCase().includes(q) : false) ||
      (routeName ? routeName.toLowerCase().includes(q) : false)
    );
  };

  const q = search.toLowerCase();

  const filteredTrips = flatTrips.filter(
    (t) =>
      matchesQuery(
        q,
        t.driver.name,
        t.vehicle.plateNumber,
        t.route.code,
        t.route.name,
      ) &&
      (shiftFilter === "all" || t.shift === shiftFilter),
  );

  const filteredEmptySchedules = emptySchedules.filter(
    (s) =>
      matchesQuery(q, s.driver.name, s.vehicle.plateNumber) &&
      (shiftFilter === "all" || s.shift === shiftFilter),
  );

  // Grup: tanggal (paling awal dulu) -> rute, urut dari trip pertama berangkat
  type RouteGroup = { route: Route; trips: FlatTrip[] };
  type DateGroup = { date: string; total: number; routes: RouteGroup[] };

  const dateGroups: DateGroup[] = (() => {
    const byDate = new Map<string, FlatTrip[]>();
    filteredTrips.forEach((t) => {
      if (!byDate.has(t.workDate)) byDate.set(t.workDate, []);
      byDate.get(t.workDate)!.push(t);
    });

    const orderedDates = Array.from(byDate.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    return orderedDates.map((date) => {
      const tripsOnDate = byDate.get(date)!;
      const byRoute = new Map<number, RouteGroup>();
      tripsOnDate.forEach((t) => {
        if (!byRoute.has(t.route.id))
          byRoute.set(t.route.id, { route: t.route, trips: [] });
        byRoute.get(t.route.id)!.trips.push(t);
      });
      const routes = Array.from(byRoute.values());
      routes.forEach((rg) =>
        rg.trips.sort((a, b) =>
          a.plannedDeparture.localeCompare(b.plannedDeparture),
        ),
      );
      routes.sort((a, b) =>
        (a.trips[0]?.plannedDeparture || "").localeCompare(
          b.trips[0]?.plannedDeparture || "",
        ),
      );
      return { date, total: tripsOnDate.length, routes };
    });
  })();

  const totalTrips = schedules.reduce((sum, s) => sum + s.trips.length, 0);
  const totalArmada = schedules.length;

  return (
    <main
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen py-12 md:py-16`}
      style={{ backgroundColor: T.canvas, fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* ===== HEADER ===== */}
        <div className="mb-8 border-t-2 pt-4" style={{ borderColor: T.ink }}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div
                className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-mono)", color: `${T.ink}99` }}
              >
                Kota Malang — Jadwal Trayek
              </div>
              <h1
                className="text-[2.2rem] leading-[1.05] font-bold tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: T.ink }}
              >
                Papan Jadwal
                <br />
                Keberangkatan
              </h1>
              <p
                className="mt-3 max-w-sm text-[14px] leading-relaxed"
                style={{ color: `${T.ink}B3` }}
              >
                Jadwal armada, sopir, dan trip yang berjalan hari ini beserta
                estimasi waktu berangkat dan tiba.
              </p>
            </div>

            {!loading && !error && (
              <div className="flex shrink-0 gap-3">
                <div
                  className="border px-4 py-3 text-right"
                  style={{ borderColor: T.line }}
                >
                  <div
                    className="text-3xl font-bold leading-none"
                    style={{ fontFamily: "var(--font-display)", color: T.blue }}
                  >
                    {String(totalArmada).padStart(2, "0")}
                  </div>
                  <div
                    className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `${T.ink}80`,
                    }}
                  >
                    Armada
                  </div>
                </div>
                <div
                  className="border px-4 py-3 text-right"
                  style={{ borderColor: T.line }}
                >
                  <div
                    className="text-3xl font-bold leading-none"
                    style={{ fontFamily: "var(--font-display)", color: T.navy }}
                  >
                    {String(totalTrips).padStart(2, "0")}
                  </div>
                  <div
                    className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `${T.ink}80`,
                    }}
                  >
                    Trip
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== SEARCH + FILTER ===== */}
        <div
          className="mb-8 flex flex-col gap-5 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"
          style={{ borderColor: T.line }}
        >
          <div className="relative w-full max-w-xs">
            <label
              className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-mono)", color: `${T.ink}80` }}
            >
              Cari jadwal
            </label>
            <div className="relative">
              <FaSearch
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[13px]"
                style={{ color: `${T.ink}66` }}
              />
              <input
                type="text"
                placeholder="Nama sopir, plat, atau kode rute..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-0 border-b bg-transparent py-2 pl-6 pr-8 text-[15px] outline-none transition-colors placeholder:text-[13px]"
                style={{
                  borderColor: T.ink,
                  color: T.ink,
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = T.blue)}
                onBlur={(e) => (e.currentTarget.style.borderColor = T.ink)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ color: `${T.ink}66` }}
                  aria-label="Hapus pencarian"
                >
                  <FaTimes className="text-[13px]" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-5">
            <button
              onClick={() => setShiftFilter("all")}
              className="relative pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color: shiftFilter === "all" ? T.ink : `${T.ink}66`,
              }}
            >
              Semua Shift
              {shiftFilter === "all" && (
                <span
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px]"
                  style={{ backgroundColor: T.blue }}
                />
              )}
            </button>
            {shifts.map((sh) => (
              <button
                key={sh}
                onClick={() => setShiftFilter(sh)}
                className="relative pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: shiftFilter === sh ? T.ink : `${T.ink}66`,
                }}
              >
                Shift {sh}
                {shiftFilter === sh && (
                  <span
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px]"
                    style={{ backgroundColor: T.blue }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="border p-5"
                style={{ borderColor: T.line }}
              >
                <div
                  className="h-4 w-1/3 animate-pulse"
                  style={{ backgroundColor: `${T.ink}14` }}
                />
                <div
                  className="mt-4 h-3 w-2/3 animate-pulse"
                  style={{ backgroundColor: `${T.ink}0D` }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="border py-10 text-center"
            style={{ borderColor: `${T.red}33` }}
          >
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)", color: T.red }}
            >
              [ Gagal memuat papan jadwal ]
            </p>
            <p className="mt-2 text-sm" style={{ color: `${T.ink}99` }}>
              {error}
            </p>
          </div>
        ) : dateGroups.length === 0 && filteredEmptySchedules.length === 0 ? (
          <div
            className="border border-dashed py-16 text-center"
            style={{ borderColor: T.line }}
          >
            <FaBusAlt
              className="mx-auto mb-4 text-3xl"
              style={{ color: `${T.ink}33` }}
            />
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: T.ink }}
            >
              Jadwal tidak ditemukan
            </h3>
            <p className="mt-1 text-sm" style={{ color: `${T.ink}80` }}>
              Coba kata kunci lain atau ubah filter shift.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {dateGroups.map((dg) => (
              <div key={dg.date}>
                {/* Header tanggal — grup terluar, terurut dari yang paling awal */}
                <div
                  className="mb-4 flex items-baseline justify-between border-b-2 pb-2"
                  style={{ borderColor: T.ink }}
                >
                  <h2
                    className="text-[1.15rem] font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)", color: T.ink }}
                  >
                    {formatTanggal(dg.date)}
                  </h2>
                  <span
                    className="text-[11px] uppercase tracking-[0.15em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: `${T.ink}80`,
                    }}
                  >
                    {String(dg.total).padStart(2, "0")} trip
                  </span>
                </div>

                <div className="space-y-5">
                  {dg.routes.map((rg) => (
                    <div
                      key={rg.route.id}
                      className="border"
                      style={{ borderColor: T.line, backgroundColor: T.panel }}
                    >
                      {/* Header rute — grup dalam, per tanggal */}
                      <div
                        className="flex items-center gap-3 border-b px-5 py-3"
                        style={{ borderColor: T.line }}
                      >
                        <div
                          className="flex h-9 w-14 flex-shrink-0 items-center justify-center rounded-[3px]"
                          style={{ backgroundColor: rg.route.color || T.ink }}
                        >
                          <span
                            className="text-[13px] font-bold tracking-wider text-white"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {rg.route.code}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[14px] font-semibold"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: T.ink,
                            }}
                          >
                            {rg.route.name}
                          </p>
                          <p
                            className="text-[10.5px] uppercase tracking-[0.08em]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: `${T.ink}80`,
                            }}
                          >
                            {rg.route.direction === "GO"
                              ? "Berangkat"
                              : "Kembali / PP"}{" "}
                            · {rg.trips.length} trip
                          </p>
                        </div>
                      </div>

                      {/* Trip di rute ini pada tanggal tsb, terurut jam berangkat */}
                      <div>
                        {rg.trips.map((trip) => {
                          const st = statusInfo(trip.status);
                          return (
                            <div
                              key={trip.id}
                              className="flex flex-col gap-2 border-b px-5 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                              style={{ borderColor: `${T.line}88` }}
                            >
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div
                                  className="text-[13px] font-semibold"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: T.ink,
                                  }}
                                >
                                  <span>{hm(trip.plannedDeparture)}</span>
                                  <span style={{ color: `${T.ink}40` }}>
                                    {" "}
                                    →{" "}
                                  </span>
                                  <span>{hm(trip.plannedArrival)}</span>
                                </div>
                                <div
                                  className="text-[11px]"
                                  style={{ color: `${T.ink}99` }}
                                >
                                  <span
                                    className="font-semibold"
                                    style={{
                                      fontFamily: "var(--font-body)",
                                      color: T.ink,
                                    }}
                                  >
                                    {trip.driver.name}
                                  </span>{" "}
                                  · {trip.vehicle.plateNumber} · Shift{" "}
                                  {trip.shift}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {trip.actualDeparture && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px]"
                                    style={{ color: T.blueDark }}
                                  >
                                    <FaCheckCircle className="text-[9px]" />{" "}
                                    aktual {hm(trip.actualDeparture)}
                                  </span>
                                )}
                                <span
                                  className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: st.color,
                                  }}
                                >
                                  [ {st.label} ]
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Armada yang belum punya trip terjadwal sama sekali — tetap ditampilkan, terpisah */}
            {filteredEmptySchedules.length > 0 && (
              <div>
                <div
                  className="mb-4 border-b-2 pb-2"
                  style={{ borderColor: T.ink }}
                >
                  <h2
                    className="text-[1.15rem] font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)", color: T.ink }}
                  >
                    Armada Tanpa Trip
                  </h2>
                </div>
                <div className="space-y-2">
                  {filteredEmptySchedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 border px-5 py-3"
                      style={{ borderColor: T.line, backgroundColor: T.panel }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 items-center rounded-[3px] px-2.5 text-[12px] font-bold tracking-wide text-white"
                          style={{
                            backgroundColor: T.ink,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {s.vehicle.plateNumber}
                        </div>
                        <p
                          className="text-[13.5px] font-semibold"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: T.ink,
                          }}
                        >
                          {s.driver.name}
                        </p>
                      </div>
                      <p
                        className="text-[11px]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: `${T.ink}80`,
                        }}
                      >
                        Shift {s.shift} · {formatTanggal(s.workDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
