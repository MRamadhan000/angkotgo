
"use client";

import { useState } from "react";

export default function Home() {
  // Dummy GPS User A
  const [userA, setUserA] = useState({
    lat: -7.9666,
    lng: 112.6326,
  });

  // Dummy GPS User B
  const [userB, setUserB] = useState({
    lat: -7.96665,
    lng: 112.63265,
  });

  // Radius deteksi dalam meter
  const [radius, setRadius] = useState(10);

  // Menghitung jarak menggunakan Haversine
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371000;

    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const distance = calculateDistance(
    userA.lat,
    userA.lng,
    userB.lat,
    userB.lng
  );

  const isNearby = distance <= radius;

  function updateUser(
    user: "A" | "B",
    field: "lat" | "lng",
    value: string
  ) {
    const number = Number(value);

    if (!Number.isFinite(number)) return;

    if (user === "A") {
      setUserA((prev) => ({ ...prev, [field]: number }));
    } else {
      setUserB((prev) => ({ ...prev, [field]: number }));
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            GPS Nearby Detector
          </h1>
          <p className="text-slate-400 mt-2">
            Simulasi deteksi user berdasarkan jarak GPS.
          </p>
        </div>

        {/* USER A */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-4">
            📍 User A (Posisi Kamu)
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={userA.lat}
                onChange={(e) =>
                  updateUser("A", "lat", e.target.value)
                }
                className="w-full mt-2 p-3 rounded-lg bg-slate-800 border border-slate-600"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={userA.lng}
                onChange={(e) =>
                  updateUser("A", "lng", e.target.value)
                }
                className="w-full mt-2 p-3 rounded-lg bg-slate-800 border border-slate-600"
              />
            </div>
          </div>
        </div>

        {/* USER B */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-4">
            📍 User B (User Lain)
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={userB.lat}
                onChange={(e) =>
                  updateUser("B", "lat", e.target.value)
                }
                className="w-full mt-2 p-3 rounded-lg bg-slate-800 border border-slate-600"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={userB.lng}
                onChange={(e) =>
                  updateUser("B", "lng", e.target.value)
                }
                className="w-full mt-2 p-3 rounded-lg bg-slate-800 border border-slate-600"
              />
            </div>
          </div>
        </div>

        {/* RADIUS */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <label className="font-bold">
            Radius Deteksi (Meter)
          </label>

          <input
            type="number"
            min="1"
            value={radius}
            onChange={(e) =>
              setRadius(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-full mt-3 p-3 rounded-lg bg-slate-800 border border-slate-600"
          />
        </div>

        {/* RESULT */}
        <div className={`rounded-xl p-6 border ${
          isNearby
            ? "bg-green-950 border-green-500"
            : "bg-red-950 border-red-500"
        }`}>
          <p className="text-sm text-slate-300">
            Jarak antara User A dan User B
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {distance < 1000
              ? `${distance.toFixed(2)} meter`
              : `${(distance / 1000).toFixed(3)} km`}
          </h2>

          {isNearby ? (
            <div className="mt-5">
              <h3 className="text-2xl font-bold text-green-400">
                🎉 Hey! Ada user dekat kamu!
              </h3>
              <p className="text-green-200 mt-2">
                User B berada dalam radius {radius} meter.
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <h3 className="text-xl font-bold text-red-400">
                User masih jauh
              </h3>
              <p className="text-red-200 mt-2">
                User B berada di luar radius deteksi.
              </p>
            </div>
          )}
        </div>

        {/* RESET */}
        <button
          onClick={() => {
            setUserA({ lat: -7.9666, lng: 112.6326 });
            setUserB({ lat: -7.96665, lng: 112.63265 });
            setRadius(10);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
        >
          Reset Dummy GPS
        </button>

      </div>
    </main>
  );
}
