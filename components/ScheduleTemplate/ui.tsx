/* =========================================================
 * ACTIVE DAYS
 * ========================================================= */

import { getDayName } from "./scheduleTemplateUtil";

export function ActiveDays({
  days,
  highlightDays = [],
}: {
  days?: number[];
  highlightDays?: number[];
}) {
  const sortedDays = [...(days ?? [])].sort((a, b) => a - b);

  if (!sortedDays.length) {
    return <span className="text-xs text-gray-400">Tidak ada</span>;
  }

  return (
    <div className="flex max-w-[260px] flex-wrap gap-1">
      {sortedDays.map((day) => {
        const isWeekend = day === 6 || day === 7;
        const isHighlighted = highlightDays.includes(day);

        return (
          <span
            key={day}
            className={`rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${
              isHighlighted
                ? isWeekend
                  ? "bg-orange-500 text-white ring-orange-500"
                  : "bg-blue-600 text-white ring-blue-600"
                : isWeekend
                  ? "bg-orange-50 text-orange-600 ring-transparent"
                  : "bg-gray-100 text-gray-600 ring-transparent"
            }`}
          >
            {getDayName(day)}
          </span>
        );
      })}
    </div>
  );
}

/* =========================================================
 * BADGES
 * ========================================================= */

export function DirectionBadge({ direction }: { direction: string }) {
  const isForward = direction === "FORWARD";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        isForward ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
      }`}
    >
      {isForward ? "Forward" : "Return"}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    SCHEDULED: {
      label: "Scheduled",
      className: "bg-yellow-50 text-yellow-700",
    },

    ONGOING: {
      label: "Ongoing",
      className: "bg-blue-50 text-blue-700",
    },

    COMPLETED: {
      label: "Completed",
      className: "bg-green-50 text-green-700",
    },

    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700",
    },
  };

  const current = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        isActive ? "text-green-600" : "text-gray-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-300"
        }`}
      />

      {isActive ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}

/* =========================================================
 * PERSON
 * ========================================================= */

export function PersonCard({ label, name }: { label: string; name?: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="text-[11px] text-gray-400">{label}</p>

      {name ? (
        <div className="mt-1.5 flex items-center gap-2">
          <Avatar name={name} />

          <span className="truncate text-sm font-medium text-gray-700">
            {name}
          </span>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-gray-400">Belum ditentukan</p>
      )}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
      {initial}
    </div>
  );
}
