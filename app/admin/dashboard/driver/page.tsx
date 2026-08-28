"use client";
import { useState } from "react";
import { Driver, UpdateDriverInput } from "@/types/driver.type";
import { useDrivers, useUpdateDriver } from "@/hooks/useDrivers";
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
  const {
    data: drivers = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDrivers();

  const updateDriverMutation = useUpdateDriver();

  const [activeTab, setActiveTab] = useState<boolean>(true);

  const [selectedDriverForEdit, setSelectedDriverForEdit] =
    useState<Driver | null>(null);

  const { success, error: showError } = useToast();

  const driverList: Driver[] = Array.isArray(drivers) ? drivers : [];

  const filteredDrivers = driverList.filter(
    (driver) => driver.isVerified === activeTab,
  );

  const handleEdit = (driver: Driver) => {
    setSelectedDriverForEdit(driver);
  };

  const handleSaveEdit = async (updatedData: UpdateDriverInput) => {
    if (!selectedDriverForEdit) return;

    try {
      await updateDriverMutation.mutateAsync({
        id: selectedDriverForEdit.id,
        data: updatedData,
      });

      setSelectedDriverForEdit(null);

      success("Driver berhasil diperbarui.");
    } catch (err) {
      showError(
        `Gagal mengupdate driver, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const loading = isLoading || isFetching;

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Driver</h1>

          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau status operasional driver AngkotGo.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />

          {isFetching ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>
            Gagal memuat data: {error.message || "Terjadi kesalahan."}
          </span>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {/* TER VERIFIKASI */}

        <button
          onClick={() => setActiveTab(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
            activeTab
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
          }`}
        >
          <FiCheckCircle className="w-4 h-4" />
          Terverifikasi (
          {driverList.filter((driver) => driver.isVerified).length})
        </button>

        <button
          onClick={() => setActiveTab(false)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
            !activeTab
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
          }`}
        >
          <FiClock className="w-4 h-4" />
          Belum Terverifikasi (
          {driverList.filter((driver) => !driver.isVerified).length})
        </button>
      </div>

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

                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {driver.nik || "-"}
                    </td>

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

                    <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">
                      {driver.address || "-"}
                    </td>

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

                    <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-amber-600">
                        <FiStar className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />

                        <span>{driver.averageRating ?? 0}</span>
                      </div>

                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {driver.assignmentCount ?? 0} total trip
                      </div>
                    </td>

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

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          disabled={updateDriverMutation.isPending}
                          title="Edit Driver"
                          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
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

      <EditDriverModal
        isOpen={Boolean(selectedDriverForEdit)}
        driver={selectedDriverForEdit}
        onClose={() => setSelectedDriverForEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}