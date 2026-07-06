"use client";

interface MapMarkerProps {
  label: string;
  emoji: string;
  color: string;
}

export function MapMarker({ label, emoji, color }: MapMarkerProps) {
  return (
    <div className="flex flex-col items-center select-none pointer-events-none">
      <div
        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md mb-1 text-white shadow-sm whitespace-nowrap"
        style={{ background: color }}
      >
        {label}
      </div>
      <span className="text-4xl drop-shadow-sm leading-none">{emoji}</span>
    </div>
  );
}
