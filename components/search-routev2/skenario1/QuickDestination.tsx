"use client";

import { FiClock, FiStar } from "react-icons/fi";

interface QuickDestinationItem {
  label: string;
  value: string;
  icon?: "clock" | "star";
}

interface QuickDestinationProps {
  items: QuickDestinationItem[];
  onSelect: (value: string) => void;
}

export default function QuickDestination({
  items,
  onSelect,
}: QuickDestinationProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ededf8] px-2.5 py-1 text-[11px] font-medium text-[#434654] hover:bg-[#e2e2f0]"
        >
          {item.icon === "clock" ? (
            <FiClock className="text-[#003d9b]" />
          ) : (
            <FiStar className="text-amber-500" />
          )}

          {item.label}
        </button>
      ))}
    </div>
  );
}
