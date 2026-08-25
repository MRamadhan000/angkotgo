"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import { FaArrowLeft, FaExchangeAlt, FaMapMarkedAlt, FaCrosshairs, FaCode } from "react-icons/fa";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function SearchHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-5 shadow-md sm:rounded-3xl sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"></div>

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link
            href="/conductor/dashboard"
            className="flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-800/80 p-3 sm:p-4 text-white border border-blue-700/60 shadow-inner transition-all hover:bg-blue-800"
            title="Kembali ke Dashboard"
          >
            <FaArrowLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </Link>

          <div className="min-w-0 space-y-1 sm:space-y-2">
            <div>
              <p className="text-[11px] sm:text-sm font-medium text-blue-200">
                NestJS API Tester (Geospasial)
              </p>
              <h1 className="mt-0.5 text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-white truncate leading-snug">
                Pencarian Rute Berdasarkan Koordinat
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveMapSearchPage() {
  const [pickingMode, setPickingMode] = useState<"origin" | "destination">("origin");

  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originName, setOriginName] = useState<string>("Mendeteksi lokasi GPS Anda...");

  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Inisialisasi Peta & Otomatis Ambil GPS Pengguna Saat Load Pertama
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultLng = 112.6214;
    const defaultLat = -7.9839;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [defaultLng, defaultLat],
      zoom: 14,
    });

    mapRef.current = map;

    const marker = new mapboxgl.Marker({ color: "#2563eb", draggable: false })
      .setLngLat([defaultLng, defaultLat])
      .addTo(map);
    markerRef.current = marker;

    map.on("move", () => {
      const center = map.getCenter();
      if (markerRef.current) {
        markerRef.current.setLngLat([center.lng, center.lat]);
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;

          map.flyTo({ center: [userLng, userLat], zoom: 15 });
          setOriginCoords({ lat: userLat, lng: userLng });

          try {
            const res = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLng},${userLat}.json?access_token=${mapboxgl.accessToken}&country=id&language=id&limit=1`
            );
            const data = await res.json();
            const placeName = data.features && data.features.length > 0 
              ? data.features[0].place_name 
              : `Lokasi GPS Anda (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
            
            setOriginName(placeName);
          } catch (err) {
            setOriginName(`Lokasi GPS Anda (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
          }
        },
        (error) => {
          console.error("Gagal mendapatkan GPS:", error);
          setOriginName("Gagal mendeteksi GPS (Gunakan titik tengah peta)");
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      map.remove();
    };
  }, []);

  const handleResetToGPS = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLng = position.coords.longitude;
      const userLat = position.coords.latitude;

      mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 15 });
      setOriginCoords({ lat: userLat, lng: userLng });
      setOriginName(`Lokasi GPS Saat Ini (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
      setPickingMode("origin");
      if (markerRef.current) {
        markerRef.current.getElement().style.filter = "none";
      }
    });
  };

  const handleConfirmLocation = async () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=id&language=id&limit=1`
      );
      const data = await res.json();
      const placeName = data.features && data.features.length > 0 
        ? data.features[0].place_name 
        : `Titik Peta (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      if (pickingMode === "origin") {
        setOriginCoords({ lat, lng });
        setOriginName(placeName);
        setPickingMode("destination");
        if (markerRef.current) {
          markerRef.current.getElement().style.filter = "hue-rotate(120deg)";
        }
      } else {
        setDestinationCoords({ lat, lng });
        setDestinationName(placeName);
      }
    } catch (err) {
      console.error("Gagal mengambil nama lokasi:", err);
    }
  };

  const handleSwap = () => {
    const tempCoords = originCoords;
    const tempName = originName;

    setOriginCoords(destinationCoords);
    setOriginName(destinationName);

    setDestinationCoords(tempCoords);
    setDestinationName(tempName);
  };

  // Fungsi Fetch ke Controller NestJS Anda
  const handleFetchRouteApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCoords || !destinationCoords) {
      alert("Mohon tentukan Titik Asal dan Titik Tujuan lewat peta terlebih dahulu!");
      return;
    }

    setLoading(true);
    setApiResponse(null);

    try {
      const backendUrl = `http://localhost:3001/routes/search?userLat=${originCoords.lat}&userLng=${originCoords.lng}&destLat=${destinationCoords.lat}&destLng=${destinationCoords.lng}`;

      const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      console.error("Gagal terhubung ke NestJS API:", err);
      setApiResponse({
        error: "Gagal terhubung ke server Backend NestJS",
        details: err.message || "Pastikan backend NestJS sudah menyala di port 3000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">
        <SearchHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Panel Form Info */}
          <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Status: {pickingMode === "origin" ? "📍 Pilih Asal (GPS)" : "🎯 Pilih Tujuan"}
                </span>
                <button
                  type="button"
                  onClick={() => setPickingMode(pickingMode === "origin" ? "destination" : "origin")}
                  className="text-[11px] text-gray-500 underline hover:text-blue-600"
                >
                  Ubah Mode
                </button>
              </div>

              {/* Info Titik Asal */}
              <div className={`p-3 rounded-xl border transition-all ${pickingMode === "origin" ? "border-blue-500 bg-blue-50/40 shadow-xs" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">Halte Awal (userLat, userLng)</span>
                  {originCoords && <FiCheckCircle className="text-emerald-600 h-4 w-4" />}
                </div>
                <p className="text-xs font-medium text-gray-800 truncate mt-1">
                  {originName}
                </p>
                {originCoords && (
                  <p className="text-[10px] font-mono text-gray-400 mt-1">
                    {originCoords.lat.toFixed(5)}, {originCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Tombol Tukar & GPS Reset */}
              <div className="flex items-center justify-center gap-2 -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-600 shadow-xs hover:bg-gray-50"
                  title="Tukar Posisi"
                >
                  <FaExchangeAlt className="h-3 w-3 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={handleResetToGPS}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100"
                  title="Gunakan GPS Saya Lagi"
                >
                  <FaCrosshairs className="h-3 w-3" />
                  <span>Reset GPS</span>
                </button>
              </div>

              {/* Info Titik Tujuan */}
              <div className={`p-3 rounded-xl border transition-all ${pickingMode === "destination" ? "border-rose-500 bg-rose-50/40 shadow-xs" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">Halte Tujuan (destLat, destLng)</span>
                  {destinationCoords && <FiCheckCircle className="text-emerald-600 h-4 w-4" />}
                </div>
                <p className="text-xs font-medium text-gray-800 truncate mt-1">
                  {destinationName || "Belum dipilih (geser peta)"}
                </p>
                {destinationCoords && (
                  <p className="text-[10px] font-mono text-gray-400 mt-1">
                    {destinationCoords.lat.toFixed(5)}, {destinationCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleFetchRouteApi} className="pt-2">
              <button
                type="submit"
                disabled={loading || !originCoords || !destinationCoords}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memanggil API NestJS...</span>
                  </>
                ) : (
                  <>
                    <FaCode className="h-4 w-4" />
                    <span>Request /search (JSON)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Area Peta Interaktif Mapbox */}
          <div className="md:col-span-2 relative rounded-2xl border border-gray-100 bg-white p-2 shadow-sm h-[400px] sm:h-[450px] flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs font-medium text-gray-700">
              💡 Geser peta untuk menentukan titik, lalu klik tombol di bawah.
            </div>

            <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden relative" />

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border border-slate-700"
              >
                <FaMapMarkedAlt className="text-blue-400 h-4 w-4" />
                <span>Tetapkan Titik {pickingMode === "origin" ? "Asal (GPS)" : "Tujuan"} Ini</span>
              </button>
            </div>
          </div>
        </div>

        {/* AREA TAMPILAN RESPONS JSON MENTAH DARI NESTJS */}
        {apiResponse !== null && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                <FaCode className="text-blue-600" />
                <span>Hasil Respons JSON dari Backend NestJS</span>
              </h3>
              <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Status: Berhasil Dimuat
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 shadow-lg overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}