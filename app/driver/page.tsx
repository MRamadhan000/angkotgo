"use client";

import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


import Link from "next/link";
import {
  Bus,
  Users,
  Power,
  Menu,
  TrendingUp,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// ================= INITIALIZE LEAFLET ICON IN CLIENT ONLY =================
let L: any;
let angkotIcon: any;

const initializeLeaflet = () => {
  if (typeof window !== "undefined" && !L) {
    L = require("leaflet");
    
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    angkotIcon = new L.DivIcon({
      html: `
        <div style="
          width:70px;
          height:70px;
          border-radius:24px;
          background:linear-gradient(135deg, #2563EB 0%, #1e40af 100%);
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 20px 40px rgba(37,99,235,0.45);
          border:4px solid white;
          color:white;
          font-size:34px;
          animation: pulse 2s infinite;
        ">
          🚌
        </div>
      `,
      className: "",
      iconSize: [70, 70],
    });
  }
};

// Initialize on load
if (typeof window !== "undefined") {
  initializeLeaflet();
}

// ================= ROUTE =================
const routePath = [
  [-7.955, 112.612],
  [-7.954, 112.615],
  [-7.952, 112.618],
  [-7.95, 112.621],
  [-7.948, 112.625],
];

// ================= PASSENGER POINTS =================
const passengerPoints = [
  [-7.9545, 112.6135],
  [-7.9532, 112.6162],
  [-7.9515, 112.6195],
  [-7.9495, 112.623],
];

const angkotPosition: [number, number] = [-7.9515, 112.619];

export default function DriverAvailabilityPage() {
  const [isActive, setIsActive] = useState(true);

  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    initializeLeaflet();
  }, []);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F5F9FF] text-slate-900`}
    >
      {/* ================= NAVBAR ================= */}
    <nav className="w-full h-[85px] border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Bus size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-blue-700">
                AngkotTrack
              </h1>

              <p className="text-sm text-slate-500">
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/driver" className="text-slate-600 hover:text-blue-600 transition">
              Dashboard
            </Link>

            <Link href="/driver/profile" className="text-slate-600 hover:text-blue-600 transition">
              Profile
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 rounded-2xl px-3 py-2">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="profile"
                className="w-10 h-10 rounded-xl object-cover"
              />

              <div>
                <h4 className="font-semibold text-sm">
                  Budi Santoso
                </h4>

                <p className="text-xs text-slate-500">
                  Driver AG
                </p>
              </div>
            </div>

            <button className="md:hidden">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div>
          <h2 className="text-4xl font-bold">
            Dashboard Ketersediaan
          </h2>

          <p className="text-slate-500 mt-2 text-lg">
            Kelola status angkot dan pantau penumpang secara real-time
          </p>
        </div>

        {/* ================= TOP SECTION ================= */}
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          
          {/* STATUS ANGKOT */}
          <div className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
            
            <div className="flex items-center justify-between">
              
              <div>
                <h3 className="text-2xl font-bold">
                  Status Angkot
                </h3>

                <p className="text-slate-500 mt-1">
                  Aktifkan atau nonaktifkan angkot
                </p>
              </div>

              <div
                className={`
                  p-4 rounded-2xl
                  ${
                    isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }
                `}
              >
                <Power size={28} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between bg-slate-50 rounded-[28px] p-6">
              
              <div>
                <p className="text-slate-500">
                  Kondisi Saat Ini
                </p>

                <h4
                  className={`
                    text-3xl font-bold mt-2
                    ${
                      isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {isActive ? "Aktif" : "Nonaktif"}
                </h4>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setIsActive(!isActive)}
                className={`
                  relative w-[90px] h-[48px]
                  rounded-full transition
                  ${
                    isActive
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                `}
              >
                <div
                  className={`
                    absolute top-[5px]
                    w-[38px] h-[38px]
                    bg-white rounded-full
                    shadow-lg transition
                    ${
                      isActive
                        ? "left-[47px]"
                        : "left-[5px]"
                    }
                  `}
                />
              </button>
            </div>
          </div>

          {/* STATUS KAPASITAS */}
          <div className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
            
            <div className="flex items-center justify-between">
              
              <div>
                <h3 className="text-2xl font-bold">
                  Status Kapasitas
                </h3>

                <p className="text-slate-500 mt-1">
                  Update ketersediaan kursi
                </p>
              </div>

              <div
                className={`
                  p-4 rounded-2xl
                  ${
                    isFull
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }
                `}
              >
                <Users size={28} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between bg-slate-50 rounded-[28px] p-6">
              
              <div>
                <p className="text-slate-500">
                  Kapasitas Saat Ini
                </p>

                <h4
                  className={`
                    text-3xl font-bold mt-2
                    ${
                      isFull
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  `}
                >
                  {isFull
                    ? "Penuh"
                    : "Masih Tersedia"}
                </h4>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setIsFull(!isFull)}
                className={`
                  relative w-[90px] h-[48px]
                  rounded-full transition
                  ${
                    isFull
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }
                `}
              >
                <div
                  className={`
                    absolute top-[5px]
                    w-[38px] h-[38px]
                    bg-white rounded-full
                    shadow-lg transition
                    ${
                      isFull
                        ? "left-[47px]"
                        : "left-[5px]"
                    }
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ================= MAP SECTION ================= */}
        <div className="mt-10 bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            <div>
              <h3 className="text-3xl font-bold">
                Heatmap Penumpang
              </h3>

              <p className="text-slate-500 mt-2 text-lg">
                Lokasi penumpang dan jalur perjalanan angkot secara real-time
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
              <TrendingUp size={28} />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-md"></div>
              <span className="text-slate-700">Penumpang Menunggu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-slate-700">Rute Angkot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🚌</span>
              <span className="text-slate-700">Posisi Angkot</span>
            </div>
          </div>

          {/* MAP */}
          <div className="mt-8 rounded-[36px] overflow-hidden border-2 border-blue-100 shadow-lg shadow-blue-100">
            <style>{`
              @keyframes pulse {
                0%, 100% {
                  box-shadow: 0 20px 40px rgba(37,99,235,0.45);
                }
                50% {
                  box-shadow: 0 20px 60px rgba(37,99,235,0.65);
                }
              }
              
              .heatmap-container {
                position: relative;
                overflow: hidden;
              }
              
              .leaflet-popup-content {
                font-family: ${poppins.style.fontFamily};
                border-radius: 12px;
              }
            `}</style>
            <MapContainer
              center={[-7.9536, 112.614]}
              zoom={14}
              scrollWheelZoom={true}
              className="h-[700px] w-full z-0"
            >
              {/* Tile */}
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route */}
              <Polyline
                positions={routePath as [number, number][]}
                pathOptions={{
                  color: "#1e40af",
                  weight: 6,
                  dashArray: "10 8",
                  lineCap: "round",
                  lineJoin: "round",
                  opacity: 0.9,
                }}
              />

              {/* Passenger Dots - Heatmap Style */}
              {passengerPoints.map((point, index) => (
                <CircleMarker
                  key={index}
                  center={point as [number, number]}
                  radius={14}
                  pathOptions={{
                    color: "#0ea5e9",
                    fillColor: "#06b6d4",
                    fillOpacity: 0.85,
                    weight: 2,
                    opacity: 1,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-blue-700 mb-1">
                        🚶 Calon Penumpang
                      </h3>
                      <p className="text-sm text-slate-600">
                        Menunggu di titik ini
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        ID: #{index + 1}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Angkot */}
              <Marker
                position={angkotPosition}
                icon={angkotIcon}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-blue-700 mb-1">
                      🚌 Angkot Jalur AG
                    </h3>
                    <p className="text-green-600 font-semibold mb-1">Status: Aktif</p>
                    <p className="text-sm text-slate-600">
                      Penumpang: 8 / 12
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </section>
    </main>
  );
}