"use client";

import { useState } from "react";
import { Conductor, UpdateConductorInput } from "@/types/conductor.type";
import {
  useConductors,
  useUpdateConductor,
  useDeleteConductor,
} from "@/hooks/useConductors";
import { EditConductorModal } from "@/components/conductor/EditConductorModal";
import {
  FiRefreshCw,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

const TABLE_HEADERS = [
  "Kondektur & Kontak",
  "NIK",
  "Alamat",
  "Jumlah Penugasan",
  "Status Akun",
  "Verifikasi",
  "Waktu (Dibuat/Diubah)",
  "Aksi",
];

export default function ConductorsDashboardPage() {
  const {
    data: conductors = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useConductors();

  const updateMutation = useUpdateConductor();
  const deleteMutation = useDeleteConductor();

  const [activeTab, setActiveTab] = useState<boolean>(true);

  const [selectedConductorForEdit, setSelectedConductorForEdit] =
    useState<Conductor | null>(null);
  const { success, error: showError } = useToast();
  const conductorList: Conductor[] = Array.isArray(conductors)
    ? conductors.map((item) => ({
        ...item,
        isVerified: Boolean(item.isVerified),
      }))
    : [];

  const filteredConductors = conductorList.filter(
    (conductor) => conductor.isVerified === activeTab,
  );

  const handleEdit = (conductor: Conductor) => {
    setSelectedConductorForEdit(conductor);
  };

  const handleSaveEdit = async (updatedData: UpdateConductorInput) => {
    if (!selectedConductorForEdit) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedConductorForEdit.id,
        data: updatedData,
      });

      setSelectedConductorForEdit(null);

      success("Kondektur berhasil diperbarui.");
    } catch (err) {
      showError(
        `Gagal mengupdate kondektur, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kondektur ini?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);

      success("Kondektur berhasil dihapus.");
    } catch (err) {
      showError(
        `Gagal menghapus kondektur, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      success("Data kondektur berhasil diperbarui.");
    } catch (err) {
      showError("Gagal memperbarui data kondektur.");
    }
  };

  const errorMessage =
    error instanceof Error ? error.message : "Gagal memuat data kondektur.";

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Kondektur
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh informasi operasional kondektur AngkotGo.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />

          {isFetching ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>Gagal memuat data: {errorMessage}</span>
        </div>
      )}

      {updateMutation.isError && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>Gagal memperbarui data kondektur.</span>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {[
          {
            label: "Terverifikasi",
            value: true,
            icon: FiCheckCircle,
            count: conductorList.filter((c) => c.isVerified).length,
          },
          {
            label: "Belum Terverifikasi",
            value: false,
            icon: FiClock,
            count: conductorList.filter((c) => !c.isVerified).length,
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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* TABLE HEADER */}

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

              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />

                      <span>Memuat data kondektur...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConductors.length === 0 ? (
                /* EMPTY */

                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada data kondektur untuk kategori ini.
                  </td>
                </tr>
              ) : (
                /* DATA */

                filteredConductors.map((conductor) => (
                  <tr
                    key={conductor.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    {/* ================================================= */}
                    {/* KONDEKTUR & KONTAK */}
                    {/* ================================================= */}

                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {conductor.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {conductor.email}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mt-1">
                        <FiPhone className="w-3 h-3" />

                        <span>{conductor.phone || "-"}</span>
                      </div>
                    </td>

                    {/* ================================================= */}
                    {/* NIK */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {conductor.nik || "-"}
                    </td>

                    {/* ================================================= */}
                    {/* ALAMAT */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 text-xs text-gray-500 max-w-xs">
                      <div className="flex items-start gap-1">
                        <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />

                        <span>{conductor.address || "-"}</span>
                      </div>
                    </td>

                    {/* ================================================= */}
                    {/* STATISTIK */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">
                        {conductor.assignmentCount}
                      </div>

                      {/* <div className="text-[11px] text-gray-400 mt-0.5">
                        {conductor.assignments?.length ?? 0} Penugasan Kendaraan
                      </div> */}
                    </td>

                    {/* ================================================= */}
                    {/* STATUS AKUN */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          conductor.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-700"
                            : conductor.status === "OFF_DUTY"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {conductor.status}
                      </span>
                    </td>

                    {/* ================================================= */}
                    {/* VERIFIKASI */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          conductor.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {conductor.isVerified ? (
                          <FiCheckCircle className="w-3 h-3" />
                        ) : (
                          <FiClock className="w-3 h-3" />
                        )}

                        {conductor.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    {/* ================================================= */}
                    {/* WAKTU */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />

                        <span>
                          Dibuat:{" "}
                          {new Date(conductor.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                      </div>

                      <div className="text-gray-400 mt-0.5">
                        Diubah:{" "}
                        {new Date(conductor.updatedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </div>
                    </td>

                    {/* ================================================= */}
                    {/* AKSI */}
                    {/* ================================================= */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* EDIT */}

                        <button
                          onClick={() => handleEdit(conductor)}
                          disabled={
                            updateMutation.isPending || deleteMutation.isPending
                          }
                          title="Edit Kondektur"
                          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() => handleDelete(conductor.id)}
                          disabled={deleteMutation.isPending}
                          title="Hapus Kondektur"
                          className="p-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-rose-600 rounded-lg transition-colors"
                        >
                          {deleteMutation.isPending ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
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

      {/* ====================================================== */}
      {/* EDIT MODAL */}
      {/* ====================================================== */}

      {selectedConductorForEdit && (
        <EditConductorModal
          isOpen={Boolean(selectedConductorForEdit)}
          conductor={selectedConductorForEdit}
          onClose={() => setSelectedConductorForEdit(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
