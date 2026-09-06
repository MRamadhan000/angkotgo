"use client";

import { useEffect, useState } from "react";

import {
  vehicleSocket,
  VehicleRealtimePayload,
} from "@/services/vehicles/vehicleSocket.service";

interface UseVehicleRealtimeReturn {
  data: VehicleRealtimePayload | null;

  connected: boolean;

  joined: boolean;

  socketId: string | null;
}

export function useVehicleSocket(
  vehicleAssignmentId: number | null,
): UseVehicleRealtimeReturn {
  const [data, setData] = useState<VehicleRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  const [joined, setJoined] = useState(false);

  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Tidak melakukan koneksi kalau
     * vehicleAssignmentId belum tersedia.
     */
    if (vehicleAssignmentId === null) {
      return;
    }

    /**
     * =====================================================
     * CONNECT
     * =====================================================
     */

    const socket = vehicleSocket.connect();

    /**
     * =====================================================
     * HANDLE CONNECT
     * =====================================================
     */

    const handleConnect = () => {
      console.log("[VehicleRealtime] Connected:", socket.id);

      setConnected(true);

      setSocketId(socket.id ?? null);

      /**
       * Setelah connect,
       * join room vehicle.
       */

      vehicleSocket.join(vehicleAssignmentId);
    };

    /**
     * =====================================================
     * HANDLE JOINED
     * =====================================================
     */

    const handleJoined = (response: {
      vehicleAssignmentId: number;
      room: string;
    }) => {
      console.log("[VehicleRealtime] Joined:", response);

      setJoined(true);
    };

    /**
     * =====================================================
     * HANDLE UPDATED
     * =====================================================
     */

    const handleUpdated = (payload: VehicleRealtimePayload) => {
      console.log("[VehicleRealtime] Updated:", payload);

      setData(payload);
    };

    /**
     * =====================================================
     * HANDLE DISCONNECT
     * =====================================================
     */

    const handleDisconnect = (reason: string) => {
      console.log("[VehicleRealtime] Disconnected:", reason);

      setConnected(false);

      setJoined(false);
    };

    /**
     * =====================================================
     * HANDLE CONNECT ERROR
     * =====================================================
     */

    const handleConnectError = (error: Error) => {
      console.error("[VehicleRealtime] Connection error:", error);

      setConnected(false);

      setJoined(false);
    };

    /**
     * =====================================================
     * REGISTER EVENTS
     * =====================================================
     */

    vehicleSocket.onConnect(handleConnect);

    vehicleSocket.onJoined(handleJoined);

    vehicleSocket.onUpdated(handleUpdated);

    vehicleSocket.onDisconnect(handleDisconnect);

    vehicleSocket.onConnectError(handleConnectError);

    /**
     * =====================================================
     * SOCKET SUDAH CONNECT
     * =====================================================
     *
     * Ini penting.
     *
     * Bisa saja service sudah connect sebelum
     * listener di atas dipasang.
     *
     * Kalau sudah connect, langsung join.
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
      vehicleSocket.offConnect(handleConnect);

      vehicleSocket.offJoined(handleJoined);

      vehicleSocket.offUpdated(handleUpdated);

      vehicleSocket.offDisconnect(handleDisconnect);

      vehicleSocket.offConnectError(handleConnectError);
    };
  }, [vehicleAssignmentId]);

  return {
    data,

    connected,

    joined,

    socketId,
  };
}

export const useVehicleRealtime = useVehicleSocket;
