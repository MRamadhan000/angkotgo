"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiTruck,
  FiUser,
  FiMapPin,
  FiCheckCircle,
  FiPlayCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";

// Daftar kolom disesuaikan dengan 4 status enum AssignmentStatus yang baru
const COLUMNS = [
  {
    key: "SCHEDULED",
    label: "Scheduled",
    icon: FiClock,
    color: "border-amber-200 bg-amber-50/50 text-amber-800",
  },
  {
    key: "ONGOING",
    label: "Ongoing",
    icon: FiPlayCircle,
    color: "border-blue-200 bg-blue-50/50 text-blue-800",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    icon: FiCheckCircle,
    color: "border-emerald-200 bg-emerald-50/50 text-emerald-800",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    icon: FiXCircle,
    color: "border-rose-200 bg-rose-50/50 text-rose-800",
  },
];

export default function OperationalBoardPage() {
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { assignments, loading, error, fetchAssignments } =
    useVehicleAssignments();

  const handleRefresh = () => {
    fetchAssignments();
  };

  // Tutup dropdown jika klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ekstrak daftar tanggal unik dari data assignments dan urutkan dari terbaru ke terlama
  const availableDates = Array.from(
    new Set(
      (assignments || []).map(
        (item: any) => item.date || item.assignmentDate || todayString,
      ),
    ),
  ).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());

  // Pastikan tanggal hari ini selalu ada dalam pilihan meskipun belum ada data
  if (!availableDates.includes(todayString)) {
    availableDates.unshift(todayString);
  }

  // Filter data berdasarkan tanggal yang dipilih
  const filteredByDate = (assignments || []).filter((item: any) => {
    const itemDate = item.date || item.assignmentDate || todayString;
    return itemDate === selectedDate;
  });

  // Format tampilan tanggal agar lebih elegan (Contoh: "Kamis, 6 Agu 2026")
  const formatDateLabel = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return new Date(dateStr).toLocaleDateString("id-ID", options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Jadwal & Status Operasional Angkot
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status perjalanan armada secara real-time berdasarkan jadwal
            harian.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* CUSTOM DATE DROPDOWN MODAL */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-gray-300 transition-all text-gray-700"
            >
              <FiCalendar className="w-4 h-4 text-gray-500 shrink-0" />
              <span>{formatDateLabel(selectedDate)}</span>
              <FiChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN MENU / MODAL */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Pilih Tanggal Operasional
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {availableDates.map((date: any) => {
                    const isSelected = date === selectedDate;
                    const count = (assignments || []).filter(
                      (item: any) =>
                        (item.date || item.assignmentDate || todayString) ===
                        date,
                    ).length;

                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-gray-900 text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{formatDateLabel(date)}</span>
                          {date === todayString && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                isSelected
                                  ? "bg-gray-800 text-gray-200"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-gray-800 text-gray-300"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {count} unit
                          </span>
                          {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* KANBAN BOARD LAYOUT (4 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const columnItems = filteredByDate.filter(
            (item: any) => item.status === col.key,
          );

          return (
            <div
              key={col.key}
              className="bg-gray-50/80 border border-gray-200/60 rounded-3xl p-5 flex flex-col gap-4 shadow-sm"
            >
              {/* COLUMN HEADER */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.color}`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{col.label}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-xs">
                  {columnItems.length}
                </span>
              </div>

              {/* CARDS CONTAINER */}
              <div className="flex flex-col gap-3 min-h-[400px]">
                {loading ? (
                  <div className="py-20 text-center text-gray-400 text-sm">
                    Memuat data...
                  </div>
                ) : columnItems.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 text-xs italic bg-white/50 rounded-2xl border border-dashed border-gray-200">
                    Tidak ada data {col.label.toLowerCase()}
                  </div>
                ) : (
                  columnItems.map((item: any) => {
                    const vehicleDisplay =
                      typeof item.vehicle === "object" && item.vehicle !== null
                        ? item.vehicle.code || item.vehicle.name || "UNIT-00"
                        : item.vehicleCode || item.vehicle || "UNIT-00";

                    const driverDisplay =
                      typeof item.driver === "object" && item.driver !== null
                        ? item.driver.name || item.driver.fullName || "Driver"
                        : item.driverName || item.driver || "Driver";

                    const routeDisplay =
                      typeof item.route === "object" && item.route !== null
                        ? `${item.route.routeCode ? `${item.route.routeCode} - ` : ""}${item.route.routeName || "Rute"}`
                        : item.route || "Rute Perjalanan";

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Vehicle Code & Time */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-700">
                              <FiTruck className="w-4 h-4" />
                            </div>
                            <span className="font-bold font-mono text-gray-900 text-sm">
                              {vehicleDisplay}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {item.timeSlot ||
                              `${item.startTime || "06:00"} - ${item.endTime || "12:00"}`}
                          </span>
                        </div>

                        <hr className="border-gray-50" />

                        {/* Details: Driver & Route */}
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-800">
                              {driverDisplay}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-500 truncate">
                              {routeDisplay}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}