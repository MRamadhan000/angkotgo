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
  FiClock,
} from "react-icons/fi";
import RouteStopModal from "@/components/route/RouteStop/RouteStopModal";
import RouteMap from "@/components/route/RoutePath/RouteMap";
import Breadcrumb from "@/components/Breadcrumb";
import { useStopIntervals } from "@/hooks/routes/useStopIntervals";
import RouteIntervalModal from "@/components/route/StopInterval/RouteIntervalModal";

const TABLE_HEADERS = [
  "Urutan & Halte",
  "Koordinat (Latitude, Longitude)",
  "Aksi",
];

const INTERVAL_HEADERS = [
  "Dari Halte",
  "Ke Halte",
  "Jarak (Meter)",
  "Durasi (Detik)",
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
    DirectionType.FORWARD
  );

  // State Modal Route Stop
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedStopData, setSelectedStopData] = useState<any>(null);

  // State Modal Stop Interval
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false);
  const [intervalModalMode, setIntervalModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedIntervalData, setSelectedIntervalData] = useState<any>(null);

  // Hook Route Stops
  const forwardHook = useRouteStops();
  const returnHook = useRouteStops();

  // Hook Stop Intervals
  const forwardIntervalHook = useStopIntervals({
    routeId: isNaN(routeIdNum) ? undefined : routeIdNum,
    initialDirection: DirectionType.FORWARD,
  });
  const returnIntervalHook = useStopIntervals({
    routeId: isNaN(routeIdNum) ? undefined : routeIdNum,
    initialDirection: DirectionType.RETURN,
  });

  const loadData = () => {
    if (!isNaN(routeIdNum)) {
      forwardHook.fetchRouteStops(routeIdNum, DirectionType.FORWARD);
      returnHook.fetchRouteStops(routeIdNum, DirectionType.RETURN);
      forwardIntervalHook.refetch();
      returnIntervalHook.refetch();
    }
  };

  useEffect(() => {
    loadData();
  }, [routeIdNum]);

  // Hook Aktif Berdasarkan Tab
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

  // Hook Interval Aktif Berdasarkan Tab
  const currentIntervalHook =
    activeTab === DirectionType.FORWARD ? forwardIntervalHook : returnIntervalHook;
  const {
    intervals,
    loading: intervalLoading,
    error: intervalError,
    createInterval,
    updateInterval,
    deleteInterval,
  } = currentIntervalHook;

  // Handler Modal Route Stop
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

  // Handler Stop Interval Modal
  const handleOpenCreateIntervalModal = () => {
    if (routeStops.length < 2) {
      alert("Minimal harus ada 2 halte terdaftar untuk membuat interval jarak & durasi!");
      return;
    }
    setIntervalModalMode("CREATE");
    setSelectedIntervalData(null);
    setIsIntervalModalOpen(true);
  };

  const handleOpenEditIntervalModal = (intervalItem: any) => {
    setIntervalModalMode("EDIT");
    setSelectedIntervalData(intervalItem);
    setIsIntervalModalOpen(true);
  };

  const handleIntervalModalSubmit = async (data: {
    fromStopId: number;
    toStopId: number;
    distanceInMeters: number;
    durationInSeconds: number;
    direction: DirectionType;
  }) => {
    let res: any;
    if (intervalModalMode === "CREATE") {
      res = await createInterval({
        routeId: routeIdNum,
        ...data,
      });
    } else if (intervalModalMode === "EDIT" && selectedIntervalData) {
      if (updateInterval) {
        res = await updateInterval(selectedIntervalData.id, {
          routeId: routeIdNum,
          ...data,
        });
      } else {
        alert("Fungsi updateInterval belum tersedia pada hook.");
        return;
      }
    }

    if (res?.success !== false) {
      currentIntervalHook.refetch();
    } else {
      alert(res?.message || "Gagal menyimpan interval.");
    }
  };

  const handleDeleteInterval = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data interval ini?")) {
      const res: any = await deleteInterval(id);
      if (res?.success) {
        currentIntervalHook.refetch();
      } else {
        alert(res?.message || "Gagal menghapus interval.");
      }
    }
  };

  // Helper untuk mencocokkan Nama Halte
  const getStopDisplayInfo = (stopId: number, stopRelationObj: any) => {
    if (stopRelationObj && stopRelationObj.stopName) {
      return `${stopRelationObj.stopName} (Urutan #${stopRelationObj.stopOrder || "?"})`;
    }
    const found = [...forwardHook.routeStops, ...returnHook.routeStops].find((s) => s.id === stopId);
    return found ? `${found.stopName} (Urutan #${found.stopOrder})` : `Halte ID: ${stopId}`;
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

  const rawIntervalsData = intervals as any;
  const safeIntervals = Array.isArray(rawIntervalsData)
    ? rawIntervalsData
    : Array.isArray(rawIntervalsData?.data)
    ? rawIntervalsData.data
    : [];

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
            Manajemen Halte Trayek & Interval
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola titik pemberhentian dan durasi interval perjalanan untuk Route ID{" "}
            <span className="font-semibold text-gray-800">{routeIdNum}</span>{" "}
            (Slug: {rawSlug}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {(error || intervalError) && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>Gagal memuat data: {error || intervalError}</span>
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

      {/* MAIN LAYOUT */}
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

        {/* BAGIAN TENGAH: TABEL DAFTAR HALTE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FiCompass className="w-4 h-4 text-blue-600" />
              Daftar Halte ({activeTab})
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">
                Total: {routeStops.length} Halte
              </span>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Tambah Halte
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
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
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        <div>Lat: {stop.latitude}</div>
                        <div className="text-gray-400 mt-0.5">
                          Lng: {stop.longitude}
                        </div>
                      </td>
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

        {/* BAGIAN BAWAH: TABEL INTERVAL ANTAR HALTE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-emerald-600" />
                Interval Waktu & Jarak Antar Halte ({activeTab})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Mengatur estimasi durasi dan jarak fisik antar halte secara berurutan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">
                Total: {safeIntervals.length} Interval
              </span>
              <button
                onClick={handleOpenCreateIntervalModal}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Tambah Interval
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
                <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {INTERVAL_HEADERS.map((header) => (
                    <th key={header} className="py-3 px-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {intervalLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-2">
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        <span>Memuat data interval...</span>
                      </div>
                    </td>
                  </tr>
                ) : safeIntervals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Belum ada data interval jarak/waktu untuk arah{" "}
                      <span className="font-bold">{activeTab}</span>.
                    </td>
                  </tr>
                ) : (
                  safeIntervals.map((item: any) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/40 transition-colors align-middle"
                    >
                      <td className="py-3 px-4 text-xs font-semibold text-gray-900">
                        {getStopDisplayInfo(item.fromStopId, item.fromStop)}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-gray-900">
                        {getStopDisplayInfo(item.toStopId, item.toStop)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        {item.distanceInMeters} meter
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">
                        {item.durationInSeconds} detik ({Math.round(item.durationInSeconds / 60)} menit)
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditIntervalModal(item)}
                            title="Edit Interval"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInterval(item.id)}
                            title="Hapus Interval"
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

      {/* MODAL COMPONENT ROUTE STOP */}
      <RouteStopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedStopData}
        mode={modalMode}
        routeId={routeIdNum}
        defaultDirection={activeTab}
      />

      {/* MODAL COMPONENT ROUTE INTERVAL */}
      <RouteIntervalModal
        isOpen={isIntervalModalOpen}
        onClose={() => setIsIntervalModalOpen(false)}
        onSubmit={handleIntervalModalSubmit}
        routeStops={routeStops}
        defaultDirection={activeTab}
        mode={intervalModalMode}
        initialData={selectedIntervalData}
      />
    </div>
  );
}