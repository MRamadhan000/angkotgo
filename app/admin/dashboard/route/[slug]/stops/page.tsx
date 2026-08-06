"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { CreateRouteStopInput } from "@/types/routes/route-stop.type";
import { DirectionType } from "@/types/vehicle.type";
import { useRouteStops } from "@/hooks/routes/useRouteStops";
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
import RouteStopModal from "@/components/route/RouteStop/RouteStopModal";
import RouteMap from "@/components/route/RoutePath/RouteMap";
import Breadcrumb from "@/components/Breadcrumb";

const TABLE_HEADERS = [
  "Urutan & Halte",
  "Koordinat (Latitude, Longitude)",
  "Aksi",
];

interface PageProps {
  params: Promise<{
    slug: string | string[];
  }>;
}

export default function RouteStopsBySlugPage({ params }: PageProps) {
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
  const [selectedStopData, setSelectedStopData] = useState<any>(null);

  const forwardHook = useRouteStops();
  const returnHook = useRouteStops();

  const loadData = () => {
    if (!isNaN(routeIdNum)) {
      forwardHook.fetchRouteStops(routeIdNum, DirectionType.FORWARD);
      returnHook.fetchRouteStops(routeIdNum, DirectionType.RETURN);
    }
  };

  useEffect(() => {
    loadData();
  }, [routeIdNum]);

  const currentHook =
    activeTab === DirectionType.FORWARD ? forwardHook : returnHook;
  const {
    routeStops,
    loading,
    error,
    createRouteStop,
    updateRouteStop,
    deleteRouteStop,
  } = currentHook;

  const handleOpenCreateModal = () => {
    setModalMode("CREATE");
    setSelectedStopData({
      stopName: "",
      latitude: "" as unknown as number,
      longitude: "" as unknown as number,
      stopOrder: routeStops.length + 1,
      direction: activeTab,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stop: any) => {
    setModalMode("EDIT");
    setSelectedStopData(stop);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: {
    stopName: string;
    latitude: number;
    longitude: number;
    stopOrder: number;
    direction: DirectionType;
  }) => {
    if (isNaN(routeIdNum)) return;

    if (modalMode === "CREATE") {
      const input: CreateRouteStopInput = {
        routeId: routeIdNum,
        ...data,
      };
      await createRouteStop(input);
    } else if (modalMode === "EDIT" && selectedStopData) {
      if (updateRouteStop) {
        await updateRouteStop(selectedStopData.id, {
          routeId: routeIdNum,
          ...data,
        });
      } else {
        alert("Fungsi updateRouteStop belum tersedia pada hook.");
      }
    }
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data halte ini?")) {
      try {
        await deleteRouteStop(id);
        loadData();
      } catch (err) {
        console.error("Gagal menghapus route stop:", err);
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
          { label: `Route Stops #${routeIdNum}` },
        ]}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Halte Trayek (Route Stops)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola titik pemberhentian/halte untuk Route ID{" "}
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
            Tambah Halte ({activeTab})
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
            count: forwardHook.routeStops.length,
          },
          {
            label: "Return (Pulang)",
            value: DirectionType.RETURN,
            icon: FiArrowLeftCircle,
            count: returnHook.routeStops.length,
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

      {/* MAIN LAYOUT: VERTICAL STACK (ATAS: MAPS, BAWAH: TABEL) */}
      <div className="space-y-6">
        {/* BAGIAN ATAS: PETA LEAFLET */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="mb-3 flex justify-between items-center px-2">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-blue-600" />
              Visualisasi Peta Halte ({activeTab})
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              Total Titik: {routeStops.length}
            </span>
          </div>

          <div className="w-full h-[450px] rounded-2xl overflow-hidden">
            <RouteMap routePaths={routeStops} activeTab={activeTab} />
          </div>
        </div>

        {/* BAGIAN BAWAH: TABEL DATA */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FiCompass className="w-4 h-4 text-blue-600" />
              Daftar Halte ({activeTab})
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              Total: {routeStops.length} Halte
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {TABLE_HEADERS.map((header) => (
                    <th key={header} className="py-3 px-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-2">
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        <span>Memuat data halte...</span>
                      </div>
                    </td>
                  </tr>
                ) : routeStops.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400">
                      Tidak ada data halte untuk arah{" "}
                      <span className="font-bold">{activeTab}</span>.
                    </td>
                  </tr>
                ) : (
                  routeStops.map((stop: any) => (
                    <tr
                      key={stop.id}
                      className="hover:bg-gray-50/40 transition-colors align-middle"
                    >
                      {/* Urutan & Nama Halte */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                            <FiMapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-xs">
                              {stop.stopName}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Urutan: #{stop.stopOrder} • ID: {stop.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Latitude & Longitude */}
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        <div>Lat: {stop.latitude}</div>
                        <div className="text-gray-400 mt-0.5">
                          Lng: {stop.longitude}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/route-stops/detail/${stop.id}`}
                            title="Detail Halte"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center justify-center"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(stop)}
                            title="Edit Halte"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stop.id)}
                            title="Hapus Halte"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
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
      </div>

      {/* MODAL COMPONENT */}
      <RouteStopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedStopData}
        mode={modalMode}
        routeId={routeIdNum}
        defaultDirection={activeTab}
      />
    </div>
  );
}