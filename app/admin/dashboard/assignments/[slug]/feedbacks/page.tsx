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
  const params = useParams();

  // BACA SLUG / PARAMETER SECARA DINAMIS
  const rawId = params?.id ?? params?.assignmentId ?? params?.slug;
  const assignmentId = useMemo(() => {
    if (!rawId) return NaN;
    const parsed = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawId]);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [selectedTag, setSelectedTag] = useState<string | "ALL">("ALL");

  // State Donut Interaktif
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [donutAnimated, setDonutAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDonutAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // TanStack Query (Hanya aktif jika assignmentId valid)
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
    enabled: Number.isFinite(assignmentId) && assignmentId > 0,
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

  const activeStar =
    hoveredStar ?? (ratingFilter !== "ALL" ? ratingFilter : null);
  const activeSegment =
    donutSegments.find((s) => s.star === activeStar) ?? null;

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
     INVALID SLUG / PARAMETER STATE
  --------------------------------------------------------- */
  if (Number.isNaN(assignmentId) || assignmentId <= 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
          <FiAlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            ID Penugasan Tidak Valid
          </h2>
          <p className="max-w-xs text-xs text-slate-500">
            Parameter rute ID penugasan tidak ditemukan atau formatnya salah.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------
     LOADING & ERROR STATES
  --------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500 font-sans select-none">
        <FiRefreshCw className="h-7 w-7 animate-spin text-slate-700" />
        <p className="text-xs font-semibold text-slate-600">
          Memuat Ulasan Penugasan #{assignmentId}...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center font-sans select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
          <FiAlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Gagal Memuat Laporan Ulasan
          </h2>
          <p className="max-w-md text-xs text-slate-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan sistem saat mengambil data."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            Kembali
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-900 antialiased pb-12 select-none">
      {/* ---------------------------------------------------------
          HEADER & TOOLBAR
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition active:bg-slate-100"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  Ulasan & Rating Penugasan #{assignmentId}
                </h1>
                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                  <FiActivity className="h-3 w-3 text-blue-600" /> Live
                  Feedbacks
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Analisis kepuasan & catatan pengalaman penumpang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition active:bg-slate-100 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={feedbacks.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-bold text-white transition active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 pt-4">
        {/* ---------------------------------------------------------
            EXECUTIVE RATING OVERVIEW SECTION
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Card 1: Main Average Rating Card */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-300 bg-white p-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                <FiAward size={14} /> Skor Kepuasan Rata-rata
              </span>
              <div className="mt-4 flex items-baseline gap-3">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">
                  {analytics.averageRating}
                </h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-500 text-base">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FiStar
                        key={i}
                        className={
                          i < Math.round(analytics.averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Berdasarkan {analytics.total} total ulasan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Donut Chart Interaktif & Proporsi Rating */}
          <div className="rounded-xl border border-slate-300 bg-white p-4 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FiPieChart className="text-slate-700" /> Proporsi Rating
              </h3>

              {ratingFilter !== "ALL" ? (
                <button
                  onClick={() => setRatingFilter("ALL")}
                  className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800 border border-slate-300 transition active:bg-slate-200"
                >
                  <span>Filter ★{ratingFilter}</span>
                  <FiXCircle className="h-3.5 w-3.5 text-slate-600" />
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">
                  Klik segmen untuk filter
                </span>
              )}
            </div>

            <div className="flex items-center justify-around gap-4 my-auto">
              {/* Donut SVG Chart */}
              <div className="relative h-32 w-32 shrink-0">
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
                    stroke="#E2E8F0"
                    strokeWidth="14"
                  />
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
                          strokeWidth={isActive ? 18 : 14}
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
                              "stroke-dasharray 600ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 150ms ease, opacity 150ms ease",
                            transitionDelay: donutAnimated
                              ? `${idx * 50}ms, 0ms, 0ms`
                              : "0ms",
                          }}
                        />
                      );
                    })}
                </svg>

                {/* Teks tengah */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  {activeSegment ? (
                    <>
                      <span
                        className="text-lg font-black leading-none"
                        style={{ color: activeSegment.color }}
                      >
                        ★{activeSegment.star}
                      </span>
                      <span className="mt-1 text-xs font-extrabold text-slate-900">
                        {activeSegment.count} ulasan
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">
                        {activeSegment.pct}%
                      </span>
                    </>
                  ) : analytics.total === 0 ? (
                    <span className="px-2 text-[10px] font-bold text-slate-400">
                      Kosong
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-black text-slate-900">
                        {analytics.total}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        Ulasan
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend Items */}
              <div className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-x-2">
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
                      className={`flex items-center gap-1.5 rounded px-2 py-1 text-left border transition active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 ${
                        isActive
                          ? "border-slate-400 bg-slate-50"
                          : "border-transparent hover:bg-slate-50"
                      } ${isDimmed ? "opacity-40" : ""}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold text-slate-800 w-6">
                        ★{seg.star}
                      </span>
                      <span className="font-semibold text-slate-600">
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
        <div className="rounded-xl border border-slate-300 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FiTag className="text-slate-700" /> Filter Berdasarkan Tag
              Kategori
            </h3>

            {selectedTag !== "ALL" && (
              <button
                onClick={() => setSelectedTag("ALL")}
                className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 border border-slate-300 active:bg-slate-200"
              >
                <span>Filter: "{selectedTag}"</span>
                <FiXCircle className="h-3.5 w-3.5 text-slate-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(TAG_CATEGORIES).map(([key, cat]) => {
              const IconComp = cat.icon;

              return (
                <div
                  key={key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-200 pb-1.5">
                    <IconComp className="text-slate-700" size={14} />
                    <span>{cat.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
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
                          className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-bold transition active:scale-95 ${
                            isSelected
                              ? "border-slate-800 bg-slate-900 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <span>{tag}</span>
                          <span
                            className={`rounded px-1 py-px text-[9px] font-black ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
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
        <div className="rounded-xl border border-slate-300 bg-white overflow-hidden space-y-3">
          {/* Header Controls */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Riwayat Ulasan Penumpang
              </h3>
              <p className="text-[11px] text-slate-500">
                Menampilkan {filteredFeedbacks.length} dari {feedbacks.length}{" "}
                total ulasan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative min-w-[180px]">
                <FiSearch
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Cari kata kunci..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800"
                />
              </div>

              {/* Filter Rating Buttons */}
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-300 bg-slate-100 p-0.5">
                <FiFilter className="ml-1 h-3 w-3 text-slate-500" />
                {(["ALL", 5, 4, 3, 2, 1] as const).map((r) => (
                  <button
                    key={String(r)}
                    onClick={() => setRatingFilter(r)}
                    className={`rounded px-2 py-1 text-[10px] font-bold transition ${
                      ratingFilter === r
                        ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r === "ALL" ? "Semua" : `★${r}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedbacks Grid / Cards */}
          <div className="p-3.5">
            {filteredFeedbacks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <FiMessageSquare className="mx-auto h-7 w-7 text-slate-400" />
                <p className="mt-2 text-xs font-bold text-slate-700">
                  Tidak Ada Ulasan Ditemukan
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sesuaikan kata kunci atau opsi filter Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredFeedbacks.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 space-y-2 hover:border-slate-300"
                    >
                      <div className="space-y-2">
                        {/* Card Top Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FiStar
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < item.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs font-black text-slate-900">
                              {item.rating}.0
                            </span>
                          </div>

                          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <FiClock className="h-3 w-3" />
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>

                        {/* Experience Text */}
                        <p className="text-xs leading-relaxed text-slate-800 font-semibold">
                          {item.experience || "Tidak ada catatan pengalaman."}
                        </p>

                        {/* Categorized Tags Badges */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.tags.map((tag) => {
                              const catKey = getTagCategoryKey(tag);
                              const catStyle =
                                catKey === "DRIVER"
                                  ? "bg-blue-50 text-blue-900 border-blue-200"
                                  : catKey === "VEHICLE"
                                    ? "bg-purple-50 text-purple-900 border-purple-200"
                                    : catKey === "TRIP"
                                      ? "bg-amber-50 text-amber-900 border-amber-200"
                                      : "bg-slate-100 text-slate-800 border-slate-200";

                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${catStyle}`}
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
