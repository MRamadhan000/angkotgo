"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaMapMarkerAlt,
  FaCrosshairs,
  FaBus,
  FaClock,
  FaRoute,
  FaCheckCircle,
  FaSearch,
  FaExclamationTriangle,
  FaPowerOff,
} from "react-icons/fa";

// ==========================================
// TIPE DATA & INTERFACE
// ==========================================
interface LocationOption {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface StopPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface AngkotItem {
  id: string;
  code: string; // Misal: "AT", "AL", "GA"
  routeName: string;
  plateNumber: string;
  driverName: string;
  distanceKm: number;
  estimatedArrivalMin: number;
  operatingHours: string;
  isActiveNow: boolean;
  currentLat: number;
  currentLng: number;
  stops: StopPoint[];
}

// ==========================================
// DUMMY DATA LOKASI & ANGKOT MALANG
// ==========================================
const DUMMY_DESTINATIONS: LocationOption[] = [
  {
    id: "1",
    name: "Stasiun Malang Kota Baru",
    address: "Jl. Trunojoyo No.10, Klojen",
    lat: -7.9781,
    lng: 112.6372,
  },
  {
    id: "2",
    name: "Alun-Alun Kota Malang",
    address: "Jl. Merdeka Selatan, Kauman",
    lat: -7.9826,
    lng: 112.6308,
  },
  {
    id: "3",
    name: "Matos (Malang Town Square)",
    address: "Jl. Veteran No.2, Penanggungan",
    lat: -7.9569,
    lng: 112.6186,
  },
  {
    id: "4",
    name: "Terminal Arjosari",
    address: "Jl. Terusan Raden Intan, Arjosari",
    lat: -7.9304,
    lng: 112.6531,
  },
  {
    id: "5",
    name: "Universitas Brawijaya (UB)",
    address: "Jl. Veteran, Ketawanggede",
    lat: -7.9526,
    lng: 112.6144,
  },
];

const DUMMY_STOPS: StopPoint[] = [
  { id: "s1", name: "Halte UB Veteran", lat: -7.9535, lng: 112.615 },
  { id: "s2", name: "Halte ITN", lat: -7.958, lng: 112.611 },
  { id: "s3", name: "Halte Matos", lat: -7.9565, lng: 112.618 },
  { id: "s4", name: "Halte Pasar Besar", lat: -7.985, lng: 112.632 },
];

const DUMMY_ANGKOT_LIST: AngkotItem[] = [
  {
    id: "angkot-1",
    code: "AL",
    routeName: "Arjosari - Landungsari",
    plateNumber: "N 1234 AB",
    driverName: "Pak Budi",
    distanceKm: 0.4,
    estimatedArrivalMin: 3,
    operatingHours: "05:00 - 21:00",
    isActiveNow: true,
    currentLat: -7.954,
    currentLng: 112.616,
    stops: [DUMMY_STOPS[0], DUMMY_STOPS[2]],
  },
  {
    id: "angkot-2",
    code: "AT",
    routeName: "Arjosari - Tidar",
    plateNumber: "N 5678 CD",
    driverName: "Pak Slamet",
    distanceKm: 0.9,
    estimatedArrivalMin: 7,
    operatingHours: "05:30 - 20:00",
    isActiveNow: true,
    currentLat: -7.958,
    currentLng: 112.612,
    stops: [DUMMY_STOPS[1], DUMMY_STOPS[2]],
  },
  {
    id: "angkot-3",
    code: "GA",
    routeName: "Gadol - Arjosari",
    plateNumber: "N 9101 EF",
    driverName: "Pak Agus",
    distanceKm: 1.5,
    estimatedArrivalMin: 12,
    operatingHours: "06:00 - 19:00",
    isActiveNow: true,
    currentLat: -7.962,
    currentLng: 112.622,
    stops: [DUMMY_STOPS[3]],
  },
  {
    id: "angkot-4",
    code: "LG",
    routeName: "Landungsari - Gadang",
    plateNumber: "N 3344 GH",
    driverName: "Pak Eko",
    distanceKm: 2.8,
    estimatedArrivalMin: 20,
    operatingHours: "05:00 - 18:00",
    isActiveNow: false, // Tidak aktif saat ini
    currentLat: -7.97,
    currentLng: 112.63,
    stops: [],
  },
];

export default function FindAngkotPage() {
  // 1. STATE MANAGEMENT
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [destinationInput, setDestinationInput] = useState<string>("");
  const [selectedDestination, setSelectedDestination] =
    useState<LocationOption | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [selectedAngkot, setSelectedAngkot] = useState<AngkotItem | null>(null);
  const [mapZoomTarget, setMapZoomTarget] = useState<AngkotItem | null>(null);
  const [isTripFinished, setIsTripFinished] = useState<boolean>(false);

  // 2. MENGAKTIFKAN GPS PENGGUNA
  const handleEnableGps = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGpsActive(true);
          setIsLocating(false);
        },
        (error) => {
          console.warn(
            "GPS Error / Denied, menggunakan fallback lokasi Malang:",
            error,
          );
          // Fallback lokasi default (Misal: Seputar UB Malang)
          setUserCoords({ lat: -7.9526, lng: 112.6144 });
          setIsGpsActive(true);
          setIsLocating(false);
        },
      );
    } else {
      setUserCoords({ lat: -7.9526, lng: 112.6144 });
      setIsGpsActive(true);
      setIsLocating(false);
    }
  };

  // 3. AUTOCOMPLETE SUGGESTIONS PENGGUNA
  const filteredSuggestions = useMemo(() => {
    if (!destinationInput.trim()) return [];
    return DUMMY_DESTINATIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(destinationInput.toLowerCase()) ||
        item.address.toLowerCase().includes(destinationInput.toLowerCase()),
    );
  }, [destinationInput]);

  const handleSelectDestination = (item: LocationOption) => {
    setSelectedDestination(item);
    setDestinationInput(item.name);
    setShowSuggestions(false);
    setSelectedAngkot(null); // Reset pilihan angkot sebelumnya
  };

  // 4. FILTER 3 ANGKOT TERDEKAT & AKTIF
  const relevantAngkots = useMemo(() => {
    if (!selectedDestination) return [];

    // Filter hanya angkot yang aktif & berada dalam jam operasional
    return DUMMY_ANGKOT_LIST.filter((a) => a.isActiveNow)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3); // Ambil 3 terdekat
  }, [selectedDestination]);

  // 5. PILIH ANGKOT & ZOOM MAP
  const handleSelectAngkot = (angkot: AngkotItem) => {
    setSelectedAngkot(angkot);
    setMapZoomTarget(angkot);
  };

  // 6. MATIKAN GPS & SELESAI
  const handleFinishTrip = () => {
    setIsGpsActive(false);
    setUserCoords(null);
    setDestinationInput("");
    setSelectedDestination(null);
    setSelectedAngkot(null);
    setMapZoomTarget(null);
    setIsTripFinished(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER NAVBAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-2 rounded-xl">
            <FaBus className="text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">
              Lacak Angkot Real-Time
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Cari & Naik Angkot Malang
            </p>
          </div>
        </div>

        {isGpsActive && (
          <button
            onClick={handleFinishTrip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition border border-rose-200"
          >
            <FaPowerOff className="text-xs" />
            Selesai / Matikan GPS
          </button>
        )}
      </header>

      {/* NOTIFIKASI TRIP SELESAI */}
      {isTripFinished && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 text-sm" /> GPS telah
            dinonaktifkan. Terima kasih telah menggunakan layanan AngkotGo!
          </span>
          <button
            onClick={() => setIsTripFinished(false)}
            className="text-emerald-900 underline font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MODAL AKTIFKAN GPS TERLEBIH DAHULU (Langkah 1) */}
      {!isGpsActive && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <FaCrosshairs className="animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">
                Aktifkan Lokasi GPS Anda
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Untuk menemukan angkot terdekat secara real-time dan memberikan
                estimasi waktu penjemputan yang akurat, mohon izinkan akses
                lokasi Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={handleEnableGps}
              disabled={isLocating}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs tracking-wide shadow-md hover:shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaCrosshairs />
              {isLocating
                ? "Mendeteksi Lokasi..."
                : "Aktifkan GPS & Cari Angkot"}
            </button>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA SETELAH GPS AKTIF (Langkah 2) */}
      {isGpsActive && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 p-0 sm:p-4 max-w-7xl mx-auto w-full">
          {/* PANEL KIRI: INPUT TUJUAN & DAFTAR ANGKOT (4 COLS) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 p-4 sm:p-0 z-20">
            {/* CARD INPUT TUJUAN */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tujuan Akhir Anda
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaSearch className="text-xs" />
                </div>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Ketik lokasi tujuan (contoh: Matos, UB, Stasiun)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* REKOMENDASI AUTOCOMPLETE */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 divide-y divide-slate-100 z-50 overflow-hidden">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectDestination(item)}
                      className="w-full text-left p-3 hover:bg-emerald-50/50 transition flex items-start gap-2.5 cursor-pointer"
                    >
                      <FaMapMarkerAlt className="text-emerald-600 shrink-0 text-xs mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedDestination && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <FaCheckCircle className="text-emerald-600 shrink-0" />
                    Tujuan: <strong>{selectedDestination.name}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDestination(null);
                      setDestinationInput("");
                    }}
                    className="text-emerald-900 font-bold hover:underline shrink-0 text-[11px]"
                  >
                    Ubah
                  </button>
                </div>
              )}
            </div>

            {/* CARD REKOMENDASI 3 ANGKOT TERDEKAT */}
            {selectedDestination && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FaBus className="text-emerald-600" /> Angkot Relevan
                    Terdekat
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Jam Operasional Sesuai
                  </span>
                </div>

                {relevantAngkots.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 space-y-2">
                    <FaExclamationTriangle className="text-amber-500 text-xl mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Tidak ada angkot aktif saat ini
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Coba cari rute atau tujuan lainnya.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {relevantAngkots.map((angkot, index) => {
                      const isSelected = selectedAngkot?.id === angkot.id;
                      return (
                        <div
                          key={angkot.id}
                          onClick={() => handleSelectAngkot(angkot)}
                          className={`bg-white p-4 rounded-2xl border transition shadow-sm cursor-pointer space-y-3 ${
                            isSelected
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                              : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 text-xs font-black bg-emerald-600 text-white rounded-lg">
                                {angkot.code}
                              </span>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900">
                                  {angkot.routeName}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                  {angkot.plateNumber} • {angkot.driverName}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                              #{index + 1} Terdekat
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <FaRoute className="text-emerald-600" />
                              <span>
                                Jarak: <strong>{angkot.distanceKm} km</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaClock className="text-emerald-600" />
                              <span>
                                Tiba ±{" "}
                                <strong>
                                  {angkot.estimatedArrivalMin} menit
                                </strong>
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1">
                              <FaCrosshairs className="animate-spin-slow" />{" "}
                              Peta Zoom ke Angkot Ini
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PANEL KANAN: LIVE TRACKING MAP (7 COLS) */}
          <div className="lg:col-span-7 h-[450px] lg:h-[calc(100vh-100px)] sticky top-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative">
            {/* OVERLAY DUMMY MAP INTERAKTIF */}
            <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-4">
              {/* VIRTUAL MAP CONTAINER */}
              <div className="w-full h-full absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center overflow-hidden">
                {/* LOKASI PENGGUNA (MARKER BIRU) */}
                {userCoords && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="px-2 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                      Lokasi Anda
                    </div>
                    <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full animate-ping absolute" />
                    <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg relative z-10" />
                  </div>
                )}

                {/* HALTE PERSINGGAHAN (MARKER ABU/HIJAU) */}
                {DUMMY_STOPS.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className={`absolute flex flex-col items-center opacity-80 ${
                      idx === 0
                        ? "top-1/3 left-1/3"
                        : idx === 1
                          ? "bottom-1/3 left-1/4"
                          : "top-1/4 right-1/3"
                    }`}
                  >
                    <div className="px-2 py-0.5 bg-slate-800 text-white rounded text-[9px] font-semibold mb-1 whitespace-nowrap">
                      🚏 {stop.name}
                    </div>
                    <div className="w-3 h-3 bg-slate-600 border border-white rounded-full" />
                  </div>
                ))}

                {/* ANGKOT LIVE TRACKING (MARKER HIJAU/ORANGE) */}
                {relevantAngkots.map((angkot) => {
                  const isFocused = mapZoomTarget?.id === angkot.id;
                  return (
                    <div
                      key={angkot.id}
                      onClick={() => handleSelectAngkot(angkot)}
                      className={`absolute transition-all duration-500 cursor-pointer flex flex-col items-center z-20 ${
                        isFocused ? "scale-125 z-30" : "hover:scale-110"
                      } ${
                        angkot.id === "angkot-1"
                          ? "top-1/3 right-1/4"
                          : angkot.id === "angkot-2"
                            ? "bottom-1/4 right-1/3"
                            : "top-1/2 left-1/4"
                      }`}
                    >
                      <div
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap ${
                          isFocused
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-400/30"
                            : "bg-white text-slate-800 border"
                        }`}
                      >
                        <FaBus
                          className={
                            isFocused ? "text-white" : "text-emerald-600"
                          }
                        />
                        <span>
                          Angkot {angkot.code} ({angkot.estimatedArrivalMin}{" "}
                          mnt)
                        </span>
                      </div>
                      <div className="w-3 h-3 bg-emerald-600 border-2 border-white rounded-full shadow-md mt-0.5" />
                    </div>
                  );
                })}
              </div>

              {/* CONTROL OVERLAY MAP */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100 text-left space-y-1.5 z-20">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Legenda Peta
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />{" "}
                  Posisi Anda (GPS)
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />{" "}
                  Angkot Beroperasi
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />{" "}
                  Halte / Persinggahan
                </div>
              </div>

              {/* BANNER STATUS ZOOM */}
              {mapZoomTarget && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl z-20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xs">
                      {mapZoomTarget.code}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">
                        Fokus Peta: Angkot {mapZoomTarget.routeName}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Estimasi Tiba: {mapZoomTarget.estimatedArrivalMin} Menit
                        lagi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMapZoomTarget(null)}
                    className="text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition font-semibold"
                  >
                    Reset Zoom
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
