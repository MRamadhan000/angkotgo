"use client";

import React, { useState } from "react";
import { Review } from "@/types/review.type";
import { FaTimes, FaStar, FaExclamationTriangle, FaBus, FaUser, FaRoute } from "react-icons/fa";

interface LowReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
}

export default function LowReviewsModal({
  isOpen,
  onClose,
  reviews,
}: LowReviewsModalProps) {
  const [selectedStar, setSelectedStar] = useState<number | "ALL">("ALL");

  // Filter rating <= 3
  const lowReviews = reviews.filter((r) => r.rating <= 3);

  const filtered = selectedStar === "ALL"
    ? lowReviews
    : lowReviews.filter((r) => r.rating === selectedStar);

  const star1Count = lowReviews.filter((r) => r.rating === 1).length;
  const star2Count = lowReviews.filter((r) => r.rating === 2).length;
  const star3Count = lowReviews.filter((r) => r.rating === 3).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-amber-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <FaExclamationTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">
                  Ulasan & Rating Rendah (★ 1–3)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  {lowReviews.length} Perlu Perhatian
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring keluhan penumpang, ketepatan waktu, dan kenyamanan armada di rute
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bintang */}
        <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setSelectedStar("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedStar === "ALL"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Semua ({lowReviews.length})
          </button>
          <button
            onClick={() => setSelectedStar(1)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              selectedStar === 1
                ? "bg-red-600 text-white"
                : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
            }`}
          >
            <FaStar className="w-3 h-3" /> ★ 1 ({star1Count})
          </button>
          <button
            onClick={() => setSelectedStar(2)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              selectedStar === 2
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            <FaStar className="w-3 h-3" /> ★ 2 ({star2Count})
          </button>
          <button
            onClick={() => setSelectedStar(3)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              selectedStar === 3
                ? "bg-yellow-600 text-white"
                : "bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50"
            }`}
          >
            <FaStar className="w-3 h-3" /> ★ 3 ({star3Count})
          </button>
        </div>

        {/* List Review */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Tidak ada ulasan dengan kriteria rating ini.</p>
            </div>
          ) : (
            filtered.map((rev) => {
              const assignment = rev.vehicleAssignment;
              const route = assignment?.route;
              const vehicle = assignment?.vehicle;
              const driver = assignment?.driver;

              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-sm transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? "text-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {rev.rating}.0 / 5.0
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    &ldquo;{rev.description || "Tidak ada komentar tertulis."}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <FaUser className="w-3 h-3 text-slate-400" />
                      Oleh: <b>{rev.user?.name || `Penumpang #${rev.userId}`}</b>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-blue-700">
                      <FaRoute className="w-3 h-3 text-blue-500" />
                      Rute: {route?.routeCode || "AL"} ({route?.routeName || "Arjosari - Landungsari"})
                    </span>
                    {vehicle && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <FaBus className="w-3 h-3 text-slate-400" />
                          Unit: {vehicle.vehicleCode} ({vehicle.plateNumber})
                        </span>
                      </>
                    )}
                    {driver && (
                      <>
                        <span>•</span>
                        <span>Driver: {driver.name}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi ini dilaporkan langsung oleh pengguna aplikasi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
