"use client";

import { useState } from "react";
import {
  FiNavigation,
  FiRadio,
  FiCheck,
} from "react-icons/fi";

import UpcomingVehicleCard from "./UpcomingVehicleCard";
import { UpcomingVehicle } from "@/types/route-search.type";

interface UpcomingVehicleListProps {
  upcomingVehicles: UpcomingVehicle[];

  /**
   * Method yang dipanggil ketika user
   * ingin mengirim sinyal.
   */
  onSubmit: () => Promise<void> | void;

  /**
   * Status loading dari parent jika diperlukan.
   */
  isSubmitting?: boolean;
}

export default function UpcomingVehicleList({
  upcomingVehicles: vehicles,
  onSubmit,
  isSubmitting = false,
}: UpcomingVehicleListProps) {
  const [submitted, setSubmitted] = useState(false);
  const [hasBoarded, setHasBoarded] = useState(false);

  const handleSubmit = async () => {
    try {
      await onSubmit();
      setSubmitted(true);
    } catch (error) {
      console.error("Gagal mengirim sinyal:", error);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#191b23]">
            Angkot yang tersedia
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-500">
            Pilih angkot yang ingin kamu gunakan
          </p>
        </div>

        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#003d9b]/10 px-2 text-xs font-bold text-[#003d9b]">
          {vehicles.length}
        </div>
      </div>

      {/* SIGNAL BUTTON */}
      <div className="shrink-0 px-4 pb-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || submitted}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            submitted
              ? "bg-green-50 text-green-600"
              : "bg-[#003d9b] text-white hover:bg-[#003d9b]/90"
          } ${
            isSubmitting || submitted
              ? "cursor-not-allowed opacity-80"
              : ""
          }`}
        >
          {submitted ? (
            <>
              <FiCheck className="text-base" />
              Sinyal berhasil dikirim
            </>
          ) : isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengirim sinyal...
            </>
          ) : (
            <>
              <FiRadio className="text-base" />
              Kirim sinyal ke angkot terdekat
            </>
          )}
        </button>
      </div>

      {submitted && (
        <div className="mx-4 mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm font-semibold text-slate-800">
            Apakah Anda sudah naik?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setHasBoarded(true)}
              disabled={hasBoarded}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Ya, saya sudah naik
            </button>
            <button
              type="button"
              onClick={() => setHasBoarded(false)}
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
            >
              Belum
            </button>
          </div>
        </div>
      )}

      {/* VEHICLES */}
      {vehicles.length > 0 ? (
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-4">
          {vehicles.map((vehicle) => (
            <UpcomingVehicleCard
              key={vehicle.assignmentId}
              vehicle={vehicle}
              isBookingEnabled={hasBoarded}
            />
          ))}
        </div>
      ) : (
        <div className="mx-4 mb-4 flex flex-col items-center justify-center rounded-2xl bg-white px-5 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003d9b]/10 text-[#003d9b]">
            <FiNavigation className="text-xl" />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#191b23]">
            Belum ada angkot
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            Belum ada angkot yang tersedia di sekitar rute kamu.
          </p>
        </div>
      )}
    </div>
  );
}