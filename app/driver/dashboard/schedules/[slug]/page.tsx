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

  // === STATE UPDATE LOKASI (SEQUENCE) ===
  const [updateMode, setUpdateMode] = useState<"auto" | "manual">("auto");
  const [manualCurrentSeq, setManualCurrentSeq] = useState<number | null>(null);
  const [manualNextSeq, setManualNextSeq] = useState<number | null>(null);
  const [manualSpeedKmh, setManualSpeedKmh] = useState<string>("");
  const [manualHeadingDegrees, setManualHeadingDegrees] = useState<string>("");

  // === STATE GPS & ADD LIVE LOCATION ===
  const [currentGPS, setCurrentGPS] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [addLocMode, setAddLocMode] = useState<"auto" | "manual">("auto");
  const [manualLocInputMode, setManualLocInputMode] = useState<
    "input" | "select"
  >("input");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [selectedStopForLoc, setSelectedStopForLoc] = useState<number | null>(
    null,
  );
  const [addLocSpeed, setAddLocSpeed] = useState("");
  const [addLocHeading, setAddLocHeading] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);

  // === STATE TOAST/POPUP ===
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // === FETCH TRIP + STOPS ===
  const fetchTripData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!tripId) return;
      try {
        if (!opts?.silent) setLoading(true);

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

  // Fetch pertama kali
  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  // Set default manual sequence dari live session
  useEffect(() => {
    if (trip?.liveSessions?.[0]) {
      const session = trip.liveSessions[0];
      setManualCurrentSeq(session.currentSequence);
      setManualNextSeq(session.nextSequence);
    }
  }, [trip?.liveSessions]);

  // === GET CURRENT GPS ===
  const getCurrentGPS = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = "Browser tidak mendukung Geolocation API";
      setGpsError(msg);
      showToast("error", msg);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentGPS({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setGpsLoading(false);
        showToast("success", "Posisi GPS berhasil diperbarui");
      },
      (err) => {
        let msg = "Gagal mendapatkan posisi GPS";
        if (err.code === 1) msg = "Izin akses lokasi ditolak oleh pengguna";
        else if (err.code === 2) msg = "Posisi tidak tersedia";
        else if (err.code === 3) msg = "Timeout saat mengambil lokasi";

        setGpsError(msg);
        setGpsLoading(false);
        showToast("error", msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, [showToast]);

  // === POST LIVE LOCATION (Endpoint baru sesuai permintaan) ===
  const postAddLiveLocation = async (
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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mengirim live location");
      }
    } catch (err: any) {
      throw err;
    }
  };

  // === HANDLE ADD LIVE LOCATION (GPS) ===
  const handleAddLiveLocation = async () => {
    if (!activeSession) return;

    let lat: number | null = null;
    let lng: number | null = null;

    if (addLocMode === "auto") {
      if (!currentGPS) {
        showToast("error", "Silakan ambil posisi GPS terlebih dahulu");
        return;
      }
      lat = currentGPS.lat;
      lng = currentGPS.lng;
    } else {
      if (manualLocInputMode === "input") {
        lat = parseFloat(manualLat);
        lng = parseFloat(manualLng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          showToast("error", "Latitude dan Longitude harus diisi dengan benar");
          return;
        }
      } else {
        if (!selectedStopForLoc) {
          showToast("error", "Silakan pilih halte terlebih dahulu");
          return;
        }
        const stop = stops.find((s) => s.sequence === selectedStopForLoc);
        if (!stop) {
          showToast("error", "Data halte tidak ditemukan");
          return;
        }
        lat = parseFloat(stop.latitude);
        lng = parseFloat(stop.longitude);
      }
    }

    if (
      lat === null ||
      lng === null ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      showToast("error", "Koordinat tidak valid");
      return;
    }

    const speed = addLocSpeed !== "" ? Number(addLocSpeed) : undefined;
    const heading = addLocHeading !== "" ? Number(addLocHeading) : undefined;

    setAddingLocation(true);
    try {
      await postAddLiveLocation(activeSession.id, lat, lng, speed, heading);
      showToast("success", "Live location berhasil dikirim ke server");

      // Reset form
      if (addLocMode === "manual") {
        setManualLat("");
        setManualLng("");
        setSelectedStopForLoc(null);
      }
      setAddLocSpeed("");
      setAddLocHeading("");
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengirim live location");
    } finally {
      setAddingLocation(false);
    }
  };

  // === HANDLE START LIVE SESSION ===
  const handleStartLiveSession = async () => {
    if (!trip) return;

    if (stops.length < 2) {
      showToast("error", "Data halte tidak cukup untuk memulai live session");
      return;
    }

    const firstStop = stops[0];
    const secondStop = stops[1];

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:3000/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          currentStopId: firstStop.id,
          currentSequence: firstStop.sequence,
          nextStopId: secondStop.id,
          nextSequence: secondStop.sequence,
          isAtStop: true,
        }),
      });
      if (!response.ok) throw new Error("Gagal memulai live session baru");
      await fetchTripData({ silent: true });
      showToast("success", "Live session berhasil dimulai");
    } catch (err: any) {
      showToast("error", err.message || "Gagal membuat session");
    } finally {
      setSubmitting(false);
    }
  };

  // === TOGGLE IS AT STOP ===
  const handleToggleIsAtStop = async () => {
    if (!activeSession) return;
    try {
      setSubmitting(true);
      const newIsAtStop = !activeSession.isAtStop;

      const response = await fetch(
        `http://localhost:3000/live-sessions/${activeSession.id}/stop`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAtStop: newIsAtStop }),
        },
      );
      if (!response.ok) throw new Error("Gagal memperbarui status");

      await fetchTripData({ silent: true });
      showToast(
        "success",
        `Status diubah menjadi ${newIsAtStop ? "Berhenti di Halte" : "Sedang Jalan"}`,
      );
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengubah status");
    } finally {
      setSubmitting(false);
    }
  };

  // === UPDATE LOKASI (OTOMATIS & MANUAL SEQUENCE) - KEEP AS IS ===
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
        showToast("error", "Halte untuk sequence ini tidak ditemukan");
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

      // Kirim juga titik lokasi (opsional)
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
          await postAddLiveLocation(
            activeSession.id,
            lat,
            lng,
            speedKmh,
            headingDegrees,
          );
        }
      }

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
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 ${toast.type === "success"
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
        {/* ==================== HEADER + GPS ==================== */}
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider w-fit ${trip.status === "ACTIVE"
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


          </div>

          {/* KOLOM KANAN: DAFTAR HALTE */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 max-h-[700px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800">
                Daftar Halte Rute
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total {stops.length} halte
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
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${isCurrentStop
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
                        className={`w-8 h-8 flex flex-col items-center justify-center rounded-lg font-bold text-[10px] ${isCurrentStop
                            ? "bg-blue-600 text-white"
                            : isNextStop
                              ? "bg-amber-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        <span className="text-[8px] opacity-75">Seq</span>
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
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px]">
                          Bus Sini
                        </span>
                      )}
                      {isNextStop && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px]">
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
