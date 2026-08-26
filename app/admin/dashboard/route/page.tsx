"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Route,
  UpdateRouteInput,
  CreateRouteInput,
} from "@/types/routes/route.type";
import { useRoutes } from "@/hooks/routes/useRoutes";
import { CreateRouteModal } from "@/components/route/Route/CreateRouteModal";
import { EditRouteModal } from "@/components/route/Route/EditRouteModal";
import { useToast } from "@/context/ToastContext";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiCalendar,
  FiPlus,
  FiNavigation,
  FiLayers,
} from "react-icons/fi";

function extractRouteList(response: unknown): Route[] {
  let rawList: any[] = [];

  if (Array.isArray(response)) {
    rawList = response;
  } else if (response && typeof response === "object" && "data" in response) {
    const maybeData = (response as { data: unknown }).data;
    if (Array.isArray(maybeData)) {
      rawList = maybeData as Route[];
    }
  }

  return rawList;
}

const TABLE_HEADERS = [
  "Kode Trayek",
  "Nama Trayek",
  "Waktu (Dibuat / Diubah)",
  "Route Path",
  "Route Stop",
  "Aksi",
];

export default function RoutesDashboardPage() {
  const {
    routes,
    createRoute,
    updateRoute,
    deleteRoute,
    loading,
    error,
    fetchRoutes,
  } = useRoutes();

  const routeList: Route[] = extractRouteList(routes);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedRouteForEdit, setSelectedRouteForEdit] =
    useState<Route | null>(null);

  const toast = useToast();

  const handleCreate = async (data: CreateRouteInput) => {
    try {
      await createRoute(data);
      fetchRoutes();
      toast.success("Trayek berhasil dibuat!");
    } catch (err) {
      toast.error(
        "Gagal membuat trayek." + (err instanceof Error ? err.message : ""),
      );
    }
  };

  const handleEdit = (route: Route) => {
    setSelectedRouteForEdit(route);
  };

  const handleSaveEdit = async (updatedData: UpdateRouteInput) => {
    if (!selectedRouteForEdit) return;
    try {
      await updateRoute(selectedRouteForEdit.id, updatedData);
      setSelectedRouteForEdit(null);
      fetchRoutes();
      toast.success("Trayek berhasil diperbarui.");
    } catch (err) {
      toast.error(
        "Gagal memperbarui trayek." + (err instanceof Error ? err.message : ""),
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus trayek ini?")) {
      try {
        await deleteRoute(id);
        fetchRoutes();
        toast.success("Trayek berhasil dihapus.");
      } catch (err) {
        toast.error(
          "Gagal menghapus trayek." + (err instanceof Error ? err.message : ""),
        );
      }
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Trayek</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh informasi rute atau trayek AngkotGo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Trayek
          </button>
          <button
            onClick={fetchRoutes}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

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
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memuat data trayek...</span>
                    </div>
                  </td>
                </tr>
              ) : routeList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data trayek yang tersedia.
                  </td>
                </tr>
              ) : (
                routeList.map((route) => (
                  <tr
                    key={route.id}
                    className="hover:bg-gray-50/40 transition-colors align-middle"
                  >
                    {/* Kode Trayek */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-xs font-bold">
                        {route.routeCode}
                      </span>
                    </td>

                    {/* Nama Trayek */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{route.routeName}</span>
                      </div>
                    </td>

                    {/* Waktu */}
                    <td className="py-4 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span>
                          Dibuat:{" "}
                          {new Date(route.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        Diubah:{" "}
                        {new Date(route.updatedAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>

                    {/* Kolom Route Path (Ikon Saja) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/route/${route.id}/points`}
                        title="Lihat Detail Route Path"
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <FiNavigation className="w-4 h-4" />
                      </Link>
                    </td>

                    {/* Kolom Route Stop (Ikon Saja) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/route/${route.id}/stops`}
                        title="Lihat Detail Route Stop"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <FiLayers className="w-4 h-4" />
                      </Link>
                    </td>

                    {/* Kolom Aksi (Detail Umum, Edit, Delete) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(route)}
                          title="Edit Trayek"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          title="Hapus Trayek"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
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
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* MODAL EDIT */}
      {selectedRouteForEdit && (
        <EditRouteModal
          isOpen={Boolean(selectedRouteForEdit)}
          route={selectedRouteForEdit}
          onClose={() => setSelectedRouteForEdit(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
