"use client";

import { useState, useMemo } from "react";
import {
  FiRefreshCw,
  FiTruck,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiNavigation,
} from "react-icons/fi";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import DateDropdownModal from "@/components/schedules/DateDropdownModal";
import { renderStatusBadge } from "@/components/schedules/StatusBadge";
import { formatDateLabel } from "@/utils/format";
import {
  VehicleAssignment,
  AssignmentStatus,
  DirectionType,
} from "@/types/vehicles/vehicle.type";
import { filterAndSortAssignments } from "@/utils/assignment.util";

const ASSIGNMENT_STATUS_FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: AssignmentStatus.SCHEDULED, label: "Scheduled" },
  { key: AssignmentStatus.ONGOING, label: "Ongoing" },
  { key: AssignmentStatus.COMPLETED, label: "Completed" },
  { key: AssignmentStatus.CANCELLED, label: "Cancelled" },
] as const;

export default function OperationalBoardPage() {
  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { assignments, loading, error, fetchAssignments } =
    useVehicleAssignments();

  const handleRefresh = () => {
    fetchAssignments();
  };

  // Ekstrak daftar tanggal unik dari database/assignments dan urutkan dari terbaru ke terlama
  const availableDates = useMemo(() => {
    const typedAssignments: VehicleAssignment[] = assignments || [];
    const dates = Array.from(
      new Set(
        typedAssignments.map((item) => item.assignmentDate || todayString),
      ),
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (!dates.includes(todayString)) {
      dates.unshift(todayString);
    }
    return dates;
  }, [assignments, todayString]);

  // Filter & Sort data secara komprehensif menggunakan tipe data asli
  const processedAssignments = useMemo(() => {
    return filterAndSortAssignments({
      assignments,
      selectedDate,
      todayString,
      statusFilter,
      searchQuery,
      sortField,
      sortDirection,
    });
  }, [
    assignments,
    selectedDate,
    todayString,
    statusFilter,
    searchQuery,
    sortField,
    sortDirection,
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
          {/* MODULAR DATE DROPDOWN COMPONENT */}
          <DateDropdownModal
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            availableDates={availableDates}
            assignments={assignments}
            todayString={todayString}
          />

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
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

          {ASSIGNMENT_STATUS_FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                processedAssignments.map((item) => {
                  const vehicleDisplay =
                    item.vehicle?.vehicleCode ||
                    item.vehicle?.plateNumber ||
                    "UNIT-XX";
                  const driverDisplay = item.driver?.name || "Driver";
                  const routeDisplay = item.route
                    ? `${item.route.routeCode ? `${item.route.routeCode} - ` : ""}${item.route.routeName}`
                    : "Rute Perjalanan";
                  const directionDisplay =
                    item.direction || DirectionType.FORWARD;
                  const timeDisplay = `${item.startTime || "xx:xx"} - ${item.endTime || "xx:xx"}`;

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
