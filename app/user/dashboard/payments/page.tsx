"use client";

import { useState } from "react";
import { FiCheck, FiRefreshCw } from "react-icons/fi";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import {
  useHistoryPayments,
  useUpdatePaymentStatus,
} from "@/hooks/payments/usePayments";
import { PaymentStatus, PaymentType } from "@/types/payments/payment.type";

export default function PaymentPage() {
  const { user } = useAuth();
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
  const handleMarkAsDone = (xenditPaymentRequestId: string | null) => {
    const targetId = xenditPaymentRequestId;

    if (!targetId) {
      console.error("ID Pembayaran tidak ditemukan!");
      return;
    }

    console.log("Marking as done:", targetId);
    updateStatus(targetId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section>
        <h2 className="font-bold text-[18px] md:text-[22px] leading-[28px] text-[#0b1c30]">
          Riwayat Pembayaran
        </h2>
        <p className="text-[14px] leading-[20px] text-[#434655] mt-1">
          Daftar transaksi dan pembayaran GoPay AngkotGo
        </p>
      </section>

      {/* Main Payment Section */}
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
            <div className="p-4 text-center text-[#434655] text-sm flex items-center justify-center gap-2">
              <FiRefreshCw className="w-4 h-4 animate-spin text-[#1e56f1]" />
              Memuat riwayat transaksi...
            </div>
          ) : paymentError ? (
            <div className="p-4 text-center text-[#ba1a1a] text-sm">
              Gagal memuat transaksi: {paymentError.message}
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
                  {/* Icon Berdasarkan Payment Type */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#1e56f1]/10 text-[#1e56f1]">
                    {item.paymentType === PaymentType.CASH ? (
                      <FaMoneyBillWave className="w-5 h-5 text-[#00772c]" />
                    ) : (
                      <FaCreditCard className="w-5 h-5 text-[#1e56f1]" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[14px] leading-[24px] text-[#0b1c30]">
                        {item.paymentCode}
                      </span>
                      {/* Badge Tipe Pembayaran (CASH / ONLINE) */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.paymentType === PaymentType.CASH
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.paymentType}
                      </span>
                    </div>

                    <span className="text-[12px] leading-[20px] text-[#434655]">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
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

                  {/* Tombol Done HANYA untuk status PENDING dan tipe ONLINE */}
                  {item.status === PaymentStatus.PENDING &&
                    item.paymentType === PaymentType.ONLINE && (
                      <button
                        onClick={() =>
                          handleMarkAsDone(
                            item.xenditPaymentRequestId ?? null,
                          )
                        }
                        disabled={
                          isUpdating || !item.xenditPaymentRequestId
                        }
                        className="flex items-center gap-1 bg-[#00772c] hover:bg-[#005c20] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}