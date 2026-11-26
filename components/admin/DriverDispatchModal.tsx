"use client";

import React, { useState, useMemo } from "react";
import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";
import { Driver } from "@/types/driver.type";
import {
  FaTimes,
  FaExchangeAlt,
  FaPlus,
  FaBus,
  FaUserTie,
} from "react-icons/fa";
import Link from "next/link";

interface DriverDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: VehicleAssignment[];
  drivers: Driver[];
}

export default function DriverDispatchModal({
  isOpen,
  onClose,
  assignments,
  drivers,
}: DriverDispatchModalProps) {
  // ─── SEMUA HOOKS DI ATAS, TANPA KONDISI APAPUN ───────────────────────────
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "STANDBY">(
    "ALL"
  );

  // 1. Filter penugasan unik per driver (dedup: 1 driver = 1 baris)
  const activeAssignmentsByDriver = useMemo(() => {
    const driverMap = new Map<number, VehicleAssignment>();
    assignments.forEach((a) => {
      if (a.driver && a.driverId) {
        if (!driverMap.has(a.driverId) || a.status === "ONGOING") {
          driverMap.set(a.driverId, a);
        }
      }
    });
    return Array.from(driverMap.values());
  }, [assignments]);

  // 2. Set ID driver yang sudah ditugaskan
  const assignedDriverIds = useMemo(
    () => new Set(activeAssignmentsByDriver.map((a) => a.driverId)),
    [activeAssignmentsByDriver]
  );

  // 3. Driver standby: aktif tapi belum ditugaskan
  const standbyDrivers = useMemo(
    () =>
      drivers.filter((d) => d.status === "ACTIVE" && !assignedDriverIds.has(d.id)),
    [drivers, assignedDriverIds]
  );

  // Hitung angka rekap
  const totalDriverCount = drivers.length;
  const onDutyCount = activeAssignmentsByDriver.length;
  const standbyCount = standbyDrivers.length;
  const offCount = Math.max(0, totalDriverCount - onDutyCount - standbyCount);

  // ─── EARLY RETURN SETELAH SEMUA HOOKS ─────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm">
              <FaBus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800">
                  Monitoring &amp; Quick Dispatch Driver Bertugas
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operasional Hari Ini
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Shift Aktif Pagi – Siang • Pantau driver bertugas, armada
                terkait, dan cadangan siaga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge Ringkasan */}
        <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-3 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {onDutyCount} Online / Bertugas
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {standbyCount} Standby Siaga Depo
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {offCount} Off / Libur
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-1">
          {(
            [
              { key: "ALL", label: `Semua (${onDutyCount + standbyCount})` },
              { key: "ACTIVE", label: `Aktif di Jalan (${onDutyCount})` },
              { key: "STANDBY", label: `Standby Depo (${standbyCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Konten Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Driver On Duty */}
          {(activeTab === "ALL" || activeTab === "ACTIVE") &&
            activeAssignmentsByDriver.map((assignment) => {
              const driver = assignment.driver;
              const vehicle = assignment.vehicle;
              const route = assignment.route;
              const conductor = assignment.conductor;
              const startTime = assignment.startTime
                ? new Date(assignment.startTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--";
              const endTime = assignment.endTime
                ? new Date(assignment.endTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--";

              return (
                <div
                  key={`duty-${assignment.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 hover:bg-emerald-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                      {driver?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() ?? "DR"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {driver?.name ?? "Driver"}
                        </h4>
                        <span className="text-xs text-slate-400">
                          ({driver?.phone ?? "0812-XXXX-XXXX"})
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Online {startTime} – {endTime}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span>
                          Unit{" "}
                          <b>
                            {vehicle?.vehicleCode ?? "N/A"} •{" "}
                            {vehicle?.plateNumber ?? "-"}
                          </b>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>
                          Rute: <b>{route?.routeCode ?? "-"}</b> (
                          {route?.routeName ?? "-"})
                        </span>
                        {conductor && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <FaUserTie className="w-3 h-3 text-slate-400" />
                              Kondektur: {conductor.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/admin/dashboard/assignments"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
                  >
                    <FaExchangeAlt className="w-3 h-3 text-slate-500" />
                    Tukar Armada / Shift
                  </Link>
                </div>
              );
            })}

          {/* Driver Standby */}
          {(activeTab === "ALL" || activeTab === "STANDBY") &&
            standbyDrivers.map((driver) => (
              <div
                key={`standby-${driver.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 hover:bg-amber-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                    {driver.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() ?? "SB"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {driver.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        ({driver.phone ?? "0812-XXXX-XXXX"})
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Cadangan Siaga
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>Lokasi: Standby Depo Terminal Arjosari</span>
                      <span>•</span>
                      <span className="text-amber-700 font-medium">
                        Siaga Lonjakan Jam Pulang Kerja
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/dashboard/assignments"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                >
                  <FaPlus className="w-3 h-3" />
                  + Plot ke Armada
                </Link>
              </div>
            ))}

          {activeAssignmentsByDriver.length === 0 &&
            standbyDrivers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">
                  Tidak ada driver yang aktif atau standby untuk filter ini.
                </p>
              </div>
            )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Disinkronkan dengan Satuan Pengawas Angkutan Dishub Malang
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <Link
              href="/admin/dashboard/driver"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Buka Master Pengemudi Lengkap →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
