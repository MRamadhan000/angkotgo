"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaRoute,
  FaUserTie,
  FaIdBadge,
  FaMapMarkerAlt,
  FaChevronDown,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = Number(params?.slug);

  const { user } = useAuth();
  
  // State untuk toggle buka/tutup Estimasi Halte
  const [isStopsOpen, setIsStopsOpen] = useState(true);

  const {
    assignmentDetail,
    detailLoading,
    detailError,
    getAssignmentById,
  } = usePersonnelSchedule() as {
    assignmentDetail: (VehicleSchedule & { conductor?: { id: number; name: string } | null }) | null;
    detailLoading: boolean;
    detailError: string | null;
    getAssignmentById: (id: number) => Promise<any>;
  };

  useEffect(() => {
    if (assignmentId && !isNaN(assignmentId)) {
      getAssignmentById(assignmentId);
    }
  }, [assignmentId, getAssignmentById]);

  // Format tanggal ke Bahasa Indonesia
  const formattedDate = assignmentDetail?.date
    ? new Date(assignmentDetail.date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-3 sm:space-y-6 p-2.5 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          title="Detail Penugasan Kendaraan"
          description="Informasi lengkap rute perjalanan, armada, personel, dan estimasi waktu halte."
        />

        {/* State Loading */}
        {detailLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center text-xs sm:text-sm text-gray-500">
            Memuat detail penugasan...
          </div>
        )}

        {/* State Error */}
        {detailError && !detailLoading && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 sm:py-4 rounded-xl text-xs sm:text-sm shadow-sm">
            {detailError}
          </div>
        )}

        {/* Konten Utama */}
        {!detailLoading && !detailError && assignmentDetail && (
          <div className="space-y-3 sm:space-y-6">
            {/* Grid Informasi Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Card Rute & Arah */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-5 space-y-2 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Informasi Rute
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-slate-900 flex items-start sm:items-center gap-2">
                    <FaRoute className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="leading-tight sm:leading-normal break-words">
                      {assignmentDetail.routeCode} - {assignmentDetail.routeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] sm:text-xs text-gray-500">Arah:</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                        assignmentDetail.direction === "FORWARD"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {assignmentDetail.direction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Waktu & Tanggal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-5 space-y-2 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Jadwal Waktu
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FaCalendarAlt className="text-blue-600 shrink-0" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <FaClock className="text-blue-600 shrink-0" />
                    <span className="font-semibold">
                      {assignmentDetail.startTime} - {assignmentDetail.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Kendaraan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-5 space-y-2 sm:space-y-3 sm:col-span-2 md:col-span-1">
                <div className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Armada Kendaraan
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FaBus className="text-blue-600 shrink-0" />
                    <span>{assignmentDetail.vehicle?.plateNumber || "-"}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                    Kode: <span className="font-semibold text-slate-700">{assignmentDetail.vehicle?.vehicleCode || "-"}</span> | Tipe: <span className="font-semibold text-slate-700">{assignmentDetail.vehicle?.type || "-"}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500">
                    Kapasitas: <span className="font-semibold text-slate-700">{assignmentDetail.vehicle?.capacity || "-"} Kursi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Personel (Driver & Kondektur) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Driver */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <FaUserTie className="text-sm sm:text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Driver Bertugas</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {assignmentDetail.driver?.name || "-"}
                  </div>
                </div>
              </div>

              {/* Kondektur */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <FaIdBadge className="text-sm sm:text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Kondektur Bertugas</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {assignmentDetail.conductor?.name || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Estimasi Jadwal Halte (Collapsible Section) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-6 space-y-3 sm:space-y-4">
              {/* Header Toggle */}
              <div 
                onClick={() => setIsStopsOpen(!isStopsOpen)}
                className="flex items-center justify-between cursor-pointer pb-2.5 sm:pb-3 border-b border-gray-100 select-none group"
              >
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <FaMapMarkerAlt className="text-blue-600 shrink-0 text-sm sm:text-base" />
                  <span className="leading-tight">Estimasi Waktu Halte Perjalanan</span>
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
                    {assignmentDetail.estimatedStopsSchedule?.length || 0} Halte
                  </span>
                  <FaChevronDown 
                    className={`text-gray-400 text-xs sm:text-sm transition-transform duration-300 ${
                      isStopsOpen ? "rotate-180" : ""
                    }`} 
                  />
                </div>
              </div>

              {/* Konten Timeline Halte */}
              {isStopsOpen && (
                <div className="pt-1 sm:pt-2">
                  {!assignmentDetail.estimatedStopsSchedule ||
                  assignmentDetail.estimatedStopsSchedule.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Tidak ada data estimasi halte untuk penugasan ini.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-blue-100 ml-2.5 sm:ml-3 space-y-4 sm:space-y-6 py-2">
                      {assignmentDetail.estimatedStopsSchedule.map((stop) => (
                        <div key={stop.stopId} className="relative pl-5 sm:pl-6">
                          {/* Titik Timeline */}
                          <div className="absolute -left-[6px] sm:-left-[7px] top-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100"></div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/60 rounded-xl border border-gray-100 p-3 sm:p-3.5 gap-2.5 sm:gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] sm:text-xs font-semibold text-blue-600">
                                Halte ke-{stop.stopOrder}
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                                {stop.stopName}
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 break-all sm:break-normal">
                                Koordinat: {stop.latitude}, {stop.longitude}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm shrink-0 self-start sm:self-auto">
                              <FaClock className="text-blue-500 shrink-0 text-xs" />
                              <span>Est. Tiba: {stop.estimatedArrivalTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}