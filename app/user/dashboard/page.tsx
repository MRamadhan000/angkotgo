"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiBell,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";
import { FaBus } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUsers";
import {
  useHistoryPayments,
  useUpdatePaymentStatus,
} from "@/hooks/payments/usePayments";
import { PaymentStatus } from "@/types/payments/payment.type";

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const { user, logout } = useAuth(); // Mengambil user ID aktif
  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Fetching data transaksi riwayat pembayaran
  const {
    data: payments = [],
    isLoading: loading,
    error: paymentError,
  } = useHistoryPayments(user?.id ?? null);

  // Filtering berdasarkan status pembayaran
  const filteredPayments = payments.filter((item) => {
    if (filter === "PAID") return item.status === PaymentStatus.PAID;
    if (filter === "PENDING") return item.status === PaymentStatus.PENDING;
    return true;
  });

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePaymentStatus();

  // Function Handler ketika tombol Done diklik
  const handleMarkAsDone = (xenditPaymentRequestId: string) => {
    updateStatus(xenditPaymentRequestId);
  };

  return (
    // Outer Container: md:flex-row agar Sidebar dan Konten Utama berdampingan di Desktop
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar Backdrop (Hanya aktif di Mobile) */}
      <div
        className={`fixed inset-0 bg-[#0b1c30]/50 z-50 transition-opacity duration-300 backdrop-blur-sm md:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar (Kiri) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-[#ffffff] z-50 md:z-auto flex flex-col shrink-0 border-r border-[#c3c5d8]/30 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-[#c3c5d8]/30">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c3c5d8] relative shrink-0">
            {/* <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALw1iUO42WOjqCodZl7tXIAPKgIXD8-R4e8gOQbSXCjbYbQN8nI3IwBIg7GnvrQIuYvaiaUG-k9JCI4bKDXBIFulcG-SfHQLdsH4mWGzbbONBcvg_6YlYaOy5KnZr8ZwS9pe36gM6Li71gDdTeve5oF5PdCcGOAnZUcF36h5yf7VN71S6vxSQWeYmFB_eqI0j8rXCB4-EmnIhqhu6rW58bBKXvPe0mxKKI8NXVSmluF9MbbL1i8YN-9A"
              alt="User Avatar"
              fill
              className="object-cover"
            /> */}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[18px] leading-[24px] text-[#0b1c30]">
              Budi Santoso
            </span>
            <span className="text-[12px] leading-[16px] text-[#434655]">
              +62 812 3456 7890
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-2 overflow-y-auto">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#1e56f1] text-[#ffffff] font-semibold text-[14px] leading-[24px] transition-colors"
          >
            <FiHome className="w-5 h-5" /> Home
          </Link>

          <Link
            href="/user/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-full text-[#434655] font-semibold text-[14px] leading-[24px] transition-colors"
          >
            <FiUser className="w-5 h-5" />
            Profile
          </Link>
        </nav>

        <div className="p-3 border-t border-[#c3c5d8]/30 mt-auto">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/50 font-semibold text-[14px] leading-[24px] transition-colors"
            onClick={logout}
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Right Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-40 bg-[#f8f9ff] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 md:px-8 h-14 border-b border-[#c3c5d8]/20">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655] md:hidden"
              onClick={toggleSidebar}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-[20px] leading-[28px] font-bold text-[#003fc7]">
              AngkotGo
            </h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655]">
            <FiBell className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 px-4 md:px-8 py-6 flex flex-col gap-6 max-w-5xl w-full mx-auto">
          <section>
            <h2 className="font-bold text-[18px] md:text-[22px] leading-[28px] text-[#0b1c30]">
              Riwayat Pembayaran
            </h2>
            <p className="text-[14px] leading-[20px] text-[#434655] mt-1">
              Daftar transaksi dan pembayaran GoPay AngkotGo
            </p>
          </section>

          <section className="flex flex-col gap-2 mb-6">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-1.5 rounded-full font-semibold text-[12px] transition-colors ${
                  filter === "ALL"
                    ? "bg-[#1e56f1] text-[#ffffff]"
                    : "bg-[#e5eeff] text-[#434655] hover:bg-[#d3e4fe]"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("PAID")}
                className={`px-4 py-1.5 rounded-full font-semibold text-[12px] transition-colors ${
                  filter === "PAID"
                    ? "bg-[#1e56f1] text-[#ffffff]"
                    : "bg-[#e5eeff] text-[#434655] hover:bg-[#d3e4fe]"
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-4 py-1.5 rounded-full font-semibold text-[12px] transition-colors ${
                  filter === "PENDING"
                    ? "bg-[#1e56f1] text-[#ffffff]"
                    : "bg-[#e5eeff] text-[#434655] hover:bg-[#d3e4fe]"
                }`}
              >
                Pending
              </button>
            </div>

            {/* List Transaksi */}
            <div className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/30 shadow-[0_4px_12px_rgba(0,0,0,0.03)] divide-y divide-[#c3c5d8]/20 mt-2">
              {loading ? (
                <div className="p-4 text-center text-[#434655] text-sm">
                  Memuat riwayat transaksi...
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-4 text-center text-[#434655] text-sm">
                  Tidak ada transaksi.
                </div>
              ) : (
                filteredPayments.map((item) => (
                  <div
                    key={item.paymentCode}
                    className="p-4 flex items-center justify-between hover:bg-[#f8f9ff] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#1e56f1]/10 text-[#1e56f1]">
                        <FaBus className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px] leading-[24px] text-[#0b1c30]">
                          {item.paymentCode}
                        </span>
                        <span className="text-[12px] leading-[20px] text-[#434655]">
                          {new Date(item.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          WIB
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <div className="font-semibold text-[14px] leading-[24px] text-[#0b1c30]">
                          -Rp {Number(item.amount).toLocaleString("id-ID")}
                        </div>
                        <span
                          className={`font-semibold text-[10px] leading-[16px] tracking-[0.02em] ${
                            item.status === PaymentStatus.PAID
                              ? "text-[#00772c]"
                              : item.status === PaymentStatus.PENDING
                                ? "text-[#d97706]"
                                : "text-[#ba1a1a]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Tombol Done jika Status PENDING */}
                      {item.status === PaymentStatus.PENDING && (
                        <button
                          onClick={() =>
                            handleMarkAsDone(item.xenditPaymentRequestId ?? "")
                          }
                          disabled={isUpdating}
                          className="flex items-center gap-1 bg-[#00772c] hover:bg-[#005c20] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FiCheck className="w-3.5 h-3.5" />
                          )}
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
