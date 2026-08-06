"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  FiRefreshCw,
  FiCalendar,
  FiTruck,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiChevronDown,
  FiCheck,
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiNavigation,
} from "react-icons/fi";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { renderStatusBadge } from "@/components/schedules/StatusBadge";
import { formatDateLabel } from "@/utils/format";

const getEntityDisplay = (field: any, keys: string[], fallback: string) => {
  if (!field) return fallback;
  if (typeof field === "object") {
    for (const key of keys) {
      if (field[key]) return field[key];
    }
    return fallback;
  }
  return String(field);
};

export default function OperationalBoardPage() {
  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk Search, Status Filter, dan Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Ekstrak daftar tanggal unik dari database/assignments dan urutkan dari terbaru ke terlama
  const availableDates = useMemo(() => {
    const dates = Array.from(
      new Set(
        (assignments || []).map(
          (item: any) => item.date || item.assignmentDate || todayString,
        ),
      ),
    ).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());

    if (!dates.includes(todayString)) {
      dates.unshift(todayString);
    }
    return dates;
  }, [assignments, todayString]);

  // Filter & Sort data secara komprehensif
  const processedAssignments = useMemo(() => {
    let list = assignments || [];

    // 1. Filter berdasarkan Tanggal Terpilih
    list = list.filter((item: any) => {
      const itemDate = item.date || item.assignmentDate || todayString;
      return itemDate === selectedDate;
    });

    // 2. Filter berdasarkan Status Dropdown
    if (statusFilter !== "ALL") {
      list = list.filter((item: any) => item.status === statusFilter);
    }

    // 3. Filter berdasarkan Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      list = list.filter((item: any) => {
        const vehicleDisplay = getEntityDisplay(
          item.vehicle,
          ["code", "name", "plateNumber"],
          item.vehicleCode || "",
        ).toLowerCase();
        const driverDisplay = getEntityDisplay(
          item.driver,
          ["name", "fullName"],
          item.driverName || "",
        ).toLowerCase();
        const routeDisplay =
          typeof item.route === "object" && item.route !== null
            ? `${item.route.routeCode || ""} ${item.route.routeName || ""}`.toLowerCase()
            : String(item.route || "").toLowerCase();
        const directionDisplay = getEntityDisplay(
          item.direction,
          ["name", "code"],
          "",
        ).toLowerCase();

        return (
          vehicleDisplay.includes(query) ||
          driverDisplay.includes(query) ||
          routeDisplay.includes(query) ||
          directionDisplay.includes(query)
        );
      });
    }

    // 4. Sorting Data
    return [...list].sort((a: any, b: any) => {
      let valA = "";
      let valB = "";

      if (sortField === "time") {
        valA = a.timeSlot || a.startTime || "00:00";
        valB = b.timeSlot || b.startTime || "00:00";
      } else if (sortField === "vehicle") {
        valA = getEntityDisplay(
          a.vehicle,
          ["code", "name"],
          a.vehicleCode || "",
        );
        valB = getEntityDisplay(
          b.vehicle,
          ["code", "name"],
          b.vehicleCode || "",
        );
      } else if (sortField === "driver") {
        valA = getEntityDisplay(
          a.driver,
          ["name", "fullName"],
          a.driverName || "",
        );
        valB = getEntityDisplay(
          b.driver,
          ["name", "fullName"],
          b.driverName || "",
        );
      } else if (sortField === "direction") {
        valA = getEntityDisplay(a.direction, ["name", "code"], "");
        valB = getEntityDisplay(b.direction, ["name", "code"], "");
      } else if (sortField === "status") {
        valA = a.status || "";
        valB = b.status || "";
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    assignments,
    selectedDate,
    statusFilter,
    searchQuery,
    sortField,
    sortDirection,
    todayString,
  ]);

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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
            harian dalam format tabel.
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

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari unit, driver, rute, atau arah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-all text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <FiFilter className="w-4 h-4 text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {[
            { key: "ALL", label: "Semua" },
            { key: "SCHEDULED", label: "Scheduled" },
            { key: "ONGOING", label: "Ongoing" },
            { key: "COMPLETED", label: "Completed" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-gray-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSortChange("vehicle")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Unit Kendaraan</span>
                    {sortField === "vehicle" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("time")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Waktu / Sesi</span>
                    {sortField === "time" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("driver")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pengemudi (Driver)</span>
                    {sortField === "driver" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th className="py-4 px-6">Rute Perjalanan</th>
                <th
                  onClick={() => handleSortChange("direction")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Arah (Direction)</span>
                    {sortField === "direction" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("status")}
                  className="py-4 px-6 text-center cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    Memuat data operasional...
                  </td>
                </tr>
              ) : processedAssignments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    Tidak ada jadwal penugasan operasional yang cocok dengan
                    filter atau pencarian untuk tanggal{" "}
                    <span className="font-semibold text-gray-600">
                      {formatDateLabel(selectedDate)}
                    </span>
                  </td>
                </tr>
              ) : (
                processedAssignments.map((item: any) => {
                  const vehicleDisplay = getEntityDisplay(
                    item.vehicle,
                    ["plateNumber", "name", "code"],
                    item.vehicleCode || "UNIT-XX",
                  );
                  const driverDisplay = getEntityDisplay(
                    item.driver,
                    ["name", "fullName"],
                    item.driverName || "Driver",
                  );
                  const routeDisplay =
                    typeof item.route === "object" && item.route !== null
                      ? `${item.route.routeCode ? `${item.route.routeCode} - ` : ""}${item.route.routeName || "Rute"}`
                      : item.route || "Rute Perjalanan";
                  const directionDisplay = getEntityDisplay(
                    item.direction,
                    ["name", "code"],
                    item.direction || "ARAH",
                  );
                  const timeDisplay =
                    item.timeSlot ||
                    `${item.startTime || "xx:xx"} - ${item.endTime || "xx:xx"}`;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Vehicle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-xl text-gray-700 shrink-0">
                            <FiTruck className="w-4 h-4" />
                          </div>
                          <span className="font-bold font-mono text-gray-900">
                            {vehicleDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-6">
                        <span className="inline-block font-mono text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                          {timeDisplay}
                        </span>
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-800">
                            {driverDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 max-w-xs">
                          <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">
                            {routeDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <FiNavigation className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-700">
                            {directionDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {renderStatusBadge(item.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}