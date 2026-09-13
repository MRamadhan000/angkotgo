"use client";

import Link from "next/link";
import { FaBus, FaCreditCard, FaSearchLocation } from "react-icons/fa";
import { FiRadio, FiArrowRight, FiMapPin } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Selamat Datang */}
      <section className="bg-gradient-to-r from-[#1e56f1] to-[#003fc7] text-white p-6 md:p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold">
          Selamat Datang, {user?.name ?? "Budi Santoso"}!
        </h2>
        <p className="text-blue-100 mt-2 text-sm md:text-base">
          Pantau keberadaan angkot dan kelola pembayaran perjalanan Anda dalam
          satu dashboard.
        </p>
      </section>

      {/* CTA Section: Cari Angkot Sekarang */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#c3c5d8]/30 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1e56f1] flex items-center justify-center shrink-0">
            <FaBus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg md:text-xl text-[#0b1c30]">
              Ayo Cari Angkot Sekarang!
            </h3>
            <p className="text-sm text-[#434655] mt-0.5">
              Tentukan rute perjalananmu dan temukan angkot terdekat secara
              real-time.
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 bg-[#f8f9ff] p-3 rounded-xl border border-[#c3c5d8]/20">
          <Link
            href="/search" // Sesuaikan dengan route halaman pencarian angkot
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#1e56f1] hover:bg-[#003fc7] text-white font-bold text-sm px-6 py-3 rounded-lg transition-all duration-200 shadow-sm active:scale-95 shrink-0"
          >
            <FaSearchLocation className="w-4 h-4" />
            <span>Cari Angkot</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
