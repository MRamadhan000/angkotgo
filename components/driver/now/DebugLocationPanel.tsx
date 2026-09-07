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
  return (
    <details className="mt-3 rounded-2xl border border-slate-300 bg-slate-900 text-slate-100 shadow-sm">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Debug lokasi realtime
      </summary>
      <div className="space-y-3 border-t border-slate-700 px-4 py-3 text-xs">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <DebugValue label="Assignment ID" value={String(assignmentId)} />
          <DebugValue
            label="Vehicle socket"
            value={formatSocketState(
              vehicleSocketConnected,
              vehicleSocketJoined,
            )}
          />
          <DebugValue
            label="User socket"
            value={formatSocketState(userSocketConnected, userSocketJoined)}
          />
          <DebugValue
            label="Data aktif"
            value={`${userLocations.length} user / ${routeStopCount} halte / ${routePathCount} path`}
          />
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="mb-1 font-semibold text-cyan-300">
            Posisi angkot ({vehicleLocationSource})
          </p>
          <p className="font-mono">
            {vehicleLocation
              ? `lat=${vehicleLocation.latitude.toFixed(6)}, lng=${vehicleLocation.longitude.toFixed(6)}`
              : "Belum ada koordinat"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="mb-2 font-semibold text-emerald-300">
            Posisi user aktif ({userLocations.length})
          </p>
          {userLocations.length > 0 ? (
            <div className="space-y-1 font-mono">
              {userLocations.map((location, index) => (
                <p key={location.id}>
                  #{index + 1} {location.id}: lat={location.latitude.toFixed(6)}
                  , lng={location.longitude.toFixed(6)} [{location.status}]
                </p>
              ))}
            </div>
          ) : (
            <p className="font-mono text-slate-400">Belum ada user aktif</p>
          )}
        </div>
      </div>
    </details>
  );
}

function DebugValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-slate-100">{value}</p>
    </div>
  );
}


function formatSocketState(connected: boolean, joined: boolean) {
  if (!connected) return "DISCONNECTED";
  return joined ? "CONNECTED / JOINED" : "CONNECTED / NOT JOINED";
}
