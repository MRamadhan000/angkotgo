"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

export default function DriverMap() {
  useEffect(() => {
    initializeLeaflet();
  }, []);

  return (
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
        {angkotIcon && (
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
        )}
      </MapContainer>
    </div>
  );
}
