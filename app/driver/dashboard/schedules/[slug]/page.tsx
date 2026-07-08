"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

// === INTERFACES ===
interface RouteInfo {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
}

interface ScheduleInfo {
  id: number;
  workDate: string;
  shift: number;
}

interface LiveSession {
  id: number;
  status: string;
  currentSequence: number;
  nextSequence: number;
  startedAt: string;
  isAtStop: boolean;
  isActive: boolean;
  endedAt: string | null;
  updatedAt: string;
}

interface TripDetail {
  id: number;
  tripNumber: number;
  route: RouteInfo;
  schedule: ScheduleInfo;
  plannedDeparture: string;
  actualDeparture: string | null;
  plannedArrival: string;
  actualArrival: string | null;
  status: string;
  liveSessions: LiveSession[];
}

interface RouteStop {
  id: number;
  name: string;
  sequence: number;
  latitude: string;
  longitude: string;
  radiusMeter: number;
  isTerminal: boolean;
}

// === TOAST TYPES ===
type ToastType = "success" | "error";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params?.slug;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // === STATE UPDATE LOKASI ===
  const [updateMode, setUpdateMode] = useState<"auto" | "manual">("auto");
  const [manualCurrentSeq, setManualCurrentSeq] = useState<number | null>(null);
  const [manualNextSeq, setManualNextSeq] = useState<number | null>(null);
  // Opsional: kecepatan (km/h) & arah (derajat) untuk mode manual,
  // dikirim ke endpoint POST /live-sessions/:id/locations
  const [manualSpeedKmh, setManualSpeedKmh] = useState<string>("");
  const [manualHeadingDegrees, setManualHeadingDegrees] = useState<string>("");

  // === STATE TOAST/POPUP ===
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    // auto dismiss setelah 4 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // === FETCH TRIP + STOPS (dipakai saat mount & untuk refresh ulang) ===
  // Dijadikan fungsi terpisah (bukan cuma di dalam useEffect) supaya bisa
  // dipanggil lagi setiap kali ada aksi yang berhasil (start/toggle/update),
  // sehingga data yang tampil selalu diambil ulang langsung dari server
  // dan tidak bergantung sepenuhnya pada bentuk response PATCH/POST.
  const fetchTripData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!tripId) return;
      try {
        if (!opts?.silent) setLoading(true);

        // cache: "no-store" supaya tidak kena cache browser, jadi
        // data yang diambil selalu yang paling baru dari server
        const tripRes = await fetch(`http://localhost:3000/trips/${tripId}`, {
          cache: "no-store",
        });
        if (!tripRes.ok) throw new Error("Gagal mengambil data detail trip");
        const tripData: TripDetail = await tripRes.json();
        setTrip(tripData);

        if (tripData.route && tripData.route.id) {
          const stopsRes = await fetch(
            `http://localhost:3000/routes/${tripData.route.id}/stops`,
            { cache: "no-store" },
          );
          if (stopsRes.ok) {
            const stopsData: RouteStop[] = await stopsRes.json();
            setStops(stopsData.sort((a, b) => a.sequence - b.sequence));
          }
        }
        setError(null);
      } catch (err: any) {
        const message = err.message || "Terjadi kesalahan";
        setError(message);
        if (opts?.silent) showToast("error", message);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [tripId, showToast],
  );

  // Fetch pertama kali saat halaman dibuka
  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  // Setiap kali ada live session aktif & pindah ke mode manual,
  // isi default pilihan manual berdasarkan posisi sesi saat ini
  useEffect(() => {
    if (trip?.liveSessions?.[0]) {
      const session = trip.liveSessions[0];
      setManualCurrentSeq(session.currentSequence);
      setManualNextSeq(session.nextSequence);
    }
  }, [trip?.liveSessions]);

  // === HANDLE START LIVE SESSION ===
  const handleStartLiveSession = async () => {
    if (!trip) return;
    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:3000/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          currentStopId: 1,
          currentSequence: 1,
          nextStopId: 2,
          nextSequence: 2,
          isAtStop: true,
        }),
      });

      if (!response.ok) throw new Error("Gagal memulai live session baru");

      // Refetch ulang dari server supaya data (termasuk field turunan
      // seperti status/updatedAt) benar-benar sinkron dengan backend
      await fetchTripData({ silent: true });
      showToast("success", "Live session berhasil dimulai");
    } catch (err: any) {
      showToast("error", err.message || "Gagal membuat session");
    } finally {
      setSubmitting(false);
    }
  };

  // === TOGGLE STATUS AKTIF LIVE SESSION (isActive: true/false) ===
  const handleToggleActive = async (nextIsAtStop: boolean) => {
    if (!activeSession) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `http://localhost:3000/live-sessions/${activeSession.id}/stop`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAtStop: !activeSession.isAtStop,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status live session");
      }

      await fetchTripData({ silent: true });
      showToast("success", "Status live session berhasil diperbarui");
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengubah status");
    } finally {
      setSubmitting(false);
    }
  };

  // === KIRIM TITIK LOKASI (lat/lng) KE live-sessions/:id/locations ===
  // Dipanggil setelah currentSequence/nextSequence berhasil di-update,
  // dengan lat/lng diambil otomatis dari stop yang jadi posisi baru.
  // Kalau gagal, tidak menggagalkan keseluruhan proses update lokasi
  // (cukup ditampilkan sebagai toast error terpisah), karena posisi
  // sequence-nya sendiri sudah berhasil tersimpan.
  const postLiveLocation = async (
    sessionId: number,
    latitude: number,
    longitude: number,
    speedKmh?: number,
    headingDegrees?: number,
  ) => {
    try {
      const body: Record<string, number> = { latitude, longitude };
      if (speedKmh !== undefined && !Number.isNaN(speedKmh)) {
        body.speedKmh = speedKmh;
      }
      if (headingDegrees !== undefined && !Number.isNaN(headingDegrees)) {
        body.headingDegrees = headingDegrees;
      }

      const response = await fetch(
        `http://localhost:3000/live-sessions/${sessionId}/locations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengirim titik lokasi (lat/lng)");
      }
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengirim titik lokasi");
    }
  };

  // === UPDATE LOKASI (OTOMATIS & MANUAL) ===
  const handleUpdateLocation = async (
    mode: "auto" | "manual",
    targetCurrentSeq?: number,
    targetNextSeq?: number,
  ) => {
    if (!activeSession || !trip || stops.length === 0) return;

    const maxSequence = stops[stops.length - 1].sequence;
    const minSequence = stops[0].sequence;

    let newCurrentSeq: number;
    let newNextSeq: number;

    if (mode === "auto") {
      newCurrentSeq = activeSession.nextSequence;

      const currentIndex = stops.findIndex((s) => s.sequence === newCurrentSeq);
      if (currentIndex === -1) {
        showToast(
          "error",
          "Halte untuk sequence ini tidak ditemukan di daftar rute",
        );
        return;
      }

      if (currentIndex >= stops.length - 1) {
        showToast("error", "Bus sudah berada di halte terakhir!");
        return;
      }

      newNextSeq = stops[currentIndex + 1].sequence;
    } else {
      if (!targetCurrentSeq || !targetNextSeq) {
        showToast(
          "error",
          "Silakan pilih posisi saat ini dan tujuan terlebih dahulu",
        );
        return;
      }
      if (targetCurrentSeq < minSequence || targetCurrentSeq > maxSequence) {
        showToast("error", "Posisi saat ini tidak valid");
        return;
      }
      if (targetNextSeq <= targetCurrentSeq) {
        showToast("error", "Tujuan berikutnya harus setelah posisi saat ini");
        return;
      }
      newCurrentSeq = targetCurrentSeq;
      newNextSeq = targetNextSeq;
    }

    const currentStop = stops.find((s) => s.sequence === newCurrentSeq);
    const nextStop = stops.find((s) => s.sequence === newNextSeq);

    const currentStopId = currentStop?.id || newCurrentSeq;
    const nextStopId = nextStop?.id || newNextSeq;

    try {
      setSubmitting(true);

      const response = await fetch(
        `http://localhost:3000/live-sessions/${activeSession.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentStopId,
            currentSequence: newCurrentSeq,
            nextStopId,
            nextSequence: newNextSeq,
            isAtStop: true,
          }),
        },
      );

      if (!response.ok) throw new Error("Gagal memperbarui lokasi");

      // Kirim juga titik lokasi (lat/lng) dari halte yang jadi posisi baru,
      // ke endpoint POST /live-sessions/:id/locations. Lat/lng diambil
      // otomatis dari data stop yang dipilih (currentStop), bukan input manual.
      if (currentStop) {
        const lat = parseFloat(currentStop.latitude);
        const lng = parseFloat(currentStop.longitude);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const speedKmh =
            mode === "manual" && manualSpeedKmh !== ""
              ? Number(manualSpeedKmh)
              : undefined;
          const headingDegrees =
            mode === "manual" && manualHeadingDegrees !== ""
              ? Number(manualHeadingDegrees)
              : undefined;

          await postLiveLocation(
            activeSession.id,
            lat,
            lng,
            speedKmh,
            headingDegrees,
          );
        }
      }

      // Ambil ulang data trip terbaru dari server, bukan cuma
      // mengandalkan body response PATCH. Ini yang memastikan
      // UI (progress bar, daftar halte, dsb) benar-benar ter-refresh.
      await fetchTripData({ silent: true });

      if (mode === "manual") {
        setManualCurrentSeq(newCurrentSeq);
        setManualNextSeq(newNextSeq);
        setManualSpeedKmh("");
        setManualHeadingDegrees("");
      }

      showToast("success", "Lokasi bus berhasil diperbarui");
    } catch (err: any) {
      showToast("error", err.message || "Gagal update lokasi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-sm text-slate-400">Memuat data trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        <h2 className="font-bold text-lg">Terjadi Kesalahan</h2>
        <p className="text-sm mt-1">{error || "Data trip tidak ditemukan."}</p>
      </div>
    );
  }

  const activeSession =
    trip.liveSessions && trip.liveSessions.length > 0
      ? trip.liveSessions[0]
      : null;
  const maxSequence = stops.length > 0 ? stops[stops.length - 1].sequence : 0;

  const currentStopIndex = activeSession
    ? stops.findIndex((s) => s.sequence === activeSession.currentSequence)
    : -1;

  const progressPercent =
    activeSession && stops.length > 1 && currentStopIndex !== -1
      ? Math.min(100, (currentStopIndex / (stops.length - 1)) * 100)
      : 0;

  const nextStopIndex = activeSession
    ? stops.findIndex((s) => s.sequence === activeSession.nextSequence)
    : -1;
  const isAtLastStop =
    nextStopIndex !== -1 && nextStopIndex >= stops.length - 1;
  const upcomingAfterNextStop =
    nextStopIndex !== -1 && nextStopIndex < stops.length - 1
      ? stops[nextStopIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      {/* ==================== TOAST POPUP ==================== */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <span className="text-lg leading-none">
              {toast.type === "success" ? "✅" : "⚠️"}
            </span>
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-5">
        {/* HEADER */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: trip.route.color || "#2563eb" }}
              >
                {trip.route.code}
              </span>
              <h1 className="text-2xl font-bold text-slate-800">
                Trip #{trip.tripNumber}
              </h1>
            </div>
            <p className="text-slate-500 mt-1 text-sm">{trip.route.name}</p>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider w-fit ${
              trip.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Status: {trip.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* KOLOM KIRI */}
          <div className="lg:col-span-2 space-y-5">
            {/* INFO JADWAL & TRIP */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Informasi Perjalanan
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Tanggal Kerja</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {trip.schedule.workDate} (Shift {trip.schedule.shift})
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Arah Rute</p>
                  <p className="font-medium text-slate-800 uppercase mt-0.5">
                    {trip.route.direction}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Rencana Berangkat</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {trip.plannedDeparture}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Rencana Tiba</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {trip.plannedArrival}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Aktual Berangkat</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {trip.actualDeparture
                      ? new Date(trip.actualDeparture).toLocaleTimeString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Aktual Tiba</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {trip.actualArrival
                      ? new Date(trip.actualArrival).toLocaleTimeString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE SESSIONS STATUS + UPDATE LOKASI */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Live Tracking Session
              </h2>

              {activeSession ? (
                <div className="space-y-5">
                  {/* Status Live */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      activeSession.isActive
                        ? "bg-blue-50 border-blue-100"
                        : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          activeSession.isActive
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      >
                        Status Live
                      </p>
                      <p
                        className={`text-xl font-bold mt-0.5 ${
                          activeSession.isActive
                            ? "text-blue-900"
                            : "text-slate-500"
                        }`}
                      >
                        {activeSession.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeSession.isActive ? (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                      )}

                      {/* Toggle Switch isActive */}
                      <button
                        onClick={() =>
                          handleToggleActive(!activeSession.isActive)
                        }
                        disabled={submitting}
                        aria-pressed={activeSession.isActive}
                        aria-label="Toggle status aktif live session"
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          activeSession.isActive
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                            activeSession.isActive
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 -mt-3">
                    {activeSession.isActive
                      ? "🟢 Live session sedang aktif — bus terdeteksi live."
                      : "⚪ Live session tidak aktif — bus tidak sedang di-tracking."}
                  </p>

                  {/* Progress bar rute */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress Rute</span>
                      <span>
                        Seq {activeSession.currentSequence} / {maxSequence}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Info Sequence */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 text-xs">
                        Sequence Sekarang
                      </p>
                      <p className="font-bold text-lg text-slate-800">
                        {activeSession.currentSequence}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 text-xs">
                        Sequence Berikutnya
                      </p>
                      <p className="font-bold text-lg text-slate-800">
                        {activeSession.nextSequence}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
                      <p className="text-slate-400 text-xs">Posisi Bus</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {activeSession.isAtStop
                          ? "🛑 Berhenti di Halte"
                          : "🚌 Sedang Jalan"}
                      </p>
                    </div>
                  </div>

                  {/* ==================== FITUR UPDATE LOKASI ==================== */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-700 mb-3">
                      Update Lokasi Bus
                    </h3>

                    {/* Mode Switch */}
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden mb-4 w-fit bg-slate-50">
                      <button
                        onClick={() => setUpdateMode("auto")}
                        className={`px-5 py-2 text-sm font-medium transition ${
                          updateMode === "auto"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Otomatis
                      </button>
                      <button
                        onClick={() => setUpdateMode("manual")}
                        className={`px-5 py-2 text-sm font-medium transition ${
                          updateMode === "manual"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Manual
                      </button>
                    </div>

                    {/* MODE OTOMATIS */}
                    {updateMode === "auto" && (
                      <div className="space-y-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-sm text-slate-600">
                          Bus akan bergerak satu langkah:{" "}
                          <span className="font-semibold text-slate-800">
                            {stops.find(
                              (s) => s.sequence === activeSession.nextSequence,
                            )?.name ?? `Seq ${activeSession.nextSequence}`}
                          </span>{" "}
                          menjadi posisi sekarang, tujuan berikutnya otomatis{" "}
                          <span className="font-semibold text-slate-800">
                            {upcomingAfterNextStop
                              ? upcomingAfterNextStop.name
                              : isAtLastStop
                                ? "(sudah halte terakhir)"
                                : "-"}
                          </span>
                          .
                        </p>
                        <button
                          onClick={() => handleUpdateLocation("auto")}
                          disabled={submitting || isAtLastStop}
                          className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting
                            ? "Memperbarui..."
                            : isAtLastStop
                              ? "🏁 Sudah di Halte Terakhir"
                              : "➡️ Lanjut ke Halte Berikutnya"}
                        </button>
                      </div>
                    )}

                    {/* MODE MANUAL */}
                    {updateMode === "manual" && (
                      <div className="space-y-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                        <p className="text-sm text-slate-600">
                          Pilih posisi bus saat ini dan tujuan berikutnya secara
                          manual.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                              📍 Posisi Saat Ini
                            </label>
                            <select
                              value={manualCurrentSeq ?? ""}
                              onChange={(e) =>
                                setManualCurrentSeq(Number(e.target.value))
                              }
                              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              <option value="">-- Pilih Halte --</option>
                              {stops.map((stop) => (
                                <option key={stop.id} value={stop.sequence}>
                                  Seq {stop.sequence} — {stop.name}
                                  {stop.isTerminal ? " (Terminal)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                              🎯 Tujuan Berikutnya
                            </label>
                            <select
                              value={manualNextSeq ?? ""}
                              onChange={(e) =>
                                setManualNextSeq(Number(e.target.value))
                              }
                              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              <option value="">-- Pilih Halte --</option>
                              {stops
                                .filter(
                                  (stop) =>
                                    manualCurrentSeq == null ||
                                    stop.sequence > manualCurrentSeq,
                                )
                                .map((stop) => (
                                  <option key={stop.id} value={stop.sequence}>
                                    Seq {stop.sequence} — {stop.name}
                                    {stop.isTerminal ? " (Terminal)" : ""}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {/* Opsional: kecepatan & arah, dikirim bersama lat/lng
                            ke endpoint POST /live-sessions/:id/locations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                              🚀 Kecepatan (km/h){" "}
                              <span className="font-normal text-slate-400">
                                — opsional
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={manualSpeedKmh}
                              onChange={(e) =>
                                setManualSpeedKmh(e.target.value)
                              }
                              placeholder="cth. 40"
                              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                              🧭 Arah / Heading (derajat){" "}
                              <span className="font-normal text-slate-400">
                                — opsional
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={359}
                              value={manualHeadingDegrees}
                              onChange={(e) =>
                                setManualHeadingDegrees(e.target.value)
                              }
                              placeholder="cth. 90"
                              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          📍 Lat/Lng akan diambil otomatis dari halte "Posisi
                          Saat Ini" yang dipilih di atas.
                        </p>

                        <button
                          onClick={() =>
                            handleUpdateLocation(
                              "manual",
                              manualCurrentSeq ?? undefined,
                              manualNextSeq ?? undefined,
                            )
                          }
                          disabled={
                            submitting || !manualCurrentSeq || !manualNextSeq
                          }
                          className="w-full px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting
                            ? "Memperbarui..."
                            : "📍 Simpan Posisi Manual"}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* ==================== AKHIR FITUR UPDATE LOKASI ==================== */}

                  <p className="text-xs text-slate-400">
                    Ditinjau terakhir:{" "}
                    {new Date(activeSession.updatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-slate-500 text-sm">
                    Belum ada live session yang aktif untuk trip ini.
                  </p>
                  <button
                    onClick={handleStartLiveSession}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {submitting
                      ? "Membuat Session..."
                      : "🚀 Mulai Live Session Baru"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: DAFTAR HALTE */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 max-h-[700px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800">
                Daftar Halte Rute
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total terdapat {stops.length} halte pemberhentian
              </p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-2">
              {stops.map((stop) => {
                const isCurrentStop =
                  activeSession?.currentSequence === stop.sequence;
                const isNextStop =
                  activeSession?.nextSequence === stop.sequence;
                const isPassed = activeSession
                  ? stop.sequence < activeSession.currentSequence
                  : false;

                return (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      isCurrentStop
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                        : isNextStop
                          ? "bg-amber-50 border-amber-300"
                          : isPassed
                            ? "bg-white border-slate-100 opacity-50"
                            : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 flex flex-col items-center justify-center rounded-lg font-bold text-[10px] ${
                          isCurrentStop
                            ? "bg-blue-600 text-white"
                            : isNextStop
                              ? "bg-amber-500 text-white"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="text-[8px] opacity-75 font-normal">
                          Seq
                        </span>
                        <span className="-mt-1">{stop.sequence}</span>
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-800">
                            {stop.name}
                          </p>
                          {stop.isTerminal && (
                            <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100">
                              Terminal
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          Radius: {stop.radiusMeter}m | Lat:{" "}
                          {parseFloat(stop.latitude).toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isCurrentStop && (
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wide animate-pulse">
                          Bus Sini
                        </span>
                      )}
                      {isNextStop && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wide">
                          Berikutnya
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {stops.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">
                  Tidak ada daftar halte.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
