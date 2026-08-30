"use client";

import { CreateTarifModal } from "@/components/tarif/CreateTarifModal";
import { EditTarifModal } from "@/components/tarif/EditTarifModal";
import {
  useTarifs,
  useRegisterTarif,
  useUpdateTarif,
  useDeleteTarif,
} from "@/hooks/useTarif";
import {
  CreateTarifRequest,
  Tarif,
  UpdateTarifRequest,
} from "@/types/tarif.type";
import { useState, useMemo } from "react";
import {
  FiRefreshCw,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
} from "react-icons/fi";

export default function TarifDashBoardPage() {
  // 1. Inisialisasi React Query Hooks
  const { data: tarifData, isLoading: loading, error, refetch } = useTarifs();
  const registerTarifMutation = useRegisterTarif();
  const updateTarifMutation = useUpdateTarif();
  const deleteTarifMutation = useDeleteTarif();

  // 2. Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);

  // 3. Filter & Sort States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Format list data dari response API
  const tarifList: Tarif[] = useMemo(() => {
    if (!tarifData) return [];
    // Jika response API terbungkus (misal: tarifData.data), sesuaikan di sini:
    return Array.isArray(tarifData)
      ? tarifData
      : (tarifData as any)?.data || [];
  }, [tarifData]);

  // Handlers untuk Mutasi Data
  const handleCreateTarif = async (newTarifData: CreateTarifRequest) => {
    try {
      await registerTarifMutation.mutateAsync(newTarifData);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan data tarif.");
    }
  };

  const handleUpdateTarif = async (updatedData: UpdateTarifRequest) => {
    if (!selectedTarif) return;
    try {
      await updateTarifMutation.mutateAsync({
        id: selectedTarif.id,
        data: updatedData,
      });
      setIsUpdateModalOpen(false);
      setSelectedTarif(null);
    } catch (err: any) {
      alert(err?.message || "Gagal memperbarui data tarif.");
    }
  };

  const handleDeleteTarif = async (id: number) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus tarif ini?",
    );
    if (!confirmDelete) return;

    try {
      await deleteTarifMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus data tarif.");
    }
  };

  // 4. Filtering & Sorting Logic
  const filteredTarifs = useMemo(() => {
    return tarifList
      .filter((item) => {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(query);
        const nominalMatch = item.nominal?.toString().includes(query);
        return nameMatch || nominalMatch;
      })
      .sort((a, b) => {
        let valA = a[sortField as keyof Tarif] ?? "";
        let valB = b[sortField as keyof Tarif] ?? "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [tarifList, searchQuery, sortField, sortDirection]);

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarif Angkot</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur Tarif Angkot sesuai dengan rute dan ketentuan yang berlaku.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            title="Refresh Data"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Tarif
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          Gagal memuat data tarif: {(error as Error).message}
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-2 lg:items-center">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tarif berdasarkan nama atau nominal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSortChange("name")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Tarif</span>
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange("nominal")}
                  className="py-4 px-6 cursor-pointer hover:bg-gray-100/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nominal Tarif</span>
                    {sortField === "nominal" &&
                      (sortDirection === "asc" ? (
                        <FiArrowUp className="w-3.5 h-3.5 text-gray-800" />
                      ) : (
                        <FiArrowDown className="w-3.5 h-3.5 text-gray-800" />
                      ))}
                  </div>
                </th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-400">
                    Memuat data tarif...
                  </td>
                </tr>
              ) : filteredTarifs.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    Tidak ada data tarif yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTarifs.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    {/* Nama Tarif */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 shrink-0 transition-colors">
                          <FiTag className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {item.name || "Tanpa Nama"}
                        </span>
                      </div>
                    </td>

                    {/* Nominal */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-gray-700 font-medium">
                        {item.nominal
                          ? `Rp ${Number(item.nominal).toLocaleString("id-ID")}`
                          : "-"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTarif(item);
                            setIsUpdateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTarif(item.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <FiTrash2 className="w-4 h-4" />
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
      {/* MODAL CREATE */}
      <CreateTarifModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTarif}
      />

      {/* MODAL EDIT */}
      {selectedTarif && (
        <EditTarifModal
          isOpen={Boolean(selectedTarif)}
          tarif={selectedTarif}
          onClose={() => setSelectedTarif(null)}
          onSave={handleUpdateTarif}
        />
      )}
    </div>
  );
}
