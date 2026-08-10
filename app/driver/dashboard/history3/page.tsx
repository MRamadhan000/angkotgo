"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSearch,
  FaCalendarAlt,
  FaBus,
  FaHistory,
  FaCheckCircle,
  FaUserTie,
  FaIdCard,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";

interface HistoryRecord {
  assignmentId: number | string;
  date: string;
  routeCode: string;
  routeName: string;
  plateNumber: string;
  driverName: string;
  conductorName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function DriverFullHistoryPage() {
  const { user } = useAuth();
  const driverName = user?.name || "Siti Aminah";

  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  const todayStr = getFormattedDate(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Data riwayat penugasan khusus Driver Non-Kondektur (Kondektur set ke "-")
  const MOCK_FULL_HISTORY: HistoryRecord[] = [
    {
      assignmentId: 101,
      date: todayStr,
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "08:00",
      endTime: "17:00",
      status: AssignmentStatus.COMPLETED,
    },
    {
      assignmentId: 99,
      date: "2026-08-09",
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "08:00",
      endTime: "16:30",
      status: AssignmentStatus.COMPLETED,
    },
    {
      assignmentId: 98,
      date: "2026-08-08",
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "08:00",
      endTime: "17:00",
      status: AssignmentStatus.COMPLETED,
    },
    {
      assignmentId: 97,
      date: "2026-08-07",
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "07:30",
      endTime: "16:00",
      status: AssignmentStatus.COMPLETED,
    },
    {
      assignmentId: 96,
      date: "2026-08-06",
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "08:00",
      endTime: "17:00",
      status: AssignmentStatus.COMPLETED,
    },
    {
      assignmentId: 95,
      date: "2026-08-05",
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      plateNumber: "N 1234 AB",
      driverName: driverName,
      conductorName: "-",
      startTime: "08:00",
      endTime: "17:00",
      status: AssignmentStatus.COMPLETED,
    },
  ];

  const filteredHistory = useMemo(() => {
    return MOCK_FULL_HISTORY.filter((item) => {
      const matchesSearch =
        item.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.conductorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = filterDate ? item.date === filterDate : true;

      return matchesSearch && matchesDate;
    });
  }, [searchTerm, filterDate, driverName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/driver/dashboard/driver-kondektur"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 transition text-slate-700 text-xs font-semibold shadow-sm border border-slate-100"
          >
            <FaArrowLeft className="text-xs" /> Kembali ke Dashboard
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Arsip Penugasan
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaHistory className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Riwayat Penugasan Pengemudi
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Daftar lengkap seluruh perjalanan operasional harian yang telah
                Anda selesaikan.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <FaCheckCircle className="text-emerald-600 text-xs" />
            <span>{MOCK_FULL_HISTORY.length} Total Selesai</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Input Pencarian */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400 text-xs" />
            </div>
            <input
              type="text"
              placeholder="Cari rute, plat nomor, atau nama driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Filter Tanggal & Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-slate-400 text-xs" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {(searchTerm || filterDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterDate("");
                }}
                className="px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content - Clean Zebra Striping */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px] border-collapse">
              <thead className="bg-slate-100/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kode / Rute</th>
                  <th className="py-3.5 px-4">Kendaraan</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Kondektur</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-slate-400 font-medium"
                    >
                      Tidak ada data riwayat penugasan yang sesuai dengan
                      pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((hist, index) => (
                    <tr
                      key={hist.assignmentId}
                      className={`transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-emerald-50/30`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {hist.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md shrink-0">
                            {hist.routeCode}
                          </span>
                          <span className="font-semibold text-slate-900 whitespace-nowrap">
                            {hist.routeName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaBus className="text-slate-400 text-xs" />
                          {hist.plateNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaIdCard className="text-slate-400 text-xs" />
                          {hist.driverName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaUserTie className="text-slate-300 text-xs" />
                          {hist.conductorName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {hist.startTime} - {hist.endTime}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                          <FaCheckCircle className="text-[10px]" />
                          {hist.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
