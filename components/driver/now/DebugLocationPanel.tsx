"use client";

import { useState } from "react";
import {
  FaBug,
  FaChevronDown,
  FaTowerCell,
  FaLocationDot,
  FaUsers,
  FaBus,
  FaRoute,
  FaBan,
  FaCircleCheck,
  FaCopy,
  FaCheck,
} from "react-icons/fa6";

export function DebugLocationPanel({
  assignmentId,
  vehicleLocation,
  vehicleLocationSource,
  vehicleSocketConnected,
  vehicleSocketJoined,
  userSocketConnected,
  userSocketJoined,
  userLocations,
  routePathCount,
  routeStopCount,
}: {
  assignmentId: number;
  vehicleLocation: { latitude: number; longitude: number } | null;
  vehicleLocationSource: string;
  vehicleSocketConnected: boolean;
  vehicleSocketJoined: boolean;
  userSocketConnected: boolean;
  userSocketJoined: boolean;
  userLocations: Array<{
    id: string;
    latitude: number;
    longitude: number;
    status: "ACTIVE";
  }>;
  routePathCount: number;
  routeStopCount: number;
}) {
  const [copied, setCopied] = useState(false);

  const copyCoordinates = () => {
    if (!vehicleLocation) return;
    const text = `${vehicleLocation.latitude}, ${vehicleLocation.longitude}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <details className="group mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg transition-all">
      {/* SUMMARY HEADER */}
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-900/80 transition-colors select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FaBug className="text-xs" />
          </div>
          <span>Panel Debug Realtime</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            ID: #{assignmentId}
          </span>
          <FaChevronDown className="text-xs text-slate-500 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      {/* CONTENT BODY */}
      <div className="space-y-3.5 border-t border-slate-800/80 p-3.5 sm:p-4 text-xs">
        {/* GRID STATUS SOCKET & DATA */}
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DebugCard
            icon={<FaBus className="text-slate-400" />}
            label="Assignment ID"
            value={`#${assignmentId}`}
          />

          <SocketStatusCard
            label="Vehicle Socket"
            connected={vehicleSocketConnected}
            joined={vehicleSocketJoined}
          />

          <SocketStatusCard
            label="User Socket"
            connected={userSocketConnected}
            joined={userSocketJoined}
          />

          <DebugCard
            icon={<FaRoute className="text-slate-400" />}
            label="Objek Aktif Map"
            value={`${userLocations.length} User • ${routeStopCount} Halte • ${routePathCount} Path`}
          />
        </div>

        {/* POSISI ANGKOT */}
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3 sm:p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs">
              <FaBus className="text-cyan-400/80" />
              <span>Posisi Angkot ({vehicleLocationSource})</span>
            </div>

            {vehicleLocation && (
              <button
                type="button"
                onClick={copyCoordinates}
                className="flex items-center gap-1.5 rounded-md bg-cyan-950 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-900/60 border border-cyan-800/50 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <FaCheck className="text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <FaCopy />
                    <span>Salin Koordinat</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="font-mono text-sm font-semibold text-slate-200">
            {vehicleLocation ? (
              <span>
                lat:{" "}
                <span className="text-cyan-300">
                  {vehicleLocation.latitude.toFixed(6)}
                </span>
                , lng:{" "}
                <span className="text-cyan-300">
                  {vehicleLocation.longitude.toFixed(6)}
                </span>
              </span>
            ) : (
              <span className="text-slate-500 italic">Belum ada koordinat</span>
            )}
          </p>
        </div>

        {/* POSISI USER AKTIFF */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 sm:p-3.5">
          <div className="flex items-center gap-2 mb-2 font-bold text-emerald-400 text-xs">
            <FaUsers className="text-emerald-400/80" />
            <span>Posisi User Aktif ({userLocations.length})</span>
          </div>

          {userLocations.length > 0 ? (
            <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {userLocations.map((location, index) => (
                <div
                  key={location.id}
                  className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1.5 border border-slate-800/60"
                >
                  <span className="font-semibold text-slate-300">
                    #{index + 1} {location.id}
                  </span>
                  <span className="text-slate-400">
                    lat:{" "}
                    <span className="text-emerald-300">
                      {location.latitude.toFixed(6)}
                    </span>
                    , lng:{" "}
                    <span className="text-emerald-300">
                      {location.longitude.toFixed(6)}
                    </span>
                  </span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/50">
                    {location.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-slate-500 italic text-xs">
              Belum ada user aktif yang terdeteksi
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

{/* HELPER CARD UNTUK STATUS VALUE */}
function DebugCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-mono text-xs font-bold text-slate-200 truncate">
        {value}
      </p>
    </div>
  );
}

{/* HELPER CARD UNTUK SOCKET STATUS */}
function SocketStatusCard({
  label,
  connected,
  joined,
}: {
  label: string;
  connected: boolean;
  joined: boolean;
}) {
  const getBadge = () => {
    if (!connected) {
      return (
        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
          <FaBan className="text-[10px]" /> DISCONNECTED
        </span>
      );
    }
    if (joined) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
          <FaCircleCheck className="text-[10px]" /> JOINED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
        <FaTowerCell className="text-[10px]" /> NOT JOINED
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <FaTowerCell className="text-slate-400 text-xs" />
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="font-mono text-xs">{getBadge()}</div>
    </div>
  );
}