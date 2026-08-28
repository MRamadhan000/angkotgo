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

  const placeholder = isOrigin
    ? "Lokasi Penjemputan"
    : "Lokasi Tujuan";

  const clearLabel = isOrigin
    ? "Hapus lokasi penjemputan"
    : "Hapus lokasi tujuan";

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* Input Icon */}
        <div
          className={`absolute left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
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
          className="h-11 w-full truncate rounded-xl border border-[#c3c6d6] bg-[#faf8ff] pl-11 pr-10 text-xs outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 sm:h-12 sm:pl-12 sm:text-sm"
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Loading */}
        {isLoading && (
          <span className="absolute right-9 text-[10px] text-black/40">
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