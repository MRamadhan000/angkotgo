"use client";

import { useState } from "react";
import { FiNavigation, FiRadio, FiCheck, FiHelpCircle } from "react-icons/fi";

import UpcomingVehicleCard from "./UpcomingVehicleCard";
import { UpcomingVehicle } from "@/types/route-search.type";
import type { VehicleRealtimePayload } from "@/services/vehicles/vehicleSocket.service";

interface UpcomingVehicleListProps {
  upcomingVehicles: UpcomingVehicle[];
  onBook: (vehicle: UpcomingVehicle) => void;
  selectedVehicleId?: number | null;

  /**
   * Method yang dipanggil ketika user
   * ingin mengirim sinyal.
   */
  onSubmit: () => Promise<boolean>;

  onBoarded: () => Promise<void>;

  isCompletingSinyal?: boolean;

  /**
   * Status loading dari parent jika diperlukan.
   */
  isSubmitting?: boolean;
  realtimeVehicles?: Record<number, VehicleRealtimePayload>;
  isSocketConnected?: boolean;
  joinedAssignmentIds?: number[];
}

export default function UpcomingVehicleList({
  upcomingVehicles: vehicles,
  onBook,
  selectedVehicleId = null,
  onSubmit,
  onBoarded,
  isCompletingSinyal = false,
  isSubmitting = false,
  realtimeVehicles = {},
  isSocketConnected = false,
  joinedAssignmentIds = [],
}: UpcomingVehicleListProps) {
  const [submitted, setSubmitted] = useState(false);
  const [hasBoarded, setHasBoarded] = useState(false);

  const handleSubmit = async () => {
    try {
      const submittedSuccessfully = await onSubmit();
      if (submittedSuccessfully) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Gagal mengirim sinyal:", error);
    }
  };

  const handleBoarded = async () => {
    try {
      await onBoarded();
      setHasBoarded(true);
    } catch (error) {
      console.error("Gagal menyelesaikan sinyal:", error);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Pilih Angkot
            </h2>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#003d9b] ring-1 ring-blue-600/20">
              {vehicles.length} tersedia
            </span>
          </div>

          <p className="mt-0.5 text-[11px] text-slate-500">
            Kirim sinyal & pilih angkot rute kamu
          </p>
        </div>
      </div>

      {/* SIGNAL BUTTON (Blue Gradient) */}
      <div className="shrink-0 px-4 pb-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || submitted}
          className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3 text-xs font-bold transition-all sm:text-sm ${
            submitted
              ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
              : "bg-gradient-to-r from-[#003d9b] via-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-blue-600 active:scale-[0.99]"
          } ${
            isSubmitting || submitted ? "cursor-not-allowed opacity-90" : ""
          }`}
        >
          {submitted ? (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                <FiCheck className="text-xs" />
              </div>
              <span>Sinyal Berhasil Dikirim ke Driver</span>
            </>
          ) : isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Menghubungi Angkot Terdekat...</span>
            </>
          ) : (
            <>
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              <FiRadio className="text-base" />
              <span>Kirim Sinyal ke Angkot Terdekat</span>
            </>
          )}
        </button>
      </div>

      {/* BOARDING CONFIRMATION DIALOG */}
      {submitted && (
        <div className="mx-4 mb-3 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/60 p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
              <FiHelpCircle className="text-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                Apakah Anda sudah naik ke dalam angkot?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Konfirmasi status naik untuk mengaktifkan pemesanan tiket resmi.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleBoarded}
              disabled={hasBoarded || isCompletingSinyal}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                hasBoarded
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-[#003d9b] text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {isCompletingSinyal
                ? "Memproses..."
                : hasBoarded
                  ? "✓ Sudah Naik"
                  : "Ya, Saya Sudah Naik"}
            </button>
            <button
              type="button"
              onClick={() => {
                setHasBoarded(false);
                setSubmitted(false);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                hasBoarded
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98]"
                  : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {hasBoarded ? "Batal Naik" : "Belum"}
            </button>
          </div>
        </div>
      )}

      {/* VEHICLES LIST */}
      {vehicles.length > 0 ? (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-5">
          {vehicles.map((vehicle) => (
            <UpcomingVehicleCard
              key={vehicle.assignmentId}
              vehicle={vehicle}
              onBook={onBook}
              isSelected={selectedVehicleId === vehicle.assignmentId}
              isBookingEnabled={hasBoarded}
              realtimeData={realtimeVehicles[vehicle.assignmentId] ?? null}
              isSocketConnected={isSocketConnected}
              isRoomJoined={joinedAssignmentIds.includes(
                Number(vehicle.assignmentId),
              )}
            />
          ))}
        </div>
      ) : (
        <div className="mx-4 mb-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#003d9b]">
            <FiNavigation className="text-xl rotate-45" />
          </div>

          <p className="mt-3 text-sm font-bold text-slate-800">
            Belum ada angkot di rute ini
          </p>

          <p className="mt-1 max-w-xs text-[11px] text-slate-500">
            Belum ada angkot yang beroperasi di sekitar lokasi penjemputanmu
            saat ini. Coba cek beberapa saat lagi.
          </p>
        </div>
      )}
    </div>
  );
}
