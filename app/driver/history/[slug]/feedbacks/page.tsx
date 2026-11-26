"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiStar,
  FiMessageSquare,
  FiSearch,
  FiClock,
  FiUser,
  FiThumbsUp,
  FiAlertCircle,
} from "react-icons/fi";

interface ApiFeedback {
  id: string;
  vehicleAssignmentId: number;
  rating: number;
  tags: string[];
  experience: string | null;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchFeedbacks(id: number): Promise<ApiFeedback[]> {
  const res = await fetch(`${API_URL}/feedbacks/assignment/${id}`, {
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal mengambil data ulasan");
  }

  return json?.data ?? [];
}

const filters = ["ALL", 5, 4, 3, 2, 1] as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarRating({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }
        />
      ))}
    </div>
  );
}

export default function DriverFeedbackPage() {
  const router = useRouter();
  const params = useParams();

  // BACA SLUG / PARAMETER SECARA DINAMIS
  const rawId = params?.id ?? params?.assignmentId ?? params?.slug;
  const assignmentId = useMemo(() => {
    if (!rawId) return NaN;
    const parsed = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawId]);

  const [filter, setFilter] = useState<number | "ALL">("ALL");

  const [search, setSearch] = useState("");

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["driver-feedbacks", assignmentId],
    queryFn: () => fetchFeedbacks(assignmentId),
    enabled: Number.isInteger(assignmentId) && assignmentId > 0,
    retry: 1,
  });

  const average =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length
      : 0;

  const positive = feedbacks.filter((item) => item.rating >= 4).length;

  const positivePercentage =
    feedbacks.length > 0 ? Math.round((positive / feedbacks.length) * 100) : 0;

  const tagCounts = feedbacks
    .flatMap((item) => item.tags ?? [])
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filtered = feedbacks.filter((item) => {
    const matchesRating = filter === "ALL" || item.rating === filter;

    const keyword = search.toLowerCase();

    const matchesSearch =
      (item.experience ?? "").toLowerCase().includes(keyword) ||
      (item.tags ?? []).some((tag) => tag.toLowerCase().includes(keyword));

    return matchesRating && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-50 text-sm font-medium text-slate-500">
        <FiRefreshCw className="animate-spin text-blue-600" />
        Memuat ulasan...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <FiAlertCircle size={32} className="text-rose-500" />
        <p className="font-bold text-slate-800">Gagal memuat ulasan</p>
        <p className="text-xs text-slate-500">
          {error instanceof Error ? error.message : "Terjadi kesalahan"}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FiArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-sm font-bold">Ulasan Penumpang</h1>
              <p className="text-[11px] text-slate-500">
                Penugasan #{assignmentId}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw
              size={15}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        {/* RATING SUMMARY */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Rating perjalanan Anda
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight">
                  {average.toFixed(1)}
                </span>
                <span className="pb-1 text-xs text-slate-400">/ 5.0</span>
              </div>

              <div className="mt-1.5">
                <StarRating rating={Math.round(average)} />
              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                Berdasarkan {feedbacks.length} ulasan penumpang
              </p>
            </div>

            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-emerald-50">
              <FiThumbsUp size={20} className="text-emerald-600" />
              <span className="mt-1 text-sm font-black text-emerald-700">
                {positivePercentage}%
              </span>
              <span className="text-[9px] font-semibold text-emerald-700">
                Kepuasan
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-lg font-bold text-emerald-600">
                {feedbacks.filter((f) => f.rating >= 4).length}
              </p>
              <p className="text-[10px] text-slate-500">Puas</p>
            </div>

            <div>
              <p className="text-lg font-bold text-amber-500">
                {feedbacks.filter((f) => f.rating === 3).length}
              </p>
              <p className="text-[10px] text-slate-500">Cukup</p>
            </div>

            <div>
              <p className="text-lg font-bold text-rose-500">
                {feedbacks.filter((f) => f.rating <= 2).length}
              </p>
              <p className="text-[10px] text-slate-500">Perlu evaluasi</p>
            </div>
          </div>
        </section>

        {/* TOP FEEDBACK TAGS */}
        {topTags.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FiMessageSquare size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold">Catatan Penumpang</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => {
                const negative = [
                  "Ugal-ugalan",
                  "Kurang ramah",
                  "Angkot kotor",
                  "Kurang terawat",
                  "Terlalu penuh",
                  "Menunggu lama",
                ].includes(tag);

                return (
                  <span
                    key={tag}
                    className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${
                      negative
                        ? "border-rose-100 bg-rose-50 text-rose-700"
                        : "border-emerald-100 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {tag}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* FEEDBACK LIST */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Semua Ulasan</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {filtered.length} dari {feedbacks.length} ulasan
                </p>
              </div>
              <FiMessageSquare size={19} className="text-slate-300" />
            </div>

            {/* SEARCH */}
            <div className="relative mt-3">
              <FiSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengalaman atau catatan..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
              />
            </div>

            {/* RATING FILTER */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              {filters.map((item) => (
                <button
                  key={String(item)}
                  onClick={() => setFilter(item)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item === "ALL" ? "Semua" : `★ ${item}`}
                </button>
              ))}
            </div>
          </div>

          {/* FEEDBACK ITEMS */}
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <FiMessageSquare size={28} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600">
                  Tidak ada ulasan ditemukan
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <article
                  key={item.id}
                  className="p-4 transition hover:bg-slate-50/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FiUser size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Penumpang
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-slate-400">
                          <FiClock size={10} />
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                      <FiStar
                        size={12}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="text-xs font-black text-amber-700">
                        {item.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {item.experience ||
                      "Penumpang tidak memberikan catatan tambahan."}
                  </p>

                  {item.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => {
                        const negative = [
                          "Ugal-ugalan",
                          "Kurang ramah",
                          "Angkot kotor",
                          "Kurang terawat",
                          "Terlalu penuh",
                          "Menunggu lama",
                        ].includes(tag);

                        return (
                          <span
                            key={tag}
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                              negative
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <p className="pb-4 text-center text-[10px] text-slate-400">
          Ulasan ini menjadi bahan evaluasi untuk meningkatkan kualitas
          pelayanan AngkotGo.
        </p>
      </main>
    </div>
  );
}
