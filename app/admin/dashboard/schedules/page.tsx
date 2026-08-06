"use client";

import { useState, useMemo } from "react";
import {
  FiRefreshCw,
  FiTruck,
  FiUser,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiNavigation,
  FiPlus,
} from "react-icons/fi";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import DateDropdownModal from "@/components/schedules/DateDropdownModal";
import CreateAssignmentModal from "@/components/schedules/CreateAssignmentModal";
import { renderStatusBadge } from "@/components/schedules/StatusBadge";
import { formatDateLabel } from "@/utils/format";
import { AssignmentStatus, DirectionType } from "@/types/vehicles/vehicle.type";
import {
  filterAndSortAssignments,
  getAvailableAssignmentDates,
} from "@/utils/assignment.util";
import ErrorAlert from "@/components/common/ErrorAlert";
import { CreateVehicleAssignmentInput } from "@/types/vehicles/vehicle-assignments.type";
import StatusFilterButton from "@/components/schedules/StatusFilterButton";

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { assignments, loading, error, fetchAssignments, createAssignment } =
    useVehicleAssignments();

  const handleRefresh = () => {
    fetchAssignments();
  };

  const handleCreateAssignment = async (
    newAssignmentData: CreateVehicleAssignmentInput,
  ) => {
    try {
      await createAssignment(newAssignmentData);
      fetchAssignments();
    } catch (err: any) {
      throw new Error(
        err?.message || "Gagal menyimpan data penugasan kendaraan.",
      );
    }
  };

  const availableDates = useMemo(
    () => getAvailableAssignmentDates(assignments ?? [], todayString),
    [assignments, todayString],
  );

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

        <div className="flex items-center gap-3 flex-wrap">
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Jadwal
          </button>

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

      {error && <ErrorAlert message={`Gagal memuat data: ${error}`} />}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-2 lg:items-center">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari unit, driver, rute, atau arah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex justify-end overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex flex-wrap items-center gap-2">
            {ASSIGNMENT_STATUS_FILTERS.map((tab) => (
              <StatusFilterButton
                key={tab.key}
                status={tab.key}
                active={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
              />
            ))}
          </div>
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
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shrink-0">
                            <FiTruck className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-mono font-bold text-gray-900">
                              {item.vehicle?.vehicleCode || "UNIT-XX"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.vehicle?.plateNumber || "-"}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                item.vehicle?.type === "PREMIUM"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {item.vehicle?.type || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs font-medium text-gray-700">
                            {item.startTime || "--:--"} -{" "}
                            {item.endTime || "--:--"}
                          </span>

                          <p className="text-xs text-gray-500">
                            {item.assignmentDate}
                          </p>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 shrink-0">
                            <FiUser className="h-4 w-4 text-gray-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {item.driver?.name || "Driver"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.driver?.phone || item.driver?.nik || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-800">
                              {item.route?.routeName || "Rute Perjalanan"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.route?.routeCode || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiNavigation className="h-4 w-4 text-gray-400" />

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.direction === DirectionType.FORWARD
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {item.direction}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
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

      {/* CREATE ASSIGNMENT MODAL */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateAssignment}
      />
    </div>
  );
}
