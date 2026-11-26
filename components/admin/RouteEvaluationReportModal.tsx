"use client";

import React, { useRef } from "react";
import {
  FaTimes,
  FaFilePdf,
  FaFileCsv,
  FaPrint,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRoute,
  FaUsers,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

export interface RouteEvaluationItem {
  routeId: number;
  routeCode: string;
  routeName: string;
  total7DaysPax: number;
  avgDailyPax: number;
  total7DaysTrips: number;
  avgDailyTrips: number;
  densityLevel: string;
  densityColor: string;
  recommendation: string;
}

interface RouteEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationDate: string;
  evaluationWindow: string; // e.g. "H-7 s/d H-1 (19 Nov - 25 Nov 2026)"
  reportItems: RouteEvaluationItem[];
}

export default function RouteEvaluationReportModal({
  isOpen,
  onClose,
  evaluationDate,
  evaluationWindow,
  reportItems,
}: RouteEvaluationReportModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Total akumulasi seluruh jaringan trayek
  const grandTotal7DaysPax = reportItems.reduce((acc, r) => acc + r.total7DaysPax, 0);
  const grandAvgDailyPax = Math.round(grandTotal7DaysPax / 7);
  const grandTotal7DaysTrips = reportItems.reduce((acc, r) => acc + r.total7DaysTrips, 0);

  // Fungsi Cetak Dokumen via Window Print
  const handlePrint = () => {
    window.print();
  };

  // Fungsi Unduh File CSV
  const handleDownloadCsv = () => {
    const headers = [
      "Kode Trayek",
      "Nama Koridor Trayek",
      "Total Penumpang (7 Hari)",
      "Rata-rata Penumpang / Hari (Total/7)",
      "Total Ritase (7 Hari)",
      "Rata-rata Ritase / Hari",
      "Tingkat Kepadatan",
      "Rekomendasi Alokasi Armada",
    ];

    const rows = reportItems.map((item) => [
      item.routeCode,
      `"${item.routeName}"`,
      item.total7DaysPax,
      item.avgDailyPax,
      item.total7DaysTrips,
      item.avgDailyTrips,
      `"${item.densityLevel}"`,
      `"${item.recommendation}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Evaluasi_Kepadatan_Trayek_${evaluationDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Action Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <FaRoute className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Dokumen Laporan Evaluasi Kepadatan Trayek
              </h3>
              <p className="text-[11px] text-slate-500">
                Model Evaluasi Bergulir 7-Hari (Rolling Analysis H1–H7 ÷ 7)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Cetak / PDF (Warna Biru / Indigo Elegan Tanpa Hitam) */}
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FaPrint className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            {/* Tombol Unduh CSV */}
            <button
              onClick={handleDownloadCsv}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FaFileCsv className="w-3.5 h-3.5" />
              <span>Unduh CSV (Excel)</span>
            </button>

            {/* Tombol Tutup */}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={printableRef}
          className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 print:p-0 print:m-0"
        >
          {/* Header Surat / Kop Dokumen */}
          <div className="border-b-2 border-rose-600 pb-4 text-center">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-slate-800">
              Pusat Kendali Operasional AngkotGo
            </h2>
            <h1 className="text-base md:text-lg font-bold text-rose-800 mt-0.5">
              LAPORAN EVALUASI OPERASIONAL &amp; ANALISA KEPADATAN JARINGAN TRAYEK
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Metode Evaluasi: Rata-Rata Penumpang 7-Hari Terakhir (Total Penumpang H1–H7 dibagi 7 Hari)
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="text-rose-600" />
                Tanggal Analisa: <strong className="text-slate-800">{evaluationDate}</strong>
              </span>
              <span>•</span>
              <span>
                Rentang Evaluasi: <strong className="text-slate-800">{evaluationWindow}</strong>
              </span>
            </div>
          </div>

          {/* Ringkasan Eksekutif (Cards Warna Halus Tanpa Hitam) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950">
              <span className="text-[11px] font-semibold text-blue-800 uppercase">
                Total Penumpang (7 Hari)
              </span>
              <p className="text-xl font-extrabold text-blue-900 mt-1">
                {grandTotal7DaysPax.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-blue-700">Orang</span>
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Akumulasi seluruh trayek aktif
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
              <span className="text-[11px] font-semibold text-rose-800 uppercase">
                Rata-rata Penumpang Harian
              </span>
              <p className="text-xl font-extrabold text-rose-900 mt-1">
                {grandAvgDailyPax.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-rose-700">Orang/Hari</span>
              </p>
              <p className="text-[10px] text-rose-600 mt-0.5">
                Total 7 Hari dibagi 7
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">
                Total Ritase Beroperasi
              </span>
              <p className="text-xl font-extrabold text-emerald-900 mt-1">
                {grandTotal7DaysTrips.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-emerald-700">Putaran</span>
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                Kesiapan armada tercatat
              </p>
            </div>
          </div>

          {/* Tabel Evaluasi Kepadatan per Trayek */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FaInfoCircle className="text-blue-600" />
              Tabel Rekapitulasi &amp; Rekomendasi Kebijakan Armada per Trayek
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3">Trayek</th>
                    <th className="px-3.5 py-3">Koridor Lintasan</th>
                    <th className="px-3 py-3 text-right">Total (7 Hari)</th>
                    <th className="px-3 py-3 text-right bg-rose-100/50">Rata-rata / Hari</th>
                    <th className="px-3 py-3 text-right">Ritase (7 Hari)</th>
                    <th className="px-3.5 py-3 text-center">Tingkat Kepadatan</th>
                    <th className="px-3.5 py-3">Rekomendasi Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportItems.map((item) => (
                    <tr key={item.routeId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                          {item.routeCode}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-800">
                        {item.routeName}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-700">
                        {item.total7DaysPax.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-rose-900 bg-rose-50/50">
                        {item.avgDailyPax.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600">
                        {item.total7DaysTrips}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: item.densityColor }}
                        >
                          {item.densityLevel}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-[11px] text-slate-700">
                        {item.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan Analisa untuk Manajemen */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1 text-amber-950">
            <p className="font-bold flex items-center gap-1.5">
              <FaExclamationTriangle className="text-amber-600" />
              Petunjuk Pengambilan Keputusan Admin:
            </p>
            <p className="text-amber-900/90 text-[11px] leading-relaxed">
              • <strong>Warna Merah Darah (Kepadatan Tinggi)</strong>: Jalur dengan rata-rata &gt; 50 penumpang/hari membutuhkan penambahan armada cadangan (*standby fleet*) saat jam sibuk.
              <br />
              • <strong>Warna Oranye (Sedang)</strong>: Alokasi armada dan interval kedatangan angkot saat ini dinilai optimal.
              <br />
              • <strong>Warna Merah Muda (Rendah)</strong>: Jalur lengang (&lt; 15 penumpang/hari), disarankan evaluasi jadwal atau penyesuaian rotasi angkot ke jalur padat.
            </p>
          </div>

          {/* Footer Dokumen / Pengesahan */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Dicetak secara otomatis oleh Sistem AngkotGo</span>
            <span>Status: Dokumen Analisa Resmi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
