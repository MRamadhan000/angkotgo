"use client";

import { useState } from "react";
import { FiAlertCircle, FiCheck, FiSend, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCreateReview } from "@/hooks/useReview";
import type { UpcomingVehicle } from "@/types/route-search.type";

interface FeedbackModalProps {
  vehicle: UpcomingVehicle;
  onClose: () => void;
  onSubmitted: (assignmentId: number) => void;
  onFinished: () => void;
}

export default function FeedbackModal({
  vehicle,
  onClose,
  onSubmitted,
  onFinished,
}: FeedbackModalProps) {
  const { user } = useAuth();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wantsToReview, setWantsToReview] = useState<boolean | null>(null);

  const handleSkip = () => {
    onFinished();
  };

  const handleContinue = () => {
    setWantsToReview(true);
    setError(null);
  };

  const handleSubmit = async () => {
    const userId = Number(user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Sesi pengguna tidak valid. Silakan masuk kembali.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }
    if (!description.trim()) {
      setError("Silakan isi feedback terlebih dahulu.");
      return;
    }

    setError(null);
    try {
      await createReview.mutateAsync({
        userId,
        vehicleAssignmentId: vehicle.assignmentId,
        rating,
        description: description.trim() || undefined,
      });
      onSubmitted(vehicle.assignmentId);
      onClose();
      onFinished();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengirim feedback.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Pembayaran berhasil
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Apakah Anda sudah naik?
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {wantsToReview === true
                ? `Beri penilaian untuk ${vehicle.driver?.name || "driver"}.`
                : "Bagikan pengalaman perjalanan Anda secara opsional."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Tutup feedback"
          >
            <FiX />
          </button>
        </div>

        {wantsToReview === null && (
          <div className="space-y-3 py-6">
            <button
              type="button"
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <FiCheck /> Ya, beri feedback
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Tidak sekarang
            </button>
          </div>
        )}

        {wantsToReview === true && (
          <div className="py-5 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Rating perjalanan
            </p>
            <div
              className="mt-3 flex justify-center gap-2"
              role="radiogroup"
              aria-label="Rating perjalanan"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-3xl leading-none transition-transform hover:scale-110 ${
                    value <= rating ? "text-amber-400" : "text-slate-200"
                  }`}
                  aria-label={`${value} bintang`}
                  aria-pressed={value === rating}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {rating ? `${rating} dari 5 bintang` : "Pilih rating Anda"}
            </p>
          </div>
        )}

        {wantsToReview === true && (
          <>
            <label
              className="block text-xs font-semibold text-slate-600"
              htmlFor="feedback-description"
            >
              Feedback wajib diisi
            </label>
            <textarea
              id="feedback-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ceritakan pengalaman perjalanan Anda..."
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            {error && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                <FiAlertCircle className="shrink-0" />
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={createReview.isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createReview.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Mengirim feedback...
                </>
              ) : (
                <>
                  <FiSend /> Kirim Feedback
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
