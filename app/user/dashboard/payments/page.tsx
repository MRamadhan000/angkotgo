"use client";

import { useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiMapPin,
  FiMessageSquare,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";
import {
  FaBus,
  FaMoneyBillWave,
  FaCreditCard,
  FaRoute,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import {
  useHistoryPayments,
  useUpdatePaymentStatus,
} from "@/hooks/payments/usePayments";
import { PaymentStatus, PaymentType } from "@/types/payments/payment.type";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPaymentType(value: PaymentType | string) {
  return value.toUpperCase() === "CASH" ? "Tunai" : "Pembayaran online";
}

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
            filteredPayments.map((item) => {
              const assignment = item.vehicleAssignment;
              const isCash = item.paymentType.toUpperCase() === "CASH";
              const isPaid = item.status === PaymentStatus.PAID;
              const isPending = item.status === PaymentStatus.PENDING;

              return (
                <article
                  key={item.id ?? item.paymentCode}
                  className="p-4 sm:p-5 hover:bg-[#f8f9ff] transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCash ? "bg-emerald-50 text-[#00772c]" : "bg-blue-50 text-[#1e56f1]"}`}>
                          {isCash ? <FaMoneyBillWave className="w-5 h-5" /> : <FaCreditCard className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[14px] leading-5 text-[#0b1c30]">
                              {assignment?.route?.routeName ?? "Perjalanan Angkot"}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isPaid ? "bg-emerald-100 text-emerald-800" : isPending ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#434655] mt-1">
                            {formatDate(item.createdAt)} WIB
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[15px] text-[#0b1c30]">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </p>
                        <p className="text-[11px] text-[#434655]">{formatPaymentType(item.paymentType)}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#dfe5f0] bg-[#f8faff] p-3">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0b1c30]">
                        <FaRoute className="text-[#1e56f1] shrink-0" />
                        <span>{assignment?.route?.routeCode ?? "-"}</span>
                        <FiArrowRight className="text-[#8a91a3]" />
                        <span className="truncate">{assignment?.route?.routeName ?? "Rute tidak tersedia"}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#434655]">
                        <p className="flex items-center gap-2"><FiClock className="text-[#1e56f1] shrink-0" />{assignment?.assignmentDate ?? "-"} | {assignment?.startTime ?? "-"} - {assignment?.endTime ?? "-"}</p>
                        <p className="flex items-center gap-2"><FiMapPin className="text-[#1e56f1] shrink-0" />Arah {assignment?.direction ?? "-"}</p>
                        <p className="flex items-center gap-2"><FaBus className="text-[#1e56f1] shrink-0" />{assignment?.vehicle?.vehicleCode ?? "-"} · {assignment?.vehicle?.plateNumber ?? "-"}</p>
                        <p className="flex items-center gap-2"><FiUser className="text-[#1e56f1] shrink-0" />{assignment?.currentPassengers ?? 0} penumpang</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#434655]">
                      <p><span className="font-semibold text-[#0b1c30]">Driver:</span> {assignment?.driver?.name ?? "-"}</p>
                      <p><span className="font-semibold text-[#0b1c30]">Kondektur:</span> {assignment?.conductor?.name ?? "-"}</p>
                    </div>

                    {assignment?.feedback ? (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3 text-[12px]">
                        <FiMessageSquare className="w-4 h-4 mt-0.5 text-[#d97706] shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#0b1c30]">Feedback Anda</p>
                            <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${assignment.feedback.rating} dari 5`}>
                              {Array.from({ length: 5 }, (_, starIndex) =>
                                starIndex < assignment.feedback!.rating ? (
                                  <FaStar key={starIndex} className="w-3.5 h-3.5 text-[#f59e0b]" />
                                ) : (
                                  <FaRegStar key={starIndex} className="w-3.5 h-3.5 text-[#d1d5db]" />
                                ),
                              )}
                            </span>
                          </div>
                          <p className="text-[#434655] mt-0.5">{assignment.feedback.description || "Tidak ada komentar"}</p>
                        </div>
                      </div>
                    ) : null}

                    {isPending && item.paymentType.toUpperCase() === "ONLINE" && (
                      <button
                        onClick={() => handleMarkAsDone(item.xenditPaymentRequestId ?? null)}
                        disabled={isUpdating || !item.xenditPaymentRequestId}
                        className="self-start flex items-center gap-1 bg-[#00772c] hover:bg-[#005c20] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                        Tandai selesai
                      </button>
                    )}

                    <p className="text-[11px] text-[#8a91a3]">ID transaksi: {item.paymentCode}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
