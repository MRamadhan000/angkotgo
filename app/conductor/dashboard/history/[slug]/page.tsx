"use client";

import { useParams, useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiStar,
} from "react-icons/fi";

import { useReviewsByVehicleAssignmentId } from "@/hooks/useReview";

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ConductorHistoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const assignmentId = Number(params?.slug);
  const hasValidAssignmentId =
    Number.isInteger(assignmentId) && assignmentId > 0;
  const reviewsQuery = useReviewsByVehicleAssignmentId(
    hasValidAssignmentId ? assignmentId : undefined,
  );
  const reviews = reviewsQuery.data?.data ?? [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (!hasValidAssignmentId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <FiAlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            ID penugasan tidak valid.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FiArrowLeft /> Kembali
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft /> Kembali ke riwayat
        </button>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Feedback perjalanan
          </p>
          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Penugasan #{assignmentId}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Feedback yang diterima dari penumpang pada perjalanan ini.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <FiStar className="fill-current" />
                <span className="text-xl font-black">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-amber-700">
                {reviews.length} feedback
              </p>
            </div>
          </div>
        </section>

        {reviewsQuery.isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-3xl border border-gray-100 bg-white p-12 text-sm text-slate-500 shadow-sm">
            <FiRefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            Memuat feedback...
          </div>
        )}

        {reviewsQuery.isError && (
          <div className="flex items-center gap-3 rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            Gagal memuat feedback perjalanan.
          </div>
        )}

        {!reviewsQuery.isLoading &&
          !reviewsQuery.isError &&
          reviews.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
              <FiStar className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Belum ada feedback untuk perjalanan ini.
              </p>
            </div>
          )}

        {!reviewsQuery.isLoading &&
          !reviewsQuery.isError &&
          reviews.length > 0 && (
            <section className="space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-bold text-slate-900">
                        {review.user?.name || "Penumpang"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 text-amber-400"
                      aria-label={`${review.rating} dari 5 bintang`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-current" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.description && (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                      {review.description}
                    </p>
                  )}
                </article>
              ))}
            </section>
          )}
      </div>
    </main>
  );
}
