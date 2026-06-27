"use client";

import { useState, useRef } from "react";

// --- Reusable Input ---
const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  rows?: number;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    {textarea ? (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

// --- Photo Upload Box ---
const PhotoBox = ({
  src,
  label = "Format JPG, PNG. Maks 2MB",
  round = false,
}: {
  src?: string;
  label?: string;
  round?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(src);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${
          round ? "w-24 h-24 rounded-full" : "w-full h-36 rounded-xl"
        }`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        )}
        {round && (
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400 text-center">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {!round && (
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ubah Foto
        </button>
      )}
    </div>
  );
};

// --- Save Button ---
const SaveButton = () => (
  <div className="flex justify-end pt-2">
    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200 w-full sm:w-auto justify-center">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
      Simpan Perubahan
    </button>
  </div>
);

// --- Section Wrapper ---
const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="mb-5">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// --- Main Page ---
export default function ProfilPage() {
  // Edit Profil state
  const [nama, setNama] = useState("Agus Setiawan");
  const [email, setEmail] = useState("agus.setiawan@email.com");
  const [telepon, setTelepon] = useState("0812-3456-7890");
  const [alamat, setAlamat] = useState(
    "Jl. Cengger Ayam I No. 45, Arjosari,\nKec. Blimbing, Kota Malang, Jawa Timur"
  );

  // Edit Angkot state
  const [platNomor] = useState("N 1234 AB");
  const [warnaAngkot, setWarnaAngkot] = useState("Biru");
  const [kodeTrayek, setKodeTrayek] = useState("AL");
  const [jalurTrayek] = useState("Arjosari – Landungsari");
  const [nomorAngkot] = useState("AL001");

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">

      {/* ---- EDIT PROFIL ---- */}
      <Section title="Edit Profil">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left: Photo */}
          <div className="w-full md:w-36 flex-shrink-0 flex flex-col items-center md:items-start">
            <p className="text-xs font-medium text-gray-500 mb-3 self-start md:self-auto">Foto Profil</p>
            <PhotoBox round label="Format JPG, PNG. Maks 2MB" />
            {/* Ubah Foto link below avatar */}
            <button className="mt-2 mx-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubah Foto
            </button>
          </div>

          {/* Right: Fields */}
          <div className="flex-1 grid grid-cols-1 gap-4 w-full">
            <InputField label="Nama Lengkap" value={nama} onChange={setNama} />
            <InputField label="Email" value={email} onChange={setEmail} type="email" />
            <InputField label="Nomor Telepon" value={telepon} onChange={setTelepon} type="tel" />
            <InputField label="Alamat" value={alamat} onChange={setAlamat} textarea rows={3} />
          </div>
        </div>

        <div className="mt-5 border-t border-gray-50 pt-4">
          <SaveButton />
        </div>
      </Section>

      {/* ---- EDIT ANGKOT ---- */}
      <Section title="Edit Angkot" subtitle="Informasi angkot yang Anda operasikan">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left: Angkot Photo */}
          <div className="w-full md:w-44 flex-shrink-0 flex flex-col items-center md:items-start">
            <p className="text-xs font-medium text-gray-500 mb-3 self-start md:self-auto">Foto Angkot</p>
            {/* Photo with bus illustration */}
            <div className="w-full h-32 rounded-xl bg-blue-50 overflow-hidden flex items-center justify-center border border-blue-100">
              <svg viewBox="0 0 200 100" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
                {/* Simple angkot illustration */}
                <rect x="10" y="30" width="180" height="55" rx="10" fill="#2563eb" />
                <rect x="20" y="20" width="140" height="35" rx="8" fill="#1d4ed8" />
                {/* windows */}
                <rect x="28" y="26" width="25" height="20" rx="4" fill="#bfdbfe" />
                <rect x="60" y="26" width="25" height="20" rx="4" fill="#bfdbfe" />
                <rect x="92" y="26" width="25" height="20" rx="4" fill="#bfdbfe" />
                <rect x="124" y="26" width="25" height="20" rx="4" fill="#bfdbfe" />
                {/* body stripes */}
                <rect x="10" y="58" width="180" height="5" fill="#1d4ed8" opacity="0.4" />
                {/* wheels */}
                <circle cx="45" cy="87" r="12" fill="#1e293b" />
                <circle cx="45" cy="87" r="5" fill="#94a3b8" />
                <circle cx="155" cy="87" r="12" fill="#1e293b" />
                <circle cx="155" cy="87" r="5" fill="#94a3b8" />
                {/* headlights */}
                <rect x="175" y="42" width="12" height="8" rx="3" fill="#fde68a" />
                <rect x="13" y="42" width="10" height="8" rx="3" fill="#fde68a" />
                {/* text */}
                <text x="100" y="72" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="sans-serif">AL-23</text>
              </svg>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2">Format JPG, PNG. Maks 2MB</p>
            <button className="mt-2 mx-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubah Foto
            </button>
          </div>

          {/* Right: Angkot Fields */}
          <div className="flex-1 space-y-4 w-full">
            {/* Plat Nomor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">Plat Nomor</label>
              <input
                type="text"
                value={platNomor}
                readOnly
                className="w-full px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Warna Angkot + Kode Trayek */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Warna Angkot</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600" />
                  <select
                    value={warnaAngkot}
                    onChange={(e) => setWarnaAngkot(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Biru</option>
                    <option>Kuning</option>
                    <option>Hijau</option>
                    <option>Merah</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-500">Kode Trayek</label>
                <div className="relative">
                  <select
                    value={kodeTrayek}
                    onChange={(e) => setKodeTrayek(e.target.value)}
                    className="w-full px-3 pr-8 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>AL</option>
                    <option>AG</option>
                    <option>ADL</option>
                    <option>GA</option>
                    <option>MM</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Jalur Trayek */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">Jalur Trayek</label>
              <input
                type="text"
                value={jalurTrayek}
                readOnly
                className="w-full px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Nomor Angkot */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">Nomor Angkot</label>
              <input
                type="text"
                value={nomorAngkot}
                readOnly
                className="w-full px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="mt-5 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-600">
            Pastikan informasi angkot sudah benar. Data ini akan ditampilkan ke penumpang.
          </p>
        </div>

        <div className="mt-4 border-t border-gray-50 pt-4">
          <SaveButton />
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center py-3">
        <p className="text-[11px] text-gray-400">© 2026 AngkotGo Driver App. All rights reserved.</p>
      </div>
    </div>
  );
}