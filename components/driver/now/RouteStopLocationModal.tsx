import { RouteStopType } from "@/types/routes/route-stop.type";

export function RouteStopLocationModal({
  isOpen,
  routeStops,
  isSubmitting,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  routeStops: RouteStopType[];
  isSubmitting: boolean;
  onClose: () => void;
  onSelect: (stop: RouteStopType) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pilih posisi kendaraan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pilih halte untuk mengirim posisi dev kendaraan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
            disabled={isSubmitting}
          >
            Tutup
          </button>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {routeStops.map((stop) => (
            <button
              type="button"
              key={stop.id}
              onClick={() => onSelect(stop)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                  {stop.stopOrder}
                </span>
                <span className="font-medium text-slate-900">
                  {stop.stopName}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {Number(stop.latitude).toFixed(5)},{" "}
                {Number(stop.longitude).toFixed(5)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
