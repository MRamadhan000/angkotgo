"use client";

import React from "react";
import { FaCompass, FaLocationCrosshairs } from "react-icons/fa6";
import type { RoutePath } from "@/types/routes/route-path.type";
import type { RouteStopType } from "@/types/routes/route-stop.type";
import type {
  ActiveUserLocation,
  Coordinate,
  LocationSource,
} from "@/app/driver/dashboard/now/[slug]/hooks/useAssignmentDetail";
import DriverMap from "@/app/driver/dashboard/DriverMap";
import { DebugLocationPanel } from "./DebugLocationPanel";

interface LiveMapSectionProps {
  // Map data
  routePaths: RoutePath[];
  routeStops: RouteStopType[];
  displayedVehicleLocation: Coordinate | null;
  locationSource: LocationSource;
  locationSourceLabel: string;
  activeUserLocations: ActiveUserLocation[];
  currentPassengers: number;
  capacity: number;
  routeName?: string;

  // Debug panel data
  assignmentId: number;
  vehicleSocketStatus: { connected: boolean; joined: boolean };
  userSocketStatus: { connected: boolean; joined: boolean };

  // New cockpit features
  isFullscreen?: boolean;
  recenterTrigger?: number;
  showDebugPanel?: boolean;
}

const SOURCE_DISPLAY_MAP: Record<LocationSource, string> = {
  manual: "Manual / Halte",
  gps: "GPS Browser",
  socket: "Socket",
  "last-known": "Terakhir",
};

export function LiveMapSection({
  routePaths,
  routeStops,
  displayedVehicleLocation,
  locationSource,
  locationSourceLabel,
  activeUserLocations,
  currentPassengers,
  capacity,
  routeName,
  assignmentId,
  vehicleSocketStatus,
  userSocketStatus,
  isFullscreen = false,
  recenterTrigger = 0,
  showDebugPanel = false,
}: LiveMapSectionProps) {
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 h-full w-full z-0 bg-slate-100 overflow-hidden">
        {/* Floating Source Overlay (Top right, below top bar) */}
        <div className="absolute top-20 right-4 z-10 hidden sm:flex items-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200/60 shadow-2xs pointer-events-none">
          <FaLocationCrosshairs className="text-blue-500 text-xs" />
          <span>
            Sumber:{" "}
            <span className="text-slate-900 capitalize">
              {SOURCE_DISPLAY_MAP[locationSource]}
            </span>
          </span>
        </div>

        <DriverMap
          routePaths={routePaths}
          routeStops={routeStops}
          currentLocation={displayedVehicleLocation}
          locationSource={locationSource}
          userLocations={activeUserLocations}
          currentPassengers={currentPassengers}
          capacity={capacity}
          routeName={routeName}
          recenterTrigger={recenterTrigger}
        />

        {showDebugPanel && (
          <div className="absolute bottom-[240px] left-3 right-3 z-20 max-w-sm sm:left-4">
            <DebugLocationPanel
              assignmentId={assignmentId}
              vehicleLocation={displayedVehicleLocation}
              vehicleLocationSource={locationSourceLabel}
              vehicleSocketConnected={vehicleSocketStatus.connected}
              vehicleSocketJoined={vehicleSocketStatus.joined}
              userSocketConnected={userSocketStatus.connected}
              userSocketJoined={userSocketStatus.joined}
              userLocations={activeUserLocations}
              routePathCount={routePaths.length}
              routeStopCount={routeStops.length}
            />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="mt-3 sm:mt-4 space-y-3">
      {/* MAP SECTION HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <FaCompass className="text-xs animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              Live Map Tracking
            </h4>
            <p className="text-[11px] text-slate-400">
              Pemantauan lokasi kendaraan &amp; titik penumpang realtime
            </p>
          </div>
        </div>

        {/* LIVE BADGE */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-extrabold tracking-wider uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          LIVE
        </span>
      </div>

      {/* MAP CONTAINER — larger on mobile for driver visibility */}
      <div className="relative h-[50vh] sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-xs transition-all z-0">
        {/* Floating Info Overlay */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200/60 shadow-2xs pointer-events-none">
          <FaLocationCrosshairs className="text-blue-500 text-xs" />
          <span>
            Sumber:{" "}
            <span className="text-slate-900 capitalize">
              {SOURCE_DISPLAY_MAP[locationSource]}
            </span>
          </span>
        </div>

        <DriverMap
          routePaths={routePaths}
          routeStops={routeStops}
          currentLocation={displayedVehicleLocation}
          locationSource={locationSource}
          userLocations={activeUserLocations}
          currentPassengers={currentPassengers}
          capacity={capacity}
          routeName={routeName}
        />
      </div>

      {/* DEBUG PANEL */}
      <DebugLocationPanel
        assignmentId={assignmentId}
        vehicleLocation={displayedVehicleLocation}
        vehicleLocationSource={locationSourceLabel}
        vehicleSocketConnected={vehicleSocketStatus.connected}
        vehicleSocketJoined={vehicleSocketStatus.joined}
        userSocketConnected={userSocketStatus.connected}
        userSocketJoined={userSocketStatus.joined}
        userLocations={activeUserLocations}
        routePathCount={routePaths.length}
        routeStopCount={routeStops.length}
      />
    </div>
  );
}
