
/* =========================================================
 * LOADING
 * ========================================================= */

export function LoadingState() {
  return (
    <main className="space-y-6 p-4 sm:p-6">
      <section className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-14 w-28 animate-pulse rounded-xl bg-gray-100" />
      </section>

      <section className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="hidden md:block">
          <div className="h-12 animate-pulse bg-gray-50" />

          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="grid grid-cols-8 gap-4 p-5">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-5 animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-4 md:hidden">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="space-y-3 rounded-lg border border-gray-100 p-4"
            >
              <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
 * ERROR
 * ========================================================= */

export function ErrorState({ error }: { error: Error | null }) {
  return (
    <main className="p-4 sm:p-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M10.29 3.86l-7.82 14A2 2 0 004.21 21h15.58a2 2 0 001.74-3.14l-7.82-14a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-semibold text-red-800">
              Gagal mengambil schedule template
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error?.message ?? "Terjadi kesalahan saat mengambil data."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


export function EmptyState({
  hasActiveFilters,
  onReset,
}: {
  hasActiveFilters?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {hasActiveFilters
          ? "Tidak ada template yang cocok"
          : "Belum ada schedule template"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {hasActiveFilters
          ? "Coba ubah kata kunci pencarian atau filter yang dipilih."
          : "Belum terdapat template jadwal yang tersedia."}
      </p>

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}
