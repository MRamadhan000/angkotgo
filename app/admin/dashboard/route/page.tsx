"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Route,
  UpdateRouteInput,
  CreateRouteInput,
} from "@/types/routes/route.type";
import {
  useRoutes,
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
} from "@/hooks/routes/useRoutes";
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
    data: routes = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useRoutes();

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedRouteForEdit, setSelectedRouteForEdit] =
    useState<Route | null>(null);

  const toast = useToast();

  const handleCreate = async (data: CreateRouteInput) => {
    try {
      await createRoute.mutateAsync(data);

      setIsCreateModalOpen(false);

      toast.success("Trayek berhasil dibuat!");
    } catch (err) {
      toast.error(
        `Gagal membuat trayek. ${
          err instanceof Error ? err.message : "Terjadi kesalahan."
        }`,
      );
    }
  };

  const handleEdit = (route: Route) => {
    setSelectedRouteForEdit(route);
  };

  const handleSaveEdit = async (updatedData: UpdateRouteInput) => {
    if (!selectedRouteForEdit) return;

    try {
      await updateRoute.mutateAsync({
        id: selectedRouteForEdit.id,
        data: updatedData,
      });

      setSelectedRouteForEdit(null);

      toast.success("Trayek berhasil diperbarui.");
    } catch (err) {
      toast.error(
        `Gagal memperbarui trayek. ${
          err instanceof Error ? err.message : "Terjadi kesalahan."
        }`,
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus trayek ini?")) {
      return;
    }

    try {
      await deleteRoute.mutateAsync(id);

      toast.success("Trayek berhasil dihapus.");
    } catch (err) {
      toast.error(
        `Gagal menghapus trayek. ${
          err instanceof Error ? err.message : "Terjadi kesalahan."
        }`,
      );
    }
  };

  const errorMessage =
    error instanceof Error ? error.message : "Terjadi kesalahan.";

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
          {/* TAMBAH */}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={createRoute.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Trayek
          </button>

          {/* REFRESH */}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}

      {isError && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>Gagal memuat data: {errorMessage}</span>
        </div>
      )}

      {/* TABLE */}

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
              {/* LOADING */}

              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />

                      <span>Memuat data trayek...</span>
                    </div>
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                /* EMPTY */

                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data trayek yang tersedia.
                  </td>
                </tr>
              ) : (
                /* DATA */

                routes.map((route) => (
                  <tr
                    key={route.id}
                    className="hover:bg-gray-50/40 transition-colors align-middle"
                  >
                    {/* KODE TRAYEK */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-xs font-bold">
                        {route.routeCode}
                      </span>
                    </td>

                    {/* NAMA TRAYEK */}

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" />

                        <span>{route.routeName}</span>
                      </div>
                    </td>

                    {/* WAKTU */}

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

                    {/* ROUTE PATH */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/route/${route.id}/points`}
                        title="Lihat Detail Route Path"
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <FiNavigation className="w-4 h-4" />
                      </Link>
                    </td>

                    {/* ROUTE STOP */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/route/${route.id}/stops`}
                        title="Lihat Detail Route Stop"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <FiLayers className="w-4 h-4" />
                      </Link>
                    </td>

                    {/* AKSI */}

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* EDIT */}

                        <button
                          onClick={() => handleEdit(route)}
                          disabled={updateRoute.isPending}
                          title="Edit Trayek"
                          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() => handleDelete(route.id)}
                          disabled={deleteRoute.isPending}
                          title="Hapus Trayek"
                          className="p-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 rounded-lg transition-colors"
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

      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      <EditRouteModal
        isOpen={Boolean(selectedRouteForEdit)}
        route={selectedRouteForEdit}
        onClose={() => setSelectedRouteForEdit(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}