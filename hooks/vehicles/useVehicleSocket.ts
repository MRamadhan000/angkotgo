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

export interface VehicleRealtimeByAssignment {
  data: Record<number, VehicleRealtimePayload>;
  connected: boolean;
  joinedAssignmentIds: number[];
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

export function useVehicleSockets(
  vehicleAssignmentIds: number[],
): VehicleRealtimeByAssignment {
  const [data, setData] = useState<Record<number, VehicleRealtimePayload>>({});
  const [connected, setConnected] = useState(false);
  const [joinedAssignmentIds, setJoinedAssignmentIds] = useState<number[]>([]);

  useEffect(() => {
    const assignmentIds = [...new Set(vehicleAssignmentIds)].filter(Number.isFinite);
    if (assignmentIds.length === 0) {
      setData({});
      setJoinedAssignmentIds([]);
      setConnected(false);
      return;
    }

    const socket = vehicleSocket.connect();
    const handleConnect = () => {
      setConnected(true);
      assignmentIds.forEach((assignmentId) => vehicleSocket.join(assignmentId));
    };
    const handleJoined = ({ vehicleAssignmentId }: { vehicleAssignmentId: number }) => {
      setJoinedAssignmentIds((current) =>
        current.includes(vehicleAssignmentId)
          ? current
          : [...current, vehicleAssignmentId],
      );
    };
    const handleUpdated = (payload: VehicleRealtimePayload) => {
      if (!assignmentIds.includes(Number(payload.vehicleAssignmentId))) return;
      setData((current) => ({
        ...current,
        [Number(payload.vehicleAssignmentId)]: payload,
      }));
    };
    const handleDisconnect = () => {
      setConnected(false);
      setJoinedAssignmentIds([]);
    };

    vehicleSocket.onConnect(handleConnect);
    vehicleSocket.onJoined(handleJoined);
    vehicleSocket.onUpdated(handleUpdated);
    vehicleSocket.onDisconnect(handleDisconnect);

    if (socket.connected) handleConnect();

    return () => {
      vehicleSocket.offConnect(handleConnect);
      vehicleSocket.offJoined(handleJoined);
      vehicleSocket.offUpdated(handleUpdated);
      vehicleSocket.offDisconnect(handleDisconnect);
    };
  }, [vehicleAssignmentIds.join(",")]);

  return { data, connected, joinedAssignmentIds };
}
