"use client";

import { useState, useEffect } from "react";
import { DirectionType } from "@/types/vehicle.type";
import { FiX, FiMapPin, FiCompass, FiSave, FiRefreshCw } from "react-icons/fi";

interface RoutePathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    latitude: number;
    longitude: number;
    sequenceOrder: number;
    direction: DirectionType;
  }) => Promise<void>;
  initialData?: {
    latitude: number;
    longitude: number;
    sequenceOrder: number;
    direction: DirectionType;
  } | null;
  mode: "CREATE" | "EDIT";
  routeId: number;
  defaultDirection: DirectionType;
}

export default function RoutePathModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  routeId,
  defaultDirection,
}: RoutePathModalProps) {
  const [latitude, setLatitude] = useState<string>("-7.9666");
  const [longitude, setLongitude] = useState<string>("112.6326");
  const [sequenceOrder, setSequenceOrder] = useState<string>("1");
  const [direction, setDirection] = useState<DirectionType>(defaultDirection);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "EDIT") {
      setLatitude(initialData.latitude.toString());
      setLongitude(initialData.longitude.toString());
      setSequenceOrder(initialData.sequenceOrder.toString());
      setDirection(initialData.direction);
    } else {
      // Reset atau set default untuk mode CREATE
      setLatitude("-7.9666");
      setLongitude("112.6326");
      setDirection(defaultDirection);
    }
  }, [initialData, mode, defaultDirection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        sequenceOrder: parseInt(sequenceOrder) || 1,
        direction,
      });
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan data route path:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {mode === "CREATE" ? "Tambah Titik Jalur Baru" : "Edit Titik Jalur"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Route ID: <span className="font-semibold text-gray-800">#{routeId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Arah / Direction */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Arah (Direction)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiCompass className="w-4 h-4" />
              </span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as DirectionType)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value={DirectionType.FORWARD}>FORWARD (Pergi)</option>
                <option value={DirectionType.RETURN}>RETURN (Pulang)</option>
              </select>
            </div>
          </div>

          {/* Grid Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Latitude
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMapPin className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Contoh: -7.9666"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Longitude
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMapPin className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Contoh: 112.6326"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sequence Order / Urutan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Urutan Titik (Sequence Order)
            </label>
            <input
              type="number"
              min="1"
              required
              value={sequenceOrder}
              onChange={(e) => setSequenceOrder(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}