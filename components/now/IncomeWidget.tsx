import React, { useState } from "react";
import { FaWallet, FaCheckCircle, FaClock, FaTimesCircle, FaReceipt, FaPlus } from "react-icons/fa";
import { useTripPayments } from "@/hooks/payments/useTripPayments";
import { PaymentStatus } from "@/types/payments/payment.type";
import { PaymentEntryModal } from "./PaymentEntryModal";

interface IncomeWidgetProps {
    assignmentId: string | number;
}

export function IncomeWidget({ assignmentId }: IncomeWidgetProps) {
    const { payments, loading, error, totalIncome, addPayment } = useTripPayments(assignmentId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusIcon = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return <FaCheckCircle className="text-green-500" />;
            case PaymentStatus.PENDING:
                return <FaClock className="text-amber-500" />;
            case PaymentStatus.FAILED:
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-slate-400" />;
        }
    };

    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return (
                    <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                        Sukses
                    </span>
                );
            case PaymentStatus.PENDING:
                return (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                        Pending
                    </span>
                );
            case PaymentStatus.FAILED:
                return (
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                        Gagal
                    </span>
                );
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* HEADER CARD: TOTAL PENDAPATAN */}
            <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 shadow-lg shadow-emerald-200 text-white relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <p className="text-emerald-50 text-sm font-medium mb-1">
                        Total Pemasukan Trip
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight">
                            {loading ? "..." : formatCurrency(totalIncome)}
                        </span>
                    </div>
                </div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <FaWallet size={20} className="text-white" />
                </div>
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
                <FaPlus />
                Input Pembayaran Kasir
            </button>

            {/* LIST TRANSAKSI */}
            <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <FaReceipt className="text-slate-400" />
                        Riwayat Pembayaran
                    </h3>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {payments.length} Transaksi
                    </span>
                </div>

                <div className="max-h-72 overflow-y-auto p-2">
                    {loading ? (
                        <div className="p-6 text-center text-slate-500 text-sm animate-pulse">
                            Memuat data transaksi...
                        </div>
                    ) : error && payments.length === 0 ? (
                        <div className="p-6 text-center text-red-500 text-sm">{error}</div>
                    ) : payments.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <FaReceipt className="text-slate-300 text-xl" />
                            </div>
                            <p className="text-slate-500 text-sm">Belum ada transaksi</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            {getStatusIcon(payment.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {payment.user?.name || "Penumpang Umum"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                                    {payment.payment_type}
                                                </span>
                                                <span className="text-[10px] text-slate-400">• {payment.payment_code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <span className="text-sm font-bold text-slate-800">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                        {getStatusBadge(payment.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PaymentEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddPayment={addPayment}
            />
        </div>
    );
}
