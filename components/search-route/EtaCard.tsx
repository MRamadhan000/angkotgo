"use client";

interface EtaCardProps {
  label: string;
  value: number;
  unit: string;
  subLabel: string;
  subValue: string;
}

export function EtaCard({
  label,
  value,
  unit,
  subLabel,
  subValue,
}: EtaCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#f8faff" }}
    >
      <div
        className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-bold tabular-nums leading-none"
        style={{ color: "#0f172a" }}
      >
        {value}{" "}
        <span className="text-base font-normal" style={{ color: "#94a3b8" }}>
          {unit}
        </span>
      </div>
      <div className="mt-2 text-xs" style={{ color: "#94a3b8" }}>
        {subLabel}{" "}
        <span className="font-semibold" style={{ color: "#475569" }}>
          {subValue}
        </span>
      </div>
    </div>
  );
}
