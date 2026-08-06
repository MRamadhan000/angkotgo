"use client";

import { useState, useEffect } from "react";
import { FiX, FiClock, FiMapPin, FiNavigation } from "react-icons/fi";
import { DirectionType } from "@/types/vehicles/vehicle.type";

interface RouteIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fromStopId: number;
    toStopId: number;
    distanceInMeters: number;
    durationInSeconds: number;
    direction: DirectionType;
  }) => Promise<void>;
  routeStops: Array<{ id: number; stopName: string; stopOrder: number }>;
  defaultDirection: DirectionType;
  mode: "CREATE" | "EDIT";
  initialData?: any;
}

export default function RouteIntervalModal({
  isOpen,
  onClose,
  onSubmit,
  routeStops,
  defaultDirection,
  mode,
  initialData,
}: RouteIntervalModalProps) {
  const [fromStopId, setFromStopId] = useState<number | "">("");
  const [toStopId, setToStopId] = useState<number | "">("");
  const [distance, setDistance] = useState<number | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "EDIT" && initialData) {
        setFromStopId(initialData.fromStopId ?? "");
        setToStopId(initialData.toStopId ?? "");
        setDistance(initialData.distanceInMeters ?? "");
        setDuration(initialData.durationInSeconds ?? "");
      } else {
        setFromStopId("");
        setToStopId("");
        setDistance("");
        setDuration("");
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      fromStopId === "" ||
      toStopId === "" ||
      distance === "" ||
      duration === ""
    ) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (fromStopId === toStopId) {
      alert("Halte asal dan halte tujuan tidak boleh sama!");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        fromStopId: Number(fromStopId),
        toStopId: Number(toStopId),
        distanceInMeters: Number(distance),
        durationInSeconds: Number(duration),
        direction: defaultDirection,
      });
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan interval:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {mode === "CREATE"
                  ? "Tambah Interval Antar Halte"
                  : "Edit Interval Antar Halte"}
              </h3>
              <p className="text-xs text-gray-400">
                Arah:{" "}
                <span className="font-semibold text-gray-700">
                  {defaultDirection}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {routeStops.length < 2 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">
              Minimal harus ada 2 halte terdaftar pada arah ini untuk membuat
              interval jarak & durasi.
            </div>
          ) : (
            <>
              {/* Halte Asal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <FiMapPin className="w-3.5 h-3.5 text-blue-600" />
                  Halte Asal (From Stop)
                </label>
                <select
                  value={fromStopId}
                  onChange={(e) =>
                    setFromStopId(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="">Pilih Halte Asal...</option>
                  {routeStops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      #{stop.stopOrder} - {stop.stopName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Halte Tujuan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <FiNavigation className="w-3.5 h-3.5 text-emerald-600" />
                  Halte Tujuan (To Stop)
                </label>
                <select
                  value={toStopId}
                  onChange={(e) =>
                    setToStopId(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="">Pilih Halte Tujuan...</option>
                  {routeStops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      #{stop.stopOrder} - {stop.stopName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jarak */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Jarak (Meter)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 1500"
                    value={distance}
                    onChange={(e) =>
                      setDistance(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                {/* Durasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Durasi (Detik)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 300"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer Tombol */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            {routeStops.length >= 2 && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {loading
                  ? "Menyimpan..."
                  : mode === "CREATE"
                    ? "Simpan Interval"
                    : "Perbarui Interval"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
