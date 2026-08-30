import React, { useState } from "react";
import { FaTimes, FaMoneyBillWave, FaQrcode, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { PaymentType } from "@/types/payments/payment.type";

interface PaymentEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPayment: (amount: number, type: PaymentType) => Promise<any>;
}

const QUICK_AMOUNTS = [
    { label: "2.500 (Pelajar)", value: 2500 },
    { label: "5.000 (Umum)", value: 5000 },
    { label: "7.500", value: 7500 },
    { label: "10.000", value: 10000 },
    { label: "12.500", value: 12500 },
    { label: "15.000", value: 15000 },
];

export function PaymentEntryModal({ isOpen, onClose, onAddPayment }: PaymentEntryModalProps) {
    const [activeTab, setActiveTab] = useState<"CASH" | "QRIS">("CASH");
    const [customAmount, setCustomAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    if (!isOpen) return null;

    const handleSelectAmount = async (amount: number) => {
        setIsSubmitting(true);
        await onAddPayment(amount, activeTab === "CASH" ? PaymentType.CASH : PaymentType.QRIS);
        setIsSubmitting(false);
        onClose();
        // Reset states after close
        setCustomAmount("");
        setShowCustom(false);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountStr = customAmount.replace(/\D/g, "");
        if (!amountStr) return;
        handleSelectAmount(parseInt(amountStr, 10));
    };

    const formatRupiahInput = (val: string) => {
        const numberString = val.replace(/[^,\d]/g, "").toString();
        const split = numberString.split(",");
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
        rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
        return rupiah ? `Rp ${rupiah}` : "";
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Bottom Sheet */}
            <div className="relative bg-white w-full rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom pb-8 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Input Pemasukan</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="p-4">
                    <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                        <button
                            onClick={() => setActiveTab("CASH")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "CASH"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <FaMoneyBillWave size={16} />
                            CASH TUNAI
                        </button>
                        <button
                            onClick={() => setActiveTab("QRIS")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "QRIS"
                                    ? "bg-white text-emerald-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <FaQrcode size={16} />
                            SCAN QRIS
                        </button>
                    </div>
                </div>

                <div className="px-5">
                    {activeTab === "CASH" ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-3 rounded-xl border border-blue-100 text-center">
                                Pilih jumlah setoran penumpang secara cepat:
                            </div>

                            {!showCustom ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {QUICK_AMOUNTS.map((amt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectAmount(amt.value)}
                                                disabled={isSubmitting}
                                                className="bg-white border-2 border-slate-200 p-4 rounded-2xl text-slate-700 font-bold hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm disabled:opacity-50"
                                            >
                                                Rp {amt.value.toLocaleString("id-ID")}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowCustom(true)}
                                        className="w-full bg-slate-100 text-slate-600 p-4 rounded-2xl font-bold mt-2 hover:bg-slate-200 transition-colors"
                                    >
                                        Nominal Lainnya...
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleCustomSubmit} className="space-y-4 mt-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Rp 0"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(formatRupiahInput(e.target.value))}
                                            className="w-full border-2 border-slate-200 bg-white rounded-2xl p-5 text-2xl font-bold text-center text-slate-800 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCustom(false);
                                                setCustomAmount("");
                                            }}
                                            className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !customAmount}
                                            className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300"
                                        >
                                            {isSubmitting ? <FaSpinner className="animate-spin" /> : "Tambahkan"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col items-center justify-center shadow-sm">
                                <h3 className="font-bold text-emerald-800 mb-2">Angkot-Go QRIS JALUR AG</h3>
                                {/* Mock QR Code Pattern */}
                                <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-emerald-200">
                                    <div className="w-full h-full bg-[radial-gradient(#10b981_3px,transparent_3px)] [background-size:12px_12px] opacity-80 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-4 border-emerald-600 rounded-lg"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-4 border-emerald-600 rounded-lg"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-emerald-600 rounded-lg"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FaQrcode size={42} className="text-emerald-700 p-2 bg-white rounded-lg shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-emerald-600 text-xs text-center mt-3 font-medium px-4">
                                    Minta penumpang scan layar Anda menggunakan Gopay / Dana / OVO
                                </p>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl flex flex-col gap-2">
                                <p className="text-center text-xs font-semibold text-emerald-700"><FaCheckCircle className="inline mr-1 text-emerald-600" /> (SIMULASI MASUK SYSTEM)</p>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button onClick={() => handleSelectAmount(2500)} className="bg-emerald-600 text-white font-bold text-xs p-3 rounded-xl hover:bg-emerald-700">Rp2.500</button>
                                    <button onClick={() => handleSelectAmount(5000)} className="bg-emerald-600 text-white font-bold text-xs p-3 rounded-xl hover:bg-emerald-700">Rp5.000</button>
                                    <button onClick={() => handleSelectAmount(7500)} className="bg-emerald-600 text-white font-bold text-xs p-3 rounded-xl hover:bg-emerald-700">Rp7.500</button>
                                    <button onClick={() => handleSelectAmount(10000)} className="bg-emerald-600 text-white font-bold text-xs p-3 rounded-xl hover:bg-emerald-700">Rp10.000</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
