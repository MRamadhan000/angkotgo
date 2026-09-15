"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaRoute,
  FaUsers,
  FaClock,
  FaRupeeSign,
  FaBus,
  FaTrophy,
  FaCheckCircle,
  FaChevronRight,
  FaSync,
} from "react-icons/fa";
import { HiOutlineSave } from "react-icons/hi";
import { Chart, registerables } from "chart.js";
import { useStats } from "@/hooks/useStats";
import { Tariff } from "@/types/stats.type";

Chart.register(...registerables);

// ─── Sparkline (Variasi Statis Visual) ────────────────────────────────────
function Sparkline({
  id,
  data,
  color,
  fill,
}: {
  id: string;
  data: number[];
  color: string;
  fill: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: fill,
            borderWidth: 1.5,
            tension: 0.45,
            pointRadius: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, color, fill]);

  return (
    <div className="absolute bottom-0 right-0 w-[55%] h-[70px]">
      <canvas ref={ref} role="img" aria-label={`Sparkline ${id}`} />
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: ["Angkot Aktif", "Angkot Tidak Aktif"],
        datasets: [
          {
            data: [active, inactive],
            backgroundColor: ["#3b82f6", "#fb923c"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } },
        },
      },
    });
    return () => chart.destroy();
  }, [active, inactive]);

  return (
    <canvas ref={ref} role="img" aria-label="Pie chart ringkasan armada" />
  );
}

// ─── Tarif Form ───────────────────────────────────────────────────────────
function TarifForm({ tariffs }: { tariffs: Tariff[] }) {
  const defaultTariff =
    tariffs.find((t) => t.name.toLowerCase() === "umum")?.nominal ||
    tariffs[0]?.nominal ||
    5000;
  const [tarifBaru, setTarifBaru] = useState(defaultTariff);
  const [saved, setSaved] = useState(false);
  const [currentTarif, setCurrentTarif] = useState(defaultTariff);

  useEffect(() => {
    if (defaultTariff) {
      setCurrentTarif(defaultTariff);
      setTarifBaru(defaultTariff);
    }
  }, [defaultTariff]);

  const handleSimpan = () => {
    setCurrentTarif(tarifBaru);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="bg-blue-50 rounded-[8px] px-3 py-2.5 mb-4 text-[11px] text-blue-600 leading-relaxed">
        Perubahan tarif akan berlaku untuk semua rute dan semua angkot.
      </div>

      <div className="mb-3 space-y-1">
        <p className="text-[11px] text-slate-500 font-medium">
          Tarif Saat Ini (Daftar API)
        </p>
        <div className="space-y-1">
          {tariffs.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-[7px] px-3 py-1.5 text-[12px] font-semibold text-slate-600"
            >
              <span>{t.name}</span>
              <span>Rp {Number(t.nominal).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>

    </>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, loading, error, refetch } = useStats();

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f4f8] h-screen">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <FaSync className="animate-spin text-blue-500" />
          Memuat data statistik...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f4f8] h-screen gap-3">
        <p className="text-red-500 text-sm font-semibold">
          {error || "Data gagal dimuat"}
        </p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const totalVehicles = data.activeVehicles + data.inactiveVehicles;
  const activeVehiclePct =
    totalVehicles > 0
      ? ((data.activeVehicles / totalVehicles) * 100).toFixed(1)
      : 0;
  const inactiveVehiclePct =
    totalVehicles > 0
      ? ((data.inactiveVehicles / totalVehicles) * 100).toFixed(1)
      : 0;
  const activeDriverPct =
    data.totalDrivers > 0
      ? ((data.activeDrivers / data.totalDrivers) * 100).toFixed(1)
      : 0;

  const umumTariff =
    data.tariffs.find((t) => t.name.toLowerCase() === "umum")?.nominal ||
    data.tariffs[0]?.nominal ||
    0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-5 bg-[#f0f4f8]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[17px] font-bold text-slate-900">
            Informasi General
          </h1>
          <button
            onClick={refetch}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-[8px] px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FaClock className="text-blue-500 text-[12px]" />
            {today}
            <FaChevronRight className="text-slate-300 text-[10px]" />
          </button>
        </div>

        {/* Row 1: General Stat Cards */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Link
            href="/admin/dashboard/route"
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="w-11 h-11 bg-blue-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaRoute className="text-blue-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                Total Rute
              </p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
                {data.totalRoutes}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {data.totalRouteStops} Halte Rute
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/driver"
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="w-11 h-11 bg-green-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaUsers className="text-green-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                Total Driver
              </p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
                {data.totalDrivers}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {data.activeDrivers} Driver Aktif
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/route"
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="w-11 h-11 bg-yellow-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaTrophy className="text-yellow-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                Rute Terpopuler
              </p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">
                {data.mostPopularRoute?.routeCode || "-"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[120px]">
                {data.mostPopularRoute?.routeName || "Tidak ada data"}
              </p>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5">
                <FaBus className="text-[9px]" />{" "}
                {data.mostPopularRoute?.totalUsage || 0} Penugasan
              </span>
            </div>
          </Link>

          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaRupeeSign className="text-purple-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                Tarif Utama (Umum)
              </p>
              <p className="text-[20px] font-extrabold text-slate-900 leading-none tracking-tight mt-1">
                Rp {Number(umumTariff).toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tarif per penumpang
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: Metric + Sparklines */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Link
            href="/admin/dashboard/driver"
            className="bg-white border border-slate-100 rounded-xl p-4 relative overflow-hidden block transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[12px] font-semibold text-slate-600">
                Driver Online / Aktif
              </p>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-600">
                ● Online
              </span>
            </div>
            <p className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-none">
              {data.activeDrivers}
            </p>
            <p className="text-[13px] font-semibold text-slate-500 mt-1">
              Driver
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {activeDriverPct}% dari total driver
            </p>
            <Sparkline
              id="sp1"
              data={[2, 3, 5, 4, 6, 7, data.activeDrivers]}
              color="#16a34a"
              fill="rgba(22,163,74,.08)"
            />
          </Link>

          <Link
            href="/admin/dashboard/vehicle"
            className="bg-white border border-slate-100 rounded-xl p-4 relative overflow-hidden block transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[12px] font-semibold text-slate-600">
                Angkot Aktif
              </p>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                ● Aktif
              </span>
            </div>
            <p className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-none">
              {data.activeVehicles}
            </p>
            <p className="text-[13px] font-semibold text-slate-500 mt-1">
              Angkot
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {activeVehiclePct}% dari total angkot
            </p>
            <Sparkline
              id="sp2"
              data={[1, 2, 4, 3, 5, 6, data.activeVehicles]}
              color="#2563eb"
              fill="rgba(37,99,235,.08)"
            />
          </Link>

          <Link
            href="/admin/dashboard/vehicle"
            className="bg-white border border-slate-100 rounded-xl p-4 relative overflow-hidden block transition-all duration-200 hover:scale-[1.015] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[12px] font-semibold text-slate-600">
                Angkot Tidak Aktif
              </p>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-500">
                ● Tidak Aktif
              </span>
            </div>
            <p className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-none">
              {data.inactiveVehicles}
            </p>
            <p className="text-[13px] font-semibold text-slate-500 mt-1">
              Angkot
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {inactiveVehiclePct}% dari total angkot
            </p>
            <Sparkline
              id="sp3"
              data={[5, 4, 3, 2, 1, 0, data.inactiveVehicles]}
              color="#ea580c"
              fill="rgba(234,88,12,.08)"
            />
          </Link>
        </div>

        {/* Row 3: Detail Top Penumpang / Armada Summary / Form Tarif */}
        <div className="grid grid-cols-3 gap-3">
          {/* Top Passengers by Assignment */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-900 mb-3">
                Top Penumpang per Penugasan Hari Ini
              </p>
              {data.topPassengersByAssignment &&
              data.topPassengersByAssignment.length > 0 ? (
                data.topPassengersByAssignment.map((item, index) => (
                  <div
                    key={item.vehicleAssignmentId}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-[26px] h-[26px] rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-800">
                        {item.routeCode}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.routeName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] font-extrabold text-slate-800">
                        {item.totalPassengers}
                      </p>
                      <p className="text-[10px] text-slate-400">Penumpang</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-slate-400 italic py-4">
                  Belum ada data penumpang hari ini
                </p>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Total Penugasan Hari Ini:{" "}
              <span className="font-bold text-slate-800">
                {data.totalTodayAssignments}
              </span>
            </div>
          </div>

          {/* Armada Summary */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-900 mb-3">
                Ringkasan Armada
              </p>
              <div className="flex items-center gap-5">
                <div className="relative w-[150px] h-[150px] flex-shrink-0">
                  <DonutChart
                    active={data.activeVehicles}
                    inactive={data.inactiveVehicles}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[20px] font-extrabold text-slate-900 leading-none">
                      {totalVehicles}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-0.5">
                      Total Angkot
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-500">Angkot Aktif</p>
                      <p className="text-[12px] font-bold text-slate-800">
                        {data.activeVehicles}&nbsp;
                        <span className="text-[11px] font-normal text-slate-400">
                          ({activeVehiclePct}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Angkot Tidak Aktif
                      </p>
                      <p className="text-[12px] font-bold text-slate-800">
                        {data.inactiveVehicles}&nbsp;
                        <span className="text-[11px] font-normal text-slate-400">
                          ({inactiveVehiclePct}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/admin/dashboard/vehicle"
              className="w-full mt-4 py-2 border border-slate-200 rounded-[8px] text-[12px] font-semibold text-blue-600 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors text-center"
            >
              Lihat Semua Armada <FaChevronRight className="text-[10px]" />
            </Link>
          </div>

          {/* Tarif Form Component */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[13px] font-bold text-slate-900 mb-3">
              Tarif Angkot
            </p>
            <TarifForm tariffs={data.tariffs} />
          </div>
        </div>
      </main>
    </div>
  );
}
