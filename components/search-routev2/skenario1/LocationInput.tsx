"use client";

import React from "react";
import { FiMapPin, FiSearch, FiX } from "react-icons/fi";

import Button from "@/components/ui/Button";
import { MapboxSuggestion, PointType } from "@/types/mapbox.type";
import MapboxSuggestions from "./MapboxSuggestions";

interface LocationInputProps {
  type: PointType;
  value: string;
  suggestions: MapboxSuggestion[];
  isActive: boolean;
  isLoading: boolean;

  onChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
  onSelectSuggestion: (item: MapboxSuggestion) => void;
}

export default function LocationInput({
  type,
  value,
  suggestions,
  isActive,
  isLoading,
  onChange,
  onFocus,
  onClear,
  onSelectSuggestion,
}: LocationInputProps) {
  const isOrigin = type === "origin";

  const placeholder = isOrigin ? "Lokasi Penjemputan" : "Lokasi Tujuan";

  const clearLabel = isOrigin
    ? "Hapus lokasi penjemputan"
    : "Hapus lokasi tujuan";

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* Input Icon */}
        <div
          className={`absolute left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs sm:left-2.5 sm:h-8 sm:w-8 sm:text-sm ${
            isOrigin
              ? "bg-[#0052cc]/10 text-[#003d9b]"
              : "bg-[#e7e7f2] text-[#434654]"
          }`}
        >
          {isOrigin ? <FiMapPin /> : <FiSearch />}
        </div>

        {/* Input */}
        <input
          type="text"
          className="h-9 w-full truncate rounded-lg border border-[#c3c6d6] bg-[#faf8ff] pl-9 pr-8 text-[11px] outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 sm:h-12 sm:rounded-xl sm:pl-12 sm:pr-10 sm:text-sm"
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Loading */}
        {isLoading && (
          <span className="absolute right-7 text-[9px] text-black/40 sm:right-9 sm:text-[10px]">
            ...
          </span>
        )}

        {/* Clear */}
        {value && (
          <Button
            variant="inputClear"
            size="sm"
            icon={<FiX />}
            onClick={onClear}
            aria-label={clearLabel}
          />
        )}
      </div>

      {/* Suggestions */}
      {isActive && suggestions.length > 0 && (
        <MapboxSuggestions
          suggestions={suggestions}
          onSelect={onSelectSuggestion}
        />
      )}
    </div>
  );
}