"use client";

import { FiMapPin } from "react-icons/fi";
import { MapboxSuggestion } from "@/types/mapbox.type";

interface MapboxSuggestionsProps {
  suggestions: MapboxSuggestion[];
  onSelect: (item: MapboxSuggestion) => void;
}

export default function MapboxSuggestions({
  suggestions,
  onSelect,
}: MapboxSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
      {suggestions.map((item) => (
        <button
          key={item.mapbox_id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
          className="flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-blue-50"
        >
          <FiMapPin className="mt-0.5 shrink-0 text-[#003d9b]" />

          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-800">
              {item.name_preferred ?? item.name}
            </p>

            {item.place_formatted && (
              <p className="truncate text-[11px] text-gray-500">
                {item.place_formatted}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}