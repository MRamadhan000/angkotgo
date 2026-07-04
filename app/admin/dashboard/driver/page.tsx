"use client";

import { useState } from "react";

// --- Types ---
type DriverStatus = "Terverifikasi" | "Pending" | "Diberhentikan";

interface Driver {
  id: number;
  name: string;
  phone: string;
  platNomor: string;
  kodeTrayek: string;
  trayekColor: string;
  status: DriverStatus;
  bergabung: string;
  avatar: string;
}

// --- Mock Data ---
const drivers: Driver[] = [
  { id: 1, name: "Agus Setiawan", phone: "0812-3456-7890", platNomor: "N 1234 AB", kodeTrayek: "AL", trayekColor: "blue", status: "Terverifikasi", bergabung: "12 Mei 2024", avatar: "AS" },
  { id: 2, name: "Budi Santoso", phone: "0821-4567-8901", platNomor: "N 2345 BC", kodeTrayek: "AG", trayekColor: "green", status: "Terverifikasi", bergabung: "10 Mei 2024", avatar: "BS" },
  { id: 3, name: "Cahyo Nugroho", phone: "0831-5678-9012", platNomor: "N 3456 CD", kodeTrayek: "ADL", trayekColor: "purple", status: "Pending", bergabung: "20 Mei 2024", avatar: "CN" },
  { id: 4, name: "Dedi Kurniawan", phone: "0852-6789-0123", platNomor: "N 4567 DE", kodeTrayek: "AL", trayekColor: "blue", status: "Terverifikasi", bergabung: "8 Mei 2024", avatar: "DK" },
  { id: 5, name: "Eko Prasetyo", phone: "0813-7890-1234", platNomor: "N 5678 EF", kodeTrayek: "GA", trayekColor: "orange", status: "Diberhentikan", bergabung: "5 Mei 2024", avatar: "EP" },
  { id: 6, name: "Fajar Maulana", phone: "0823-8901-2345", platNomor: "N 6789 FG", kodeTrayek: "MM", trayekColor: "red", status: "Pending", bergabung: "21 Mei 2024", avatar: "FM" },
  { id: 7, name: "Gilang Ramadhan", phone: "0834-9012-3456", platNomor: "N 7890 GH", kodeTrayek: "AL", trayekColor: "blue", status: "Terverifikasi", bergabung: "15 Mei 2024", avatar: "GR" },
];

// --- Helper Components ---
const StatusBadge = ({ status }: { status: DriverStatus }) => {
  const map: Record<DriverStatus, { dot: string; text: string; bg: string }> = {
    Terverifikasi: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
    Pending: { dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50" },
    Diberhentikan: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const TrayekBadge = ({ code, color }: { code: string; color: string }) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color] ?? "bg-gray-100 text-gray-700"}`}>
      {code}
    </span>
  );
};

const ActionButton = ({ status }: { status: DriverStatus }) => {
  if (status === "Pending") {
    return (
      <button className="px-3 py-1.5 text-xs font-semibold border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
        Verifikasi
      </button>
    );
  }
  if (status === "Diberhentikan") {
    return (
      <button className="px-3 py-1.5 text-xs font-semibold border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
        Jalankan Lagi
      </button>
    );
  }
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      Lihat Detail
    </button>
  );
};

const Avatar = ({ initials }: { initials: string }) => {
  const colors = ["bg-blue-200 text-blue-700", "bg-green-200 text-green-700", "bg-purple-200 text-purple-700", "bg-orange-200 text-orange-700", "bg-pink-200 text-pink-700"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
};

// --- Stat Card ---
const StatCard = ({
  icon, label, value, sub, subColor,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; subColor?: string;
}) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className={`text-xs mt-1 ${subColor ?? "text-gray-400"}`}>{sub}</p>
    </div>
  </div>
);

// --- Main Page ---
export default function DriverDashboard() {
  const [search, setSearch] = useState("");
  const [trayek, setTrayek] = useState("Semua Trayek");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.name.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.platNomor.toLowerCase().includes(q);
    const matchStatus = statusFilter === "Semua Status" || d.status === statusFilter;
    const matchTrayek = trayek === "Semua Trayek" || d.kodeTrayek === trayek;
    return matchSearch && matchStatus && matchTrayek;
  });

  const totalPages = 16;
  const pageNumbers = [1, 2, 3];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Driver</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua driver terdaftar</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Total Driver"
            value={152}
            sub="Semua driver terdaftar"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="Terverifikasi"
            value={98}
            sub="64.5% dari total driver"
            subColor="text-green-500"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Pending"
            value={27}
            sub="Menunggu verifikasi"
            subColor="text-yellow-500"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
            label="Diberhentikan"
            value={27}
            sub="17.7% dari total driver"
            subColor="text-red-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari driver, nama, atau plat nomor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Trayek Filter */}
              <div className="relative">
                <select
                  value={trayek}
                  onChange={(e) => setTrayek(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option>Semua Trayek</option>
                  <option>AL</option>
                  <option>AG</option>
                  <option>ADL</option>
                  <option>GA</option>
                  <option>MM</option>
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option>Semua Status</option>
                  <option>Terverifikasi</option>
                  <option>Pending</option>
                  <option>Diberhentikan</option>
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Date Picker placeholder */}
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pilih Tanggal
              </button>

              {/* Add Driver */}
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Driver
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plat Nomor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode Trayek</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bergabung</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                      Tidak ada driver yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((driver, idx) => (
                    <tr key={driver.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={driver.avatar} />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{driver.name}</p>
                            <p className="text-xs text-blue-500 mt-0.5">{driver.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700">{driver.platNomor}</td>
                      <td className="px-5 py-4">
                        <TrayekBadge code={driver.kodeTrayek} color={driver.trayekColor} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={driver.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-500">{driver.bergabung}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ActionButton status={driver.status} />
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan 1 – {Math.min(perPage, filtered.length)} dari 152 driver
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === n ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {n}
                </button>
              ))}

              <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">...</span>

              <button
                onClick={() => setCurrentPage(16)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === 16 ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                16
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Per-page selector */}
              <div className="relative ml-2">
                <select className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>10 / halaman</option>
                  <option>20 / halaman</option>
                  <option>50 / halaman</option>
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}