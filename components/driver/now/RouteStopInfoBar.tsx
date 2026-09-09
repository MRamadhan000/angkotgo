"use client";

import React from "react";
import { FaMapSigns } from "react-icons/fa";

interface RouteStopInfoBarProps {
  stopCount: number;
  direction: string;
}

export function RouteStopInfoBar({
  stopCount,
  direction,
}: RouteStopInfoBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <FaMapSigns className="text-sm" />
      </div>
      <p className="font-medium">
        <span className="font-bold">{stopCount}</span> halte tersedia untuk arah{" "}
        <span className="font-bold capitalize">{direction}</span>.
      </p>
    </div>
  );
}
