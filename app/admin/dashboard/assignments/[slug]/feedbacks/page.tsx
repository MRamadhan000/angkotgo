"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiStar,
  FiMessageSquare,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiActivity,
  FiTag,
  FiClock,
  FiDownload,
  FiAward,
  FiUserCheck,
  FiTruck,
  FiCompass,
  FiXCircle,
  FiPieChart,
} from "react-icons/fi";

/* =========================================================
   1. TYPES (MATCHING BACKEND API RESPONSE)
   ========================================================= */

export interface ApiFeedback {
  id: string;
  vehicleAssignmentId: number;
  rating: number; // 1 - 5
  tags: string[];
  experience: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

/* =========================================================
   2. CATEGORIZED TAG DEFINITIONS (12 TAG RESMI)
   ========================================================= */

const TAG_CATEGORIES = {
  DRIVER: {
    label: "Pengemudi",
    icon: FiUserCheck,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    activeColor: "bg-blue-600 text-white border-blue-600",
    tags: ["Ramah dan sopan", "Berkendara aman", "Ugal-ugalan", "Kurang ramah"],
  },
  VEHICLE: {
    label: "Kondisi Angkot",
    icon: FiTruck,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    activeColor: "bg-purple-600 text-white border-purple-600",
    tags: ["Angkot bersih", "Nyaman", "Angkot kotor", "Kurang terawat"],
  },
  TRIP: {
    label: "Pengalaman Perjalanan",
    icon: FiCompass,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    activeColor: "bg-amber-600 text-white border-amber-600",
    tags: ["Tepat waktu", "Tarif sesuai", "Terlalu penuh", "Menunggu lama"],
  },
};

function getTagCategoryKey(
  tag: string,
): "DRIVER" | "VEHICLE" | "TRIP" | "OTHER" {
  if (TAG_CATEGORIES.DRIVER.tags.includes(tag)) return "DRIVER";
  if (TAG_CATEGORIES.VEHICLE.tags.includes(tag)) return "VEHICLE";
  if (TAG_CATEGORIES.TRIP.tags.includes(tag)) return "TRIP";
  return "OTHER";
}

/* =========================================================
   3. API LAYER & CONFIG
   ========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchAssignmentFeedbacks(
  assignmentId: number,
): Promise<ApiFeedback[]> {
  const res = await fetch(`${API_URL}/feedbacks/assignment/${assignmentId}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : (json?.message ?? `Gagal mengambil data ulasan (${res.status})`);
    throw new Error(msg);
  }

  return (json as ApiResponse<ApiFeedback[]>).data ?? [];
}

/* =========================================================
   4. ENTRY POINT WITH PROVIDER
   ========================================================= */

export default function AssignmentFeedbackAnalyticsPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackAnalyticsContent />
    </QueryClientProvider>
  );
}

/* =========================================================
   5. MAIN DASHBOARD CONTENT
   ========================================================= */

function FeedbackAnalyticsContent() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const assignmentId = Number(params?.id ?? 10);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [selectedTag, setSelectedTag] = useState<string | "ALL">("ALL");

  // ADD: state donut interaktif
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [donutAnimated, setDonutAnimated] = useState(false);

  // ADD: animasi "menggambar" donut saat pertama tampil
  useEffect(() => {
    const id = requestAnimationFrame(() => setDonutAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // TanStack Query
  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["assignment-feedbacks", assignmentId],
    queryFn: () => fetchAssignmentFeedbacks(assignmentId),
    enabled: Number.isFinite(assignmentId),
  });

  /* ---------------------------------------------------------
     DERIVED STATS & ANALYTICS CALCULATIONS
  --------------------------------------------------------- */
  const analytics = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) {
      return {
        averageRating: 0,
        total,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        tagCounts: {} as Record<string, number>,
      };
    }

    let ratingSum = 0;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const tagCounts: Record<string, number> = {};

    for (const f of feedbacks) {
      ratingSum += f.rating;
      if (f.rating in dist) {
        dist[f.rating as keyof typeof dist] += 1;
      }
      if (f.rating >= 4) positiveCount += 1;
      else if (f.rating <= 2) negativeCount += 1;
      else neutralCount += 1;

      for (const tag of f.tags || []) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const averageRating = Number((ratingSum / total).toFixed(1));

    return {
      averageRating,
      total,
      distribution: dist,
      positiveCount,
      negativeCount,
      neutralCount,
      tagCounts,
    };
  }, [feedbacks]);

  // Filtered List
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesRating = ratingFilter === "ALL" || f.rating === ratingFilter;
      const matchesTag =
        selectedTag === "ALL" || (f.tags && f.tags.includes(selectedTag));
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (f.experience && f.experience.toLowerCase().includes(searchLower)) ||
        f.tags.some((t) => t.toLowerCase().includes(searchLower));

      return matchesRating && matchesTag && matchesSearch;
    });
  }, [feedbacks, ratingFilter, selectedTag, searchTerm]);

  // Calculations for Donut SVG
  const donutSegments = useMemo(() => {
    if (analytics.total === 0) return [];

    // Total perimeter for r=40 is 2 * PI * 40 ≈ 251.327
    const circumference = 251.327;
    let currentOffset = 0;

    const colors = {
      5: "#10B981", // Emerald
      4: "#3B82F6", // Blue
      3: "#F59E0B", // Amber
      2: "#F97316", // Orange
      1: "#EF4444", // Red
    };

    const labels = {
      5: "Sangat puas",
      4: "Puas",
      3: "Biasa",
      2: "Kurang puas",
      1: "Tidak puas",
    };

    // ADD: celah kecil antar segmen jika ada lebih dari satu segmen terisi
    const nonZero = [5, 4, 3, 2, 1].filter(
      (s) =>
        analytics.distribution[s as keyof typeof analytics.distribution] > 0,
    ).length;
    const gap = nonZero > 1 ? 2 : 0;

    return [5, 4, 3, 2, 1].map((star) => {
      const count =
        analytics.distribution[star as keyof typeof analytics.distribution];
      const pct = count / analytics.total;
      const segLength = pct * circumference;
      const strokeDashoffset = -currentOffset;
      currentOffset += segLength;

      return {
        star,
        count,
        pct: Math.round(pct * 100),
        color: colors[star as keyof typeof colors],
        label: labels[star as keyof typeof labels],
        length: Math.max(0, segLength - gap),
        circumference,
        strokeDashoffset,
      };
    });
  }, [analytics]);

  // ADD: segmen yang sedang aktif (hover > filter rating terpilih)
  const activeStar =
    hoveredStar ?? (ratingFilter !== "ALL" ? ratingFilter : null);
  const activeSegment =
    donutSegments.find((s) => s.star === activeStar) ?? null;

  // ADD: klik segmen / legend = filter rating (klik lagi untuk reset)
  const toggleRatingFilter = (star: number) => {
    setRatingFilter((prev) => (prev === star ? "ALL" : star));
  };

  // CSV Export
  const exportToCSV = () => {
    if (feedbacks.length === 0) return;

    const headers = [
      "ID Ulasan",
      "Penugasan ID",
      "Rating",
      "Tag Ulasan",
      "Catatan Pengalaman",
      "Waktu Dikirim",
    ];

    const rows = feedbacks.map((f) => [
      f.id,
      f.vehicleAssignmentId,
      f.rating,
      `"${f.tags.join("; ")}"`,
      `"${(f.experience || "").replace(/"/g, '""')}"`,
      new Date(f.createdAt).toLocaleString("id-ID"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_ulasan_assignment_${assignmentId}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------------------------------------------------
     LOADING & ERROR STATES
  --------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500 font-sans">
        <FiRefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Memuat Ulasan Penumpang...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
          <FiAlertTriangle size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Gagal Memuat Laporan Ulasan
          </h2>
          <p className="max-w-md text-xs text-slate-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan sistem."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition"
          >
            Kembali
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/60 font-sans text-slate-900 antialiased pb-12">
      {/* ---------------------------------------------------------
          HEADER & TOOLBAR
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
                  Ulasan & Rating Penugasan #{assignmentId}
                </h1>
                <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  <FiActivity className="h-3 w-3" /> Live Feedbacks
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Analisis kepuasan & catatan pengalaman penumpang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={feedbacks.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {/* ---------------------------------------------------------
            EXECUTIVE RATING OVERVIEW SECTION (2 COLUMN BALANCED LAYOUT)
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Card 1: Main Average Rating Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg shadow-amber-500/20">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                <FiAward size={14} /> Skor Kepuasan Rata-rata
              </span>
              <div className="mt-4 flex items-baseline gap-3">
                <h2 className="text-5xl font-black tracking-tight">
                  {analytics.averageRating}
                </h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-200 text-lg">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FiStar
                        key={i}
                        className={
                          i < Math.round(analytics.averageRating)
                            ? "fill-white text-white"
                            : "text-white/40"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-amber-100">
                    Berdasarkan {analytics.total} total ulasan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Donut Chart Interaktif & Proporsi Rating */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiPieChart className="text-blue-600" /> Donut Proporsi Rating
              </h3>

              {ratingFilter !== "ALL" ? (
                <button
                  onClick={() => setRatingFilter("ALL")}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95"
                >
                  <span>Filter ★{ratingFilter}</span>
                  <FiXCircle className="h-3.5 w-3.5 text-blue-600" />
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">
                  Klik segmen untuk memfilter ulasan
                </span>
              )}
            </div>

            <div className="flex items-center justify-around gap-4 my-auto">
              {/* Donut SVG Chart */}
              <div className="relative h-36 w-36 shrink-0">
                <svg
                  className="h-full w-full -rotate-90 overflow-visible"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Donut proporsi rating ulasan"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                  />
                  {/* segmen aktif digambar terakhir agar tampil di atas */}
                  {[...donutSegments]
                    .filter((seg) => seg.count > 0)
                    .sort(
                      (a, b) =>
                        Number(a.star === activeStar) -
                        Number(b.star === activeStar),
                    )
                    .map((seg, idx) => {
                      const isActive = activeStar === seg.star;
                      const isDimmed = activeStar !== null && !isActive;
                      return (
                        <circle
                          key={seg.star}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={isActive ? 19 : 14}
                          strokeDasharray={`${donutAnimated ? seg.length : 0} ${seg.circumference}`}
                          strokeDashoffset={seg.strokeDashoffset}
                          pointerEvents="stroke"
                          tabIndex={0}
                          role="button"
                          aria-pressed={ratingFilter === seg.star}
                          aria-label={`Bintang ${seg.star}: ${seg.count} ulasan (${seg.pct}%)`}
                          opacity={isDimmed ? 0.3 : 1}
                          onMouseEnter={() => setHoveredStar(seg.star)}
                          onMouseLeave={() => setHoveredStar(null)}
                          onFocus={() => setHoveredStar(seg.star)}
                          onBlur={() => setHoveredStar(null)}
                          onClick={() => toggleRatingFilter(seg.star)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleRatingFilter(seg.star);
                            }
                          }}
                          style={{
                            cursor: "pointer",
                            outline: "none",
                            transition:
                              "stroke-dasharray 800ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 180ms ease, opacity 180ms ease",
                            transitionDelay: donutAnimated
                              ? `${idx * 60}ms, 0ms, 0ms`
                              : "0ms",
                          }}
                        />
                      );
                    })}
                </svg>

                {/* Teks tengah: berubah sesuai segmen aktif */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  {activeSegment ? (
                    <>
                      <span
                        className="text-xl font-black leading-none"
                        style={{ color: activeSegment.color }}
                      >
                        ★{activeSegment.star}
                      </span>
                      <span className="mt-1 text-sm font-black text-slate-900">
                        {activeSegment.count} ulasan
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {activeSegment.pct}% • {activeSegment.label}
                      </span>
                    </>
                  ) : analytics.total === 0 ? (
                    <span className="px-4 text-[10px] font-bold text-slate-400">
                      Belum ada ulasan
                    </span>
                  ) : (
                    <>
                      <span className="text-xl font-black text-slate-900">
                        {analytics.total}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Ulasan
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend Items (sinkron dengan donut) */}
              <div className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-x-3">
                {donutSegments.map((seg) => {
                  const isActive = activeStar === seg.star;
                  const isDimmed = activeStar !== null && !isActive;
                  return (
                    <button
                      key={seg.star}
                      type="button"
                      disabled={seg.count === 0}
                      onMouseEnter={() => setHoveredStar(seg.star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onFocus={() => setHoveredStar(seg.star)}
                      onBlur={() => setHoveredStar(null)}
                      onClick={() => toggleRatingFilter(seg.star)}
                      aria-pressed={ratingFilter === seg.star}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-left transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                        isActive
                          ? "border-slate-300 bg-slate-50 shadow-sm"
                          : "border-transparent hover:bg-slate-50"
                      } ${isDimmed ? "opacity-50" : ""}`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold text-slate-700 w-7">
                        ★{seg.star}
                      </span>
                      <span className="font-semibold text-slate-500">
                        {seg.count} ({seg.pct}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            CATEGORIZED TAG ANALYTICS & FILTER BAR
        --------------------------------------------------------- */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FiTag className="text-blue-600" /> Filter Berdasarkan Tag
              Kategori
            </h3>

            {/* Indicator / Reset Tag Active */}
            {selectedTag !== "ALL" && (
              <button
                onClick={() => setSelectedTag("ALL")}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95"
              >
                <span>Filter Active: "{selectedTag}"</span>
                <FiXCircle className="h-3.5 w-3.5 text-blue-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(TAG_CATEGORIES).map(([key, cat]) => {
              const IconComp = cat.icon;

              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 border-b border-slate-200/60 pb-2">
                    <IconComp className="text-slate-600" size={15} />
                    <span>{cat.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((tag) => {
                      const count = analytics.tagCounts[tag] || 0;
                      const isSelected = selectedTag === tag;

                      return (
                        <button
                          key={tag}
                          onClick={() =>
                            setSelectedTag((prev) =>
                              prev === tag ? "ALL" : tag,
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition active:scale-95 ${
                            isSelected
                              ? cat.activeColor
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span>{tag}</span>
                          <span
                            className={`rounded-full px-1.5 py-px text-[9px] font-black ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------
            FEEDBACK LIST & SEARCH/FILTERS
        --------------------------------------------------------- */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Riwayat Ulasan Penumpang
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredFeedbacks.length} dari {feedbacks.length}{" "}
                total ulasan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kata kunci pengalaman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Filter Rating Buttons */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <FiFilter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                {(["ALL", 5, 4, 3, 2, 1] as const).map((r) => (
                  <button
                    key={String(r)}
                    onClick={() => setRatingFilter(r)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                      ratingFilter === r
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {r === "ALL" ? "Semua" : `★${r}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedbacks Grid / Cards */}
          <div className="p-4 sm:p-5">
            {filteredFeedbacks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <FiMessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600">
                  Tidak Ada Ulasan Ditemukan
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Coba sesuaikan pencarian atau filter Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredFeedbacks.map((item) => {
                  const isGood = item.rating >= 4;
                  const isBad = item.rating <= 2;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4.5 transition-all hover:shadow-md ${
                        isGood
                          ? "border-emerald-100 bg-emerald-50/20"
                          : isBad
                            ? "border-rose-100 bg-rose-50/20"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Card Top Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FiStar
                                key={i}
                                className={`h-4 w-4 ${
                                  i < item.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                            <span className="ml-1.5 text-xs font-black text-slate-900">
                              {item.rating}.0
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <FiClock className="h-3 w-3" />
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>

                        {/* Experience Text */}
                        <p className="text-xs leading-relaxed text-slate-800 font-medium">
                          {item.experience || "Tidak ada catatan pengalaman."}
                        </p>

                        {/* Categorized Tags Badges */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.tags.map((tag) => {
                              const catKey = getTagCategoryKey(tag);
                              const catStyle =
                                catKey === "DRIVER"
                                  ? "bg-blue-100 text-blue-800"
                                  : catKey === "VEHICLE"
                                    ? "bg-purple-100 text-purple-800"
                                    : catKey === "TRIP"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-800";

                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${catStyle}`}
                                >
                                  <FiTag className="h-2.5 w-2.5 opacity-70" />
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   6. HELPER UTILS
   ========================================================= */

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return iso;
  }
}
