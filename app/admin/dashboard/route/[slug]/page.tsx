"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import RoutePathModal from "@/components/route/RoutePath/RoutePathModal";

// Import Leaflet secara dinamis khusus client-side untuk menghindari error SSR Next.js
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Komponen tambahan untuk mengatur animasi/fokus center dan auto zoom peta secara dinamis
import { useMap } from "react-leaflet";
function MapController({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      if (coordinates.length === 1) {
        // Jika hanya ada 1 titik, langsung set view ke titik tersebut dengan zoom 15
        map.setView(coordinates[0], 15, { animate: true });
      } else {
        // Jika ada banyak titik, otomatis fit bounds agar semua titik masuk ke dalam frame peta
        map.fitBounds(coordinates, {
          padding: [50, 50], // Memberikan jarak/margin pinggir dalam piksel agar marker tidak mepet tepi peta
          animate: true,
          maxZoom: 16, // Batas maksimal zoom agar tidak terlalu dekat jika titiknya saling berdekatan
        });
      }
    }
  }, [coordinates, map]);
  return null;
}

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
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Import leaflet secara dinamis untuk kustomisasi DivIcon marker
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

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

  const handleOpenCreateModal = () => {
    setModalMode("CREATE");
    setSelectedPathData({
      latitude: -7.9666,
      longitude: 112.6326,
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

  // Persiapan koordinat untuk polyline & center peta
  const sortedRoutePaths = [...routePaths].sort(
    (a: any, b: any) => a.sequenceOrder - b.sequenceOrder,
  );
  const polylineCoordinates = sortedRoutePaths.map(
    (path: any) => [path.latitude, path.longitude] as [number, number],
  );

  const defaultCenter: [number, number] =
    routePaths.length > 0
      ? [routePaths[0].latitude, routePaths[0].longitude]
      : [-7.9666, 112.6326]; // Default Malang

  // Membuat Custom Marker Kecil dengan Nomor Sequence di dalamnya
  const createSmallNumberedIcon = (
    sequence: number,
    direction: DirectionType,
  ) => {
    if (!L) return undefined;
    const bgColor = direction === DirectionType.FORWARD ? "#2563eb" : "#d97706";
    return L.divIcon({
      className: "custom-small-marker",
      html: `<div style="
        background-color: ${bgColor};
        color: white;
        border: 1.5px solid white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${sequence}</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
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
      {/* BREADCRUMB NAVIGATION */}
      <nav className="flex items-center text-sm font-medium text-gray-500 space-x-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <FiHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <FiChevronRight className="w-4 h-4 text-gray-400" />
        <Link href="/routes" className="hover:text-blue-600 transition-colors">
          Daftar Trayek (Routes)
        </Link>
        <FiChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-semibold">
          Route Path #{routeIdNum}
        </span>
      </nav>

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

      {/* VISUALISASI PETA LEAFLET (Dengan Auto Center & Auto Zoom / Fit Bounds) */}
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
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100 z-0 relative">
          {isMounted && L && (
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom={false}
            >
              {/* Controller otomatis center & zoom berdasarkan koordinat titik jalur */}
              <MapController coordinates={polylineCoordinates} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {polylineCoordinates.length > 0 && (
                <Polyline
                  positions={polylineCoordinates}
                  color={
                    activeTab === DirectionType.FORWARD ? "#2563eb" : "#d97706"
                  }
                  weight={3}
                />
              )}
              {routePaths.map((path: any) => {
                const smallIcon = createSmallNumberedIcon(
                  path.sequenceOrder,
                  path.direction,
                );
                return (
                  <Marker
                    key={path.id}
                    position={[path.latitude, path.longitude]}
                    {...(smallIcon ? { icon: smallIcon } : {})}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <p className="font-bold">
                          Urutan: #{path.sequenceOrder}
                        </p>
                        <p>Arah: {path.direction}</p>
                        <p className="font-mono text-gray-500">
                          Lat: {path.latitude}, Lng: {path.longitude}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
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