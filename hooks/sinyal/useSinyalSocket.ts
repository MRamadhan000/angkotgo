"use client";

import { useEffect, useState } from "react";

import {
  sinyalSocket,
  SinyalRealtimePayload,
} from "@/services/sinyal/sinyalSocket.service";

interface UseSinyalRealtimeReturn {
  data: SinyalRealtimePayload | null;

  connected: boolean;

  socketId: string | null;

  joined: boolean;
}

export function useSinyalRealtime(
  vehicleAssignmentId: string | null,
): UseSinyalRealtimeReturn {
  const [data, setData] = useState<SinyalRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  const [socketId, setSocketId] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!vehicleAssignmentId) {
      return;
    }

    /**
     * =====================================================
     * CONNECT
     * =====================================================
     */

    const socket = sinyalSocket.connect();

    /**
     * =====================================================
     * EVENT HANDLERS
     * =====================================================
     */

    const handleConnect = () => {
      console.log("[SinyalRealtime] Connected", socket.id);

      setConnected(true);

      setSocketId(socket.id ?? null);

      /**
       * Join assignment room
       */

      sinyalSocket.join(vehicleAssignmentId);
    };

    const handleDisconnect = (reason: string) => {
      console.log("[SinyalRealtime] Disconnected:", reason);

      setConnected(false);

      setJoined(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("[SinyalRealtime] Connection error:", error);

      setConnected(false);
    };

    const handleJoined = (response: {
      vehicleAssignmentId: string;
      room: string;
    }) => {
      console.log("[SinyalRealtime] Joined:", response);

      setJoined(true);
    };

    const handleUpdated = (payload: SinyalRealtimePayload) => {
      console.log("[SinyalRealtime] Updated:", payload);

      setData(payload);
    };

    /**
     * =====================================================
     * REGISTER LISTENERS
     * =====================================================
     */

    sinyalSocket.onConnect(handleConnect);

    sinyalSocket.onDisconnect(handleDisconnect);

    sinyalSocket.onConnectError(handleConnectError);

    sinyalSocket.onJoined(handleJoined);

    sinyalSocket.onUpdated(handleUpdated);

    /**
     * =====================================================
     * IMPORTANT
     * =====================================================
     *
     * Kalau socket sudah connect sebelum listener
     * dipasang, kita tetap harus join.
     */

    if (socket.connected) {
      handleConnect();
    }

    /**
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
      sinyalSocket.offConnect(handleConnect);

      sinyalSocket.offDisconnect(handleDisconnect);

      sinyalSocket.offConnectError(handleConnectError);

      sinyalSocket.offJoined(handleJoined);

      sinyalSocket.offUpdated(handleUpdated);

      setJoined(false);
    };
  }, [vehicleAssignmentId]);

  return {
    data,
    connected,
    socketId,
    joined,
  };
}
