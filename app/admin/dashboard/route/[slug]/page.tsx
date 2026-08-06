"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { CreateRoutePathInput } from "@/types/routes/route-path.type";
import { DirectionType } from "@/types/vehicle.type";
import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiMapPin,
  FiCompass,
  FiArrowRightCircle,
  FiArrowLeftCircle,
} from "react-icons/fi";
import RoutePathModal from "@/components/route/RoutePath/RoutePathModal";
import RouteMap from "@/components/route/RoutePath/RouteMap";
import Breadcrumb from "@/components/Breadcrumb";

const TABLE_HEADERS = [
  "ID & Urutan",
  "Arah (Direction)",
  "Koordinat (Latitude, Longitude)",
  "Aksi",
];

interface PageProps {
  params: Promise<{
    slug: string | string[];
  }>;
}

export default function RoutePathsBySlugPage({ params }: PageProps) {
  const resolvedParams = use(params);

  const rawSlug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug[resolvedParams.slug.length - 1]
    : resolvedParams.slug;

  const routeIdNum = rawSlug ? Number(rawSlug) : NaN;

  const [activeTab, setActiveTab] = useState<DirectionType>(
    DirectionType.FORWARD,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedPathData, setSelectedPathData] = useState<any>(null);

  const forwardHook = useRoutePaths();
  const returnHook = useRoutePaths();

  const loadData = () => {
    if (!isNaN(routeIdNum)) {
      forwardHook.fetchRoutePaths(routeIdNum, DirectionType.FORWARD);
      returnHook.fetchRoutePaths(routeIdNum, DirectionType.RETURN);
    }
  };

  useEffect(() => {
    loadData();
  }, [routeIdNum]);

  const currentHook =
    activeTab === DirectionType.FORWARD ? forwardHook : returnHook;
  const {
    routePaths,
    loading,
    error,
    createRoutePath,
    updateRoutePath,
    deleteRoutePath,
  } = currentHook;

  // DIUBAH: Dibuat kosong / default dinamis tanpa koordinat hardcoded
  const handleOpenCreateModal = () => {
    setModalMode("CREATE");
    setSelectedPathData({
      latitude: "" as unknown as number, // Dibuat kosong agar diisi user melalui input form
      longitude: "" as unknown as number, // Dibuat kosong agar diisi user melalui input form
      sequenceOrder: routePaths.length + 1,
      direction: activeTab,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (path: any) => {
    setModalMode("EDIT");
    setSelectedPathData(path);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: {
    latitude: number;
    longitude: number;
    sequenceOrder: number;
    direction: DirectionType;
  }) => {
    if (isNaN(routeIdNum)) return;

    if (modalMode === "CREATE") {
      const input: CreateRoutePathInput = {
        routeId: routeIdNum,
        ...data,
      };
      await createRoutePath(input);
    } else if (modalMode === "EDIT" && selectedPathData) {
      if (updateRoutePath) {
        await updateRoutePath(selectedPathData.id, {
          routeId: routeIdNum,
          ...data,
        });
      } else {
        alert("Fungsi updateRoutePath belum tersedia pada hook.");
      }
    }
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus titik jalur ini?")) {
      try {
        await deleteRoutePath(id);
        loadData();
      } catch (err) {
        console.error("Gagal menghapus route path:", err);
      }
    }
  };

  if (isNaN(routeIdNum)) {
    return (
      <div className="p-6 max-w-[1700px] mx-auto space-y-6">
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Slug / Route ID pada URL tidak valid ({String(rawSlug)}). Pastikan
            folder dinamis dinamai <code>[slug]</code>.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Daftar Trayek (Routes)", href: "/admin/dashboard/route" },
          { label: `Route Path #${routeIdNum}` },
        ]}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Jalur Trayek (Route Paths)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola titik koordinat jalur untuk Route ID{" "}
            <span className="font-semibold text-gray-800">{routeIdNum}</span>{" "}
            (Slug: {rawSlug}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Titik Jalur ({activeTab})
          </button>
          <button
            onClick={loadData}
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

      {/* TAB SEGMENTED CONTROL */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {[
          {
            label: "Forward (Pergi)",
            value: DirectionType.FORWARD,
            icon: FiArrowRightCircle,
            count: forwardHook.routePaths.length,
          },
          {
            label: "Return (Pulang)",
            value: DirectionType.RETURN,
            icon: FiArrowLeftCircle,
            count: returnHook.routePaths.length,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
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

      {/* VISUALISASI PETA LEAFLET */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
        <div className="mb-3 flex justify-between items-center px-2">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-blue-600" />
            Visualisasi Peta Jalur ({activeTab})
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            Total Titik: {routePaths.length}
          </span>
        </div>

        <RouteMap routePaths={routePaths} activeTab={activeTab} />
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
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memuat data jalur trayek {activeTab}...</span>
                    </div>
                  </td>
                </tr>
              ) : routePaths.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Tidak ada data jalur trayek untuk arah{" "}
                    <span className="font-bold">{activeTab}</span> pada Route ID{" "}
                    {routeIdNum}.
                  </td>
                </tr>
              ) : (
                routePaths.map((path: any) => (
                  <tr
                    key={path.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    {/* ID & Urutan */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                          <FiMapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 font-mono">
                            Urutan: #{path.sequenceOrder}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: #{path.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Direction */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          path.direction === DirectionType.FORWARD
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <FiCompass className="w-3 h-3" />
                        {path.direction}
                      </span>
                    </td>

                    {/* Latitude & Longitude */}
                    <td className="py-4 px-6 text-xs font-mono text-gray-600">
                      <div>Lat: {path.latitude}</div>
                      <div className="text-gray-400 mt-0.5">
                        Lng: {path.longitude}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/route-paths/detail/${path.id}`}
                          title="Detail Titik Jalur"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(path)}
                          title="Edit Titik Jalur"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(path.id)}
                          title="Hapus Titik Jalur"
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

      {/* MODAL COMPONENT */}
      <RoutePathModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedPathData}
        mode={modalMode}
        routeId={routeIdNum}
        defaultDirection={activeTab}
      />
    </div>
  );
}