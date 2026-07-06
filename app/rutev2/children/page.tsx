"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { AngkotLocationUpdatePayload } from "@/services/routeService";

interface LogMessage {
  id: string;
  timestamp: string;
  event: string;
  payload: any;
}

export default function DebugSocketPage() {
  const { socket, isConnected } = useSocket();
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [roomAL, setRoomAL] = useState(false);
  const [roomAG, setRoomAG] = useState(false);

  // Fungsi pembantu untuk mencatat log ke dalam UI state
  const pushLog = (event: string, payload: any) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      event,
      payload,
    };
    // Batasi hanya menyimpan 50 log terakhir agar browser tidak crash
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (!socket) return;

    // 1. Log saat berhasil subscribe/unsubscribe rute dari server (jika ada feedback)
    socket.on("subscribed_response", (data) => pushLog("ACK_SUBSCRIBE", data));

    // 2. Log data inisial armada saat baru masuk room rute
    socket.on(
      "initial_angkot_locations",
      (data: AngkotLocationUpdatePayload) => {
        pushLog("INITIAL_LOCATIONS_RECIEVED", data);
      },
    );

    // 3. Log data koordinat real-time angkot per detik/menit
    socket.on("angkot_location_update", (data: AngkotLocationUpdatePayload) => {
      pushLog("LOCATION_UPDATE_RECIEVED", data);
    });

    return () => {
      socket.off("subscribed_response");
      socket.off("initial_angkot_locations");
      socket.off("angkot_location_update");
    };
  }, [socket]);

  // Handler Trigger Subscribe Room
  const handleToggleRoom = (route: "AL" | "AG") => {
    if (!socket) return;

    if (route === "AL") {
      if (roomAL) {
        socket.emit("unsubscribe_route", { kodeAngkot: "AL" });
        pushLog("CLIENT_EMIT", {
          action: "unsubscribe_route",
          kodeAngkot: "AL",
        });
      } else {
        socket.emit("subscribe_route", { kodeAngkot: "AL" });
        pushLog("CLIENT_EMIT", { action: "subscribe_route", kodeAngkot: "AL" });
      }
      setRoomAL(!roomAL);
    } else {
      if (roomAG) {
        socket.emit("unsubscribe_route", { kodeAngkot: "AG" });
        pushLog("CLIENT_EMIT", {
          action: "unsubscribe_route",
          kodeAngkot: "AG",
        });
      } else {
        socket.emit("subscribe_route", { kodeAngkot: "AG" });
        pushLog("CLIENT_EMIT", { action: "subscribe_route", kodeAngkot: "AG" });
      }
      setRoomAG(!roomAG);
    }
  };

  const bersihkanLog = () => setLogs([]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-6">
      {/* Header Panel */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-cyan-400">
            🔌 WEBSOCKET STREAM INSPECTOR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan halaman ini untuk memvalidasi payload data dari NestJS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs">Status Gateway:</span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-md ${isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"}`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </header>

      {/* Kontrol Room Emulator */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-sm font-bold text-slate-400 mb-3">
          📡 Simulasi Room / Subskripsi
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleToggleRoom("AL")}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${roomAL ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
          >
            {roomAL ? "🔴 Unsubscribe Line AL" : "🟢 Subscribe Line AL"}
          </button>
          <button
            onClick={() => handleToggleRoom("AG")}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${roomAG ? "bg-rose-500 text-slate-950 border-rose-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
          >
            {roomAG ? "🔴 Unsubscribe Line AG" : "🟢 Subscribe Line AG"}
          </button>
          <button
            onClick={bersihkanLog}
            className="ml-auto px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
          >
            Clear Terminal ({logs.length})
          </button>
        </div>
      </div>

      {/* Log Feed Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Stream Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-slate-850 border-b border-slate-800 p-3 text-xs font-bold text-slate-400">
            📡 Live Event Traffic Logs
          </div>
          <div className="flex-1 overflow-auto p-2">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-600">
                Menunggu traffic data masuk... Silakan aktifkan Subscribe di
                atas.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="p-2">Waktu</th>
                    <th className="p-2">Nama Event</th>
                    <th className="p-2">Info Payload Ringkas</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                    >
                      <td className="p-2 text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-2 font-bold text-amber-400">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {log.event}
                        </span>
                      </td>
                      <td className="p-2 text-slate-300 max-w-xs truncate font-sans">
                        {log.event === "CLIENT_EMIT" &&
                          `Mengirim: ${log.payload.action} -> ${log.payload.kodeAngkot}`}
                        {log.event === "LOCATION_UPDATE_RECIEVED" &&
                          `🚚 Vehicle: ${log.payload.vehicleId || log.payload.id} | Lat: ${log.payload.lat} | Lng: ${log.payload.lng} | Action: ${log.payload.action || "update"}`}
                        {log.event === "INITIAL_LOCATIONS_RECIEVED" &&
                          `📦 Menerima batch array isi (${log.payload?.length || 0} armada)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Realtime Inspector Raw JSON */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-slate-850 border-b border-slate-800 p-3 text-xs font-bold text-slate-400">
            🔍 Raw JSON Payload Object (Data Terakhir)
          </div>
          <div className="flex-1 overflow-auto p-4 bg-slate-950 text-[11px] text-emerald-400">
            {logs.length > 0 ? (
              <div>
                <p className="text-slate-500 mb-2">
                  // Event Terakhir: {logs[0].event} pada {logs[0].timestamp}
                </p>
                <pre>{JSON.stringify(logs[0].payload, null, 2)}</pre>
              </div>
            ) : (
              <span className="text-slate-600">
                // Klik tombol subscribe rute untuk menangkap payload JSON di
                sini.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
