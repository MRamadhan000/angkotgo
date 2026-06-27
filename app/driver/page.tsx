"use client";

import { useState } from "react";

// --- Toggle Switch ---
const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex w-14 h-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      enabled ? "bg-green-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
        enabled ? "translate-x-8" : "translate-x-1"
      }`}
    />
  </button>
);

// --- Map SVG Placeholder ---
const MapPlaceholder = () => (
  <div className="relative w-full h-[360px] rounded-2xl overflow-hidden bg-[#e8f0e8]">
    {/* Background map-like SVG */}
    <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg">
      {/* Base map background */}
      <rect width="760" height="360" fill="#e8efe8" />

      {/* Grid roads (light) */}
      <g stroke="#d5e3d5" strokeWidth="1" fill="none">
        <line x1="0" y1="60" x2="760" y2="60" />
        <line x1="0" y1="120" x2="760" y2="120" />
        <line x1="0" y1="180" x2="760" y2="180" />
        <line x1="0" y1="240" x2="760" y2="240" />
        <line x1="0" y1="300" x2="760" y2="300" />
        <line x1="100" y1="0" x2="100" y2="360" />
        <line x1="200" y1="0" x2="200" y2="360" />
        <line x1="300" y1="0" x2="300" y2="360" />
        <line x1="400" y1="0" x2="400" y2="360" />
        <line x1="500" y1="0" x2="500" y2="360" />
        <line x1="600" y1="0" x2="600" y2="360" />
        <line x1="700" y1="0" x2="700" y2="360" />
      </g>

      {/* Green areas (parks) */}
      <rect x="580" y="20" width="120" height="80" rx="8" fill="#c8dfc8" opacity="0.7" />
      <rect x="120" y="210" width="90" height="60" rx="8" fill="#c8dfc8" opacity="0.7" />
      <rect x="420" y="270" width="80" height="70" rx="8" fill="#c8dfc8" opacity="0.7" />
      <rect x="650" y="240" width="90" height="110" rx="8" fill="#c8dfc8" opacity="0.7" />

      {/* River (light blue winding) */}
      <path d="M 0 310 Q 80 290 160 305 Q 250 320 330 300 Q 420 280 500 295 Q 600 315 700 300 L 760 305"
        fill="none" stroke="#aed4e8" strokeWidth="18" strokeLinecap="round" />

      {/* Main roads */}
      <g stroke="#ffffff" strokeWidth="10" fill="none" strokeLinecap="round">
        {/* Jl. Ijen diagonal */}
        <line x1="320" y1="195" x2="550" y2="90" />
        {/* Horizontal main */}
        <line x1="0" y1="150" x2="760" y2="150" />
        {/* Vertical main */}
        <line x1="380" y1="0" x2="380" y2="360" />
      </g>

      {/* Route path (blue) */}
      <path
        d="M 210 330 Q 240 295 290 260 Q 330 230 380 210 Q 430 190 490 155 Q 560 110 640 85"
        fill="none"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      />

      {/* Road labels */}
      <text x="415" y="185" fontSize="11" fill="#6b7280" fontFamily="sans-serif" transform="rotate(-35 415 185)">Jl. Ijen</text>

      {/* Terminal Landungsari pin (bottom) */}
      <g transform="translate(205, 322)">
        <circle cx="0" cy="0" r="14" fill="#2563eb" />
        <text x="0" y="4" textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif">🚌</text>
      </g>
      <rect x="222" y="310" width="100" height="28" rx="6" fill="white" opacity="0.9" />
      <text x="272" y="328" textAnchor="middle" fontSize="10" fill="#374151" fontFamily="sans-serif" fontWeight="bold">Terminal</text>
      <text x="272" y="340" textAnchor="middle" fontSize="10" fill="#374151" fontFamily="sans-serif">Landungsari</text>

      {/* Bus icon on route (middle) */}
      <g transform="translate(380, 210)">
        <rect x="-18" y="-13" width="36" height="26" rx="6" fill="white" stroke="#2563eb" strokeWidth="2" />
        <text x="0" y="4" textAnchor="middle" fontSize="14" fontFamily="sans-serif">🚐</text>
      </g>

      {/* Terminal Arjosari pin (right) */}
      <g transform="translate(645, 82)">
        <circle cx="0" cy="0" r="14" fill="#2563eb" />
        <text x="0" y="4" textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif">🚌</text>
      </g>
      <rect x="660" y="70" width="90" height="28" rx="6" fill="white" opacity="0.9" />
      <text x="705" y="88" textAnchor="middle" fontSize="10" fill="#374151" fontFamily="sans-serif" fontWeight="bold">Terminal</text>
      <text x="705" y="100" textAnchor="middle" fontSize="10" fill="#374151" fontFamily="sans-serif">Arjosari</text>

      {/* Alun-Alun label */}
      <g transform="translate(390, 40)">
        <circle cx="0" cy="0" r="12" fill="#16a34a" />
        <text x="0" y="4" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">📍</text>
      </g>
      <text x="415" y="35" fontSize="10" fill="#374151" fontFamily="sans-serif" fontWeight="600">Alun-Alun</text>
      <text x="415" y="48" fontSize="10" fill="#374151" fontFamily="sans-serif">Kota Malang</text>

      {/* Kayutangan label */}
      <text x="460" y="130" fontSize="10" fill="#7c3aed" fontFamily="sans-serif">Kayutangan</text>
      <text x="465" y="143" fontSize="10" fill="#7c3aed" fontFamily="sans-serif">Heritage</text>
      <text x="455" y="128" fontSize="12" fontFamily="sans-serif">🏛</text>

      {/* Brawijaya University label */}
      <text x="115" y="248" fontSize="10" fill="#374151" fontFamily="sans-serif" fontWeight="500">Brawijaya</text>
      <text x="115" y="261" fontSize="10" fill="#374151" fontFamily="sans-serif">University</text>
    </svg>

    {/* Overlay: Current Location Card */}
    <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-md px-4 py-3 min-w-[170px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
        <span className="text-sm font-semibold text-gray-800">Lokasi Saat Ini</span>
      </div>
      <p className="text-sm font-bold text-gray-900">Jl. Ijen No. 45</p>
      <p className="text-xs text-gray-500">Kota Malang</p>
      <div className="mt-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">Kecepatan</p>
          <p className="text-sm font-bold text-gray-800">28 km/jam</p>
        </div>
      </div>
    </div>

    {/* Map Controls (right) */}
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      {[
        <svg key="loc" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>,
        <svg key="plus" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>,
        <svg key="minus" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>,
      ].map((icon, i) => (
        <button
          key={i}
          className="w-9 h-9 bg-white shadow rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {icon}
        </button>
      ))}
    </div>
  </div>
);

// --- Main Page ---
export default function DashboardPage() {
  const [angkotOn, setAngkotOn] = useState(true);
  const [penumpangOn, setPenumpangOn] = useState(true);

  return (
    <div className="bg-white p-4 sm:p-6 space-y-5">

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Angkot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-4">Status Angkot</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 17H5a2 2 0 01-2-2V6a2 2 0 012-2h13a2 2 0 012 2v3M9 17h6M9 17v2m6-2v2M3 11h18" />
                  </svg>
                </div>
                <div>
                  <p className={`text-base font-bold ${angkotOn ? "text-green-500" : "text-gray-400"}`}>
                    {angkotOn ? "Beroperasi" : "Tidak Aktif"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {angkotOn ? "Angkot sedang beroperasi" : "Angkot tidak beroperasi"}
                  </p>
                </div>
              </div>
              <Toggle enabled={angkotOn} onChange={() => setAngkotOn(!angkotOn)} />
            </div>
          </div>
          <div className={`rounded-xl px-4 py-3 flex items-center gap-2 mt-2 ${angkotOn ? "bg-green-50" : "bg-gray-50"}`}>
            <svg className={`w-4 h-4 flex-shrink-0 ${angkotOn ? "text-green-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {angkotOn ? "Angkot Anda sedang beroperasi" : "Angkot Anda tidak aktif"}
              </p>
              <p className="text-[11px] text-gray-400">Terakhir aktif: 07:30 WIB</p>
            </div>
          </div>
        </div>

        {/* Status Penumpang */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-4">Status Penumpang</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-base font-bold ${penumpangOn ? "text-green-500" : "text-gray-400"}`}>
                    {penumpangOn ? "Available" : "Tidak Tersedia"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {penumpangOn ? "Siap menerima penumpang" : "Tidak menerima penumpang"}
                  </p>
                </div>
              </div>
              <Toggle enabled={penumpangOn} onChange={() => setPenumpangOn(!penumpangOn)} />
            </div>
          </div>
          <div className={`rounded-xl px-4 py-3 flex items-center gap-2 mt-2 ${penumpangOn ? "bg-green-50" : "bg-gray-50"}`}>
            <svg className={`w-4 h-4 flex-shrink-0 ${penumpangOn ? "text-green-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {penumpangOn ? "Penumpang dapat naik" : "Penumpang tidak dapat naik"}
              </p>
              <p className="text-[11px] text-gray-400">
                Status penumpang: {penumpangOn ? "Available" : "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Info Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-gray-100">
          <div className="md:pr-6">
            <p className="text-xs text-gray-400 mb-1">Kode Trayek</p>
            <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">AL</span>
          </div>
          <div className="pl-2 md:px-6">
            <p className="text-xs text-gray-400 mb-1">Rute</p>
            <p className="text-sm font-semibold text-gray-800">Arjosari – Landungsari</p>
          </div>
          <div className="md:px-6">
            <p className="text-xs text-gray-400 mb-1">Plat Nomor</p>
            <p className="text-sm font-semibold text-gray-800">N 1234 AB</p>
          </div>
          <div className="pl-2 md:pl-6">
            <p className="text-xs text-gray-400 mb-1">Angkot</p>
            <p className="text-sm font-semibold text-gray-800">AL – 23</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapPlaceholder />

      {/* Stats Row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x divide-gray-100">
          {/* Durasi */}
          <div className="sm:pr-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Durasi Perjalanan</p>
              <p className="text-lg font-bold text-gray-900">35 menit</p>
            </div>
          </div>

          {/* Jarak */}
          <div className="sm:px-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Jarak Tempuh</p>
              <p className="text-lg font-bold text-gray-900">12.6 km</p>
            </div>
          </div>

          {/* Penumpang */}
          <div className="sm:pl-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Penumpang Hari Ini</p>
              <p className="text-lg font-bold text-gray-900">32 orang</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer notice */}
      <div className="flex items-center gap-2 py-1 px-1">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400">
          Pastikan status angkot dan penumpang selalu diperbarui untuk kenyamanan bersama.
        </p>
      </div>
    </div>
  );
}