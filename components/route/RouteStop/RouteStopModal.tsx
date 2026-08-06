"use client";

import { useState, useEffect } from "react";
import { DirectionType } from "@/types/vehicle.type";
import { FiX, FiMapPin, FiCompass, FiType, FiList } from "react-icons/fi";

interface RouteStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stopName: string;
    latitude: number;
    longitude: number;
    stopOrder: number;
    direction: DirectionType;
  }) => Promise<void>;
  initialData?: {
    stopName?: string;
    latitude?: number;
    longitude?: number;
    stopOrder?: number;
    direction?: DirectionType;
  } | null;
  mode: "CREATE" | "EDIT";
  routeId: number;
  defaultDirection: DirectionType;
}

export default function RouteStopModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  routeId,
  defaultDirection,
}: RouteStopModalProps) {
  const [stopName, setStopName] = useState("");
  const [latitude, setLatitude] = useState<string | number>("");
  const [longitude, setLongitude] = useState<string | number>("");
  const [stopOrder, setStopOrder] = useState<string | number>(1);
  const [direction, setDirection] = useState<DirectionType>(defaultDirection);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setStopName(initialData.stopName || "");
      setLatitude(initialData.latitude ?? "");
      setLongitude(initialData.longitude ?? "");
      setStopOrder(initialData.stopOrder ?? 1);
      setDirection(initialData.direction || defaultDirection);
    } else {
      setStopName("");
      setLatitude("");
      setLongitude("");
      setStopOrder(1);
      setDirection(defaultDirection);
    }
  }, [initialData, defaultDirection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        stopName,
        latitude: Number(latitude),
        longitude: Number(longitude),
        stopOrder: Number(stopOrder),
        direction,
      });
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan data halte:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {mode === "CREATE" ? "Tambah Halte Baru" : "Edit Data Halte"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Route ID: <span className="font-semibold text-gray-800">{routeId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* FORM INPUT */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nama Halte */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiType className="w-3.5 h-3.5 text-blue-600" />
              Nama Halte
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Halte Terminal Landungsari"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Urutan Halte */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiList className="w-3.5 h-3.5 text-blue-600" />
                Urutan Halte (Order)
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="1"
                value={stopOrder}
                onChange={(e) => setStopOrder(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>

            {/* Arah / Direction */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiCompass className="w-3.5 h-3.5 text-blue-600" />
                Arah (Direction)
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as DirectionType)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
              >
                <option value={DirectionType.FORWARD}>FORWARD (Pergi)</option>
                <option value={DirectionType.RETURN}>RETURN (Pulang)</option>
              </select>
            </div>
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-blue-600" />
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="-7.9826"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-blue-600" />
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="112.6308"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : mode === "CREATE" ? "Simpan Halte" : "Perbarui Halte"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}