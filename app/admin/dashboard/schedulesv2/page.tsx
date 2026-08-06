"use client";

import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { useState, useEffect, useMemo } from "react";

export default function VehicleSchedulesPage0() {
  // Mendapatkan tanggal hari ini dengan format YYYY-MM-DD
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  // Ambil data dan fungsi dari custom hook
  const {
    schedules,
    schedulesLoading,
    schedulesError,
    fetchSchedulesByDate,
  } = useVehicleAssignments();

  // Fetch jadwal setiap kali tanggal yang dipilih berubah
  useEffect(() => {
    fetchSchedulesByDate(selectedDate);
  }, [selectedDate, fetchSchedulesByDate]);

  // Grouping data berdasarkan routeCode dan direction
  const groupedSchedules = useMemo(() => {
    const map = new Map<string, {
      routeCode: string;
      routeName: string;
      direction: string;
      assignments: typeof schedules;
    }>();

    schedules.forEach((item) => {
      const key = `${item.routeCode}-${item.direction}`;
      if (!map.has(key)) {
        map.set(key, {
          routeCode: item.routeCode,
          routeName: item.routeName,
          direction: item.direction,
          assignments: [],
        });
      }
      map.get(key)?.assignments.push(item);
    });

    return Array.from(map.values());
  }, [schedules]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Jadwal & Estimasi Kedatangan Angkot per Rute
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitoring angkot, driver, jam operasional, dan estimasi waktu tiba di setiap halte berdasarkan rute.
            </p>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <label htmlFor="schedule-date" className="text-sm font-medium text-gray-600 pl-2">
              Pilih Tanggal:
            </label>
            <input
              id="schedule-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error State */}
        {schedulesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {schedulesError}
          </div>
        )}

        {/* Loading State */}
        {schedulesLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : groupedSchedules.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-base">
              Tidak ada jadwal penugasan kendaraan pada tanggal <span className="font-semibold text-gray-800">{selectedDate}</span>.
            </p>
          </div>
        ) : (
          /* List of Grouped Routes */
          <div className="grid grid-cols-1 gap-6">
            {groupedSchedules.map((group, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Header Rute */}
                <div className="bg-gray-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 text-white font-bold text-sm rounded-lg">
                      {group.routeCode}
                    </span>
                    <div>
                      <h2 className="text-black font-bold text-lg ">
                        {group.routeName}
                      </h2>
                      <p className="text-xs text-gray-300">
                        Arah / Jalur: <span className="font-medium text-white">{group.direction}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                    {group.assignments.length} Armada Beroperasi
                  </span>
                </div>

                {/* Body: Daftar Armada / Angkot di Rute Ini */}
                <div className="p-6 divide-y divide-gray-100">
                  {group.assignments.map((assignment) => (
                    <div key={assignment.assignmentId} className="py-6 first:pt-0 last:pb-0">
                      {/* Info Armada & Driver */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                            🚐
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Kendaraan & Plat Nomor</p>
                            <h4 className="font-bold text-gray-900 text-base">
                              {assignment.vehicle?.plateNumber} <span className="text-xs font-normal text-gray-500">({assignment.vehicle?.vehicleCode})</span>
                            </h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div>
                            <span className="text-xs text-gray-400 block">Driver Bertugas</span>
                            <span className="font-semibold text-gray-800">{assignment.driver?.name || "-"}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Jam Operasional</span>
                            <span className="font-semibold text-blue-600 bg-white px-2.5 py-1 rounded-md border border-blue-100 shadow-2xs">
                              {assignment.startTime} - {assignment.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estimasi Halte / Stasiun */}
                      <div>
                        <h5 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">
                          Estimasi Waktu Tiba di Halte:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignment.estimatedStopsSchedule.map((stop) => (
                            <div
                              key={stop.stopId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-700 font-bold text-xs rounded-full">
                                  {stop.stopOrder}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-medium text-gray-800 truncate" title={stop.stopName}>
                                    {stop.stopName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 pl-2">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                  {stop.estimatedArrivalTime}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}