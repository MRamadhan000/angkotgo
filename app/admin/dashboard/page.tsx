'use client';

import React, { useEffect, useRef, useState } from 'react';
// import Topbar from '@/components/Topbar';
import {
  FaRoute, FaUsers, FaClock, FaRupeeSign,
  FaBus, FaTrophy, FaSave, FaCheckCircle, FaChevronRight,
} from 'react-icons/fa';
import { HiOutlineSave } from 'react-icons/hi';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ─── Data ──────────────────────────────────────────────────────────────────
const SPARK_DRIVER   = [42,48,55,52,60,58,65,62,70,68,78,80,98];
const SPARK_AKTIF    = [70,75,78,80,82,79,83,85,84,86,85,86,86];
const SPARK_NONAKTIF = [50,48,45,42,40,38,36,35,34,33,32,32,32];

const TOP_ROUTES = [
  { rank:1, code:'AL',  name:'Arjosari – Landungsari',          drivers:45 },
  { rank:2, code:'ADL', name:'Arjosari – Dinoyo – Landungsari', drivers:28 },
  { rank:3, code:'GA',  name:'Gadang – Arjosari',               drivers:24 },
];

// ─── Sparkline ────────────────────────────────────────────────────────────
function Sparkline({
  id, data, color, fill,
}: { id: string; data: number[]; color: string; fill: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: fill,
          borderWidth: 1.5,
          tension: 0.45,
          pointRadius: 0,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
    return () => chart.destroy();
  }, []);

  return (
    <div className="absolute bottom-0 right-0 w-[55%] h-[70px]">
      <canvas ref={ref} role="img" aria-label={`Sparkline ${id}`} />
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────
function DonutChart() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: ['Angkot Aktif', 'Angkot Tidak Aktif'],
        datasets: [{
          data: [86, 32],
          backgroundColor: ['#3b82f6', '#fb923c'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw}` } },
        },
      },
    });
    return () => chart.destroy();
  }, []);

  return <canvas ref={ref} role="img" aria-label="Pie chart ringkasan armada">Aktif 86, Tidak aktif 32.</canvas>;
}

// ─── Tarif Form ───────────────────────────────────────────────────────────
function TarifForm() {
  const [tarifBaru, setTarifBaru] = useState(6000);
  const [saved, setSaved] = useState(false);
  const [currentTarif, setCurrentTarif] = useState(5000);

  const handleSimpan = () => {
    setCurrentTarif(tarifBaru);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      {/* Info box */}
      <div className="bg-blue-50 rounded-[8px] px-3 py-2.5 mb-4 text-[11px] text-blue-600 leading-relaxed">
        Perubahan tarif akan berlaku untuk semua rute dan semua angkot.
      </div>

      {/* Tarif saat ini */}
      <p className="text-[11px] text-slate-500 font-medium mb-1.5">Tarif Saat Ini</p>
      <div className="bg-slate-50 border border-slate-200 rounded-[7px] px-3 py-2 text-[13px] font-semibold text-slate-600 mb-3">
        Rp {currentTarif.toLocaleString('id-ID')}
      </div>

      {/* Tarif baru */}
      <p className="text-[11px] text-slate-500 font-medium mb-1.5">Tarif Baru</p>
      <div className="flex items-center border border-slate-200 rounded-[7px] overflow-hidden mb-4">
        <span className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-[12px] text-slate-500 font-medium">
          Rp
        </span>
        <input
          type="number"
          value={tarifBaru}
          onChange={e => setTarifBaru(Number(e.target.value))}
          className="flex-1 px-3 py-2 text-[13px] font-semibold text-slate-800 outline-none
                     focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          min={0}
          step={500}
        />
      </div>

      <button
        onClick={handleSimpan}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
                   text-[13px] font-bold rounded-[9px] flex items-center justify-center gap-2
                   transition-colors"
      >
        <HiOutlineSave className="text-[16px]" />
        Simpan Perubahan Tarif
      </button>

      {saved && (
        <div className="mt-2.5 flex items-center gap-2 bg-green-50 border border-green-200
                        text-green-700 text-[11px] font-semibold px-3 py-2 rounded-[8px]">
          <FaCheckCircle className="text-[12px]" />
          Tarif berhasil diperbarui
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const rankColors: Record<number, string> = {
    1: 'bg-amber-400',
    2: 'bg-slate-400',
    3: 'bg-amber-700',
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* <Topbar breadcrumb={{ parent: 'Beranda', current: 'Dashboard' }} /> */}

      <main className="flex-1 overflow-y-auto p-5 bg-[#f0f4f8]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[17px] font-bold text-slate-900">Informasi General</h1>
          <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-[8px]
                             px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors">
            <FaClock className="text-blue-500 text-[12px]" />
            {today}
            <FaChevronRight className="text-slate-300 text-[10px]" />
          </button>
        </div>

        {/* ── Row 1: Stat cards ─────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {/* Total Rute */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaRoute className="text-blue-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Total Rute</p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">24</p>
              <p className="text-[11px] text-slate-400 mt-1">Rute Aktif</p>
            </div>
          </div>

          {/* Total Driver */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-11 h-11 bg-green-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaUsers className="text-green-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Total Driver</p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">152</p>
              <p className="text-[11px] text-slate-400 mt-1">Semua Driver</p>
            </div>
          </div>

          {/* Trayek terbanyak */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-11 h-11 bg-yellow-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaTrophy className="text-yellow-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Trayek Paling Banyak</p>
              <p className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">AL</p>
              <p className="text-[11px] text-slate-400 mt-1">Arjosari – Landungsari</p>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px]
                               font-semibold px-2 py-0.5 rounded-full mt-1.5">
                <FaBus className="text-[9px]" /> 12 Angkot
              </span>
            </div>
          </div>

          {/* Tarif */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <FaRupeeSign className="text-purple-500 text-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Tarif Saat Ini</p>
              <p className="text-[20px] font-extrabold text-slate-900 leading-none tracking-tight mt-1">
                Rp 5.000
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Tarif per penumpang</p>
            </div>
          </div>
        </div>

        {/* ── Row 2: Metric + sparkline cards ───────────── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            {
              title: 'Driver Online', badge: '● Online', badgeCls: 'bg-green-50 text-green-600',
              val: '98', unit: 'Driver', pct: '64.5% dari total driver',
              id: 'sp1', data: SPARK_DRIVER, color: '#16a34a', fill: 'rgba(22,163,74,.08)',
            },
            {
              title: 'Angkot Aktif', badge: '● Aktif', badgeCls: 'bg-blue-50 text-blue-600',
              val: '86', unit: 'Angkot', pct: '72.9% dari total angkot',
              id: 'sp2', data: SPARK_AKTIF, color: '#2563eb', fill: 'rgba(37,99,235,.08)',
            },
            {
              title: 'Angkot Tidak Aktif', badge: '● Tidak Aktif', badgeCls: 'bg-orange-50 text-orange-500',
              val: '32', unit: 'Angkot', pct: '27.1% dari total angkot',
              id: 'sp3', data: SPARK_NONAKTIF, color: '#ea580c', fill: 'rgba(234,88,12,.08)',
            },
          ].map(card => (
            <div key={card.id} className="bg-white border border-slate-100 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[12px] font-semibold text-slate-600">{card.title}</p>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${card.badgeCls}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-none">
                {card.val}
              </p>
              <p className="text-[13px] font-semibold text-slate-500 mt-1">{card.unit}</p>
              <p className="text-[11px] text-slate-400 mt-1.5">{card.pct}</p>
              <Sparkline id={card.id} data={card.data} color={card.color} fill={card.fill} />
            </div>
          ))}
        </div>

        {/* ── Row 3: Ranking / Pie / Tarif ──────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Ranking */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[13px] font-bold text-slate-900 mb-3">Trayek dengan Supir Terbanyak</p>
            {TOP_ROUTES.map(r => (
              <div key={r.rank} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center
                                 text-[11px] font-bold text-white flex-shrink-0 ${rankColors[r.rank]}`}>
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-800">{r.code}</p>
                  <p className="text-[11px] text-slate-400 truncate">{r.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-extrabold text-slate-800">{r.drivers}</p>
                  <p className="text-[10px] text-slate-400">Supir</p>
                </div>
              </div>
            ))}
            <button className="w-full mt-3 py-2 border border-slate-200 rounded-[8px] text-[12px]
                               font-semibold text-blue-600 flex items-center justify-center gap-1.5
                               hover:bg-slate-50 transition-colors">
              Lihat Semua Trayek <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          {/* Pie / Ringkasan Armada */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[13px] font-bold text-slate-900 mb-3">Ringkasan Armada</p>
            <div className="flex items-center gap-5">
              <div className="relative w-[150px] h-[150px] flex-shrink-0">
                <DonutChart />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[20px] font-extrabold text-slate-900 leading-none">118</span>
                  <span className="text-[9px] font-semibold text-slate-500 mt-0.5">Total Angkot</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { color: 'bg-blue-500', label: 'Angkot Aktif',       val: 86, pct: '72.9%' },
                  { color: 'bg-orange-400', label: 'Angkot Tidak Aktif', val: 32, pct: '27.1%' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                    <div>
                      <p className="text-[11px] text-slate-500">{item.label}</p>
                      <p className="text-[12px] font-bold text-slate-800">
                        {item.val}&nbsp;
                        <span className="text-[11px] font-normal text-slate-400">({item.pct})</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-slate-200 rounded-[8px] text-[12px]
                               font-semibold text-blue-600 flex items-center justify-center gap-1.5
                               hover:bg-slate-50 transition-colors">
              Lihat Semua Armada <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          {/* Ubah Tarif */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <p className="text-[13px] font-bold text-slate-900 mb-3">Ubah Tarif Angkot</p>
            <TarifForm />
          </div>
        </div>

      </main>
    </div>
  );
}