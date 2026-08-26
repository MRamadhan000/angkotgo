"use client";

import { useState } from "react";
import {
  Driver,
  UpdateDriverInput,
  BankAccountInfo,
} from "@/types/driver.type";
import { useDrivers } from "@/hooks/useDrivers";
import { EditDriverModal } from "@/components/driver/EditDriverModal";
import { useToast } from "@/context/ToastContext";
import {
  FiRefreshCw,
  FiPhone,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEdit3,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";

function extractDriverList(response: unknown): Driver[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object" && "data" in response) {
    const maybeData = (response as { data: unknown }).data;
    if (Array.isArray(maybeData)) return maybeData as Driver[];
  }
  return [];
}

const TABLE_HEADERS = [
  "Driver & Kontak",
  "NIK",
  "SIM & Expired",
  "Alamat",
  "Info Bank",
  "Performa",
  "Status Akun",
  "Verifikasi",
  "Waktu (Dibuat/Diubah)",
  "Aksi",
];

export default function DriverDashboardPage() {
  const { drivers, updateDriver, loading, error, refetch } = useDrivers();

  const driverList: Driver[] = extractDriverList(drivers);

  const [activeTab, setActiveTab] = useState<boolean>(true);

  const [selectedDriverForEdit, setSelectedDriverForEdit] =
    useState<Driver | null>(null);

  const { success, error: showError } = useToast();

  const filteredDrivers = driverList.filter(
    (driver) => driver.isVerified === activeTab,
  );

  const handleEdit = (driver: Driver) => {
    setSelectedDriverForEdit(driver);
  };

  const handleSaveEdit = async (updatedData: UpdateDriverInput) => {
    if (!selectedDriverForEdit) return;
    try {
      await updateDriver(selectedDriverForEdit.id, updatedData);
      setSelectedDriverForEdit(null);
      refetch();
      success("Driver berhasil diperbarui.");
    } catch (err) {
      showError(`Gagal mengupdate driver, ${err instanceof Error ? err.message : "terjadi kesalahan."}`);
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Driver</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau status operasional driver AngkotGo.
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* WIDGET SEGMENTED CONTROL */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {[
          {
            label: "Terverifikasi",
            value: true,
            icon: FiCheckCircle,
            count: driverList.filter((d) => d.isVerified).length,
          },
          {
            label: "Belum Terverifikasi",
            value: false,
            icon: FiClock,
            count: driverList.filter((d) => !d.isVerified).length,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={String(tab.value)}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === tab.value
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {TABLE_HEADERS.map((header) => (
                  <th key={header} className="py-4 px-6">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memuat data driver...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    Tidak ada data driver untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    {/* Driver & Kontak */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {driver.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {driver.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mt-1">
                        <FiPhone className="w-3 h-3" />
                        <span>{driver.phone || "-"}</span>
                      </div>
                    </td>

                    {/* NIK */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {driver.nik || "-"}
                    </td>

                    {/* SIM & Expired */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-gray-800 font-semibold">
                        {driver.licenseNumber || "-"}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Exp:{" "}
                        {driver.licenseExpiryDate
                          ? new Date(
                              driver.licenseExpiryDate,
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </div>
                    </td>

                    {/* Alamat */}
                    <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">
                      {driver.address || "-"}
                    </td>

                    {/* Info Bank */}
                    <td className="py-4 px-6">
                      {driver.bankAccountInfo ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-xs text-gray-800">
                            <FiCreditCard className="w-3.5 h-3.5 text-gray-400" />
                            <span>{driver.bankAccountInfo.bankName}</span>
                          </div>
                          <div className="font-mono text-xs text-gray-600">
                            {driver.bankAccountInfo.accountNumber}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            a.n. {driver.bankAccountInfo.accountHolderName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* Performa */}
                    <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-amber-600">
                        <FiStar className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{driver.averageRating ?? 0}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {driver.totalTrips ?? 0} total trip
                      </div>
                    </td>

                    {/* Status Akun */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          driver.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-700"
                            : driver.status === "OFF_DUTY"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    {/* Verifikasi */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          driver.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {driver.isVerified ? (
                          <FiCheckCircle className="w-3 h-3" />
                        ) : (
                          <FiClock className="w-3 h-3" />
                        )}
                        {driver.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="py-4 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span>
                          Dibuat:{" "}
                          {driver.createdAt
                            ? new Date(driver.createdAt).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        Diubah:{" "}
                        {driver.updatedAt
                          ? new Date(driver.updatedAt).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </div>
                    </td>

                    {/* Aksi (Edit Saja) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          title="Edit Driver"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT */}
      <EditDriverModal
        isOpen={Boolean(selectedDriverForEdit)}
        driver={selectedDriverForEdit}
        onClose={() => setSelectedDriverForEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}