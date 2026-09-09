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
      const payloadWithAliases = payload as VehicleRealtimePayload & {
        assignmentId?: number | string;
        id?: number | string;
      };
      const payloadAssignmentId = Number(
        payloadWithAliases.vehicleAssignmentId ??
        payloadWithAliases.assignmentId ??
        payloadWithAliases.id,
      );

      if (
        payloadAssignmentId &&
        Number(vehicleAssignmentId) &&
        payloadAssignmentId !== Number(vehicleAssignmentId)
      ) {
        return;
      }

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
    const assignmentIds = [
      ...new Set(
        vehicleAssignmentIds
          .map((assignmentId) => Number(assignmentId))
          .filter((assignmentId) => Number.isFinite(assignmentId) && assignmentId > 0),
      ),
    ];
    if (assignmentIds.length === 0) {
      const resetTimer = window.setTimeout(() => {
        setData({});
        setJoinedAssignmentIds([]);
        setConnected(false);
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    const socket = vehicleSocket.connect();
    const handleConnect = () => {
      setConnected(true);
      assignmentIds.forEach((assignmentId) => vehicleSocket.join(assignmentId));
    };
    const handleJoined = ({ vehicleAssignmentId }: { vehicleAssignmentId: number | string }) => {
      const joinedAssignmentId = Number(vehicleAssignmentId);
      if (!assignmentIds.includes(joinedAssignmentId)) return;

      setJoinedAssignmentIds((current) =>
        current.includes(joinedAssignmentId)
          ? current
          : [...current, joinedAssignmentId],
      );
    };
    const handleUpdated = (payload: VehicleRealtimePayload) => {
      const rawPayload = payload as VehicleRealtimePayload & {
        data?: Partial<VehicleRealtimePayload> & {
          assignmentId?: number | string;
          current_passengers?: number | null;
          currentPassenger?: number | null;
          passengers?: number | null;
          passengerCount?: number | null;
        };
      };
      const payloadData = (
        rawPayload.data && typeof rawPayload.data === "object"
          ? rawPayload.data
          : rawPayload
      ) as Partial<VehicleRealtimePayload> & {
        vehicleAssignmentId?: number | string;
        assignmentId?: number | string;
        id?: number | string;
        current_passengers?: number | null;
        currentPassenger?: number | null;
        passengers?: number | null;
        passengerCount?: number | null;
      };
      const payloadAssignmentId = Number(
        payloadData.vehicleAssignmentId ??
        payloadData.assignmentId ??
        payloadData.id,
      );

      if (!payloadAssignmentId || !assignmentIds.includes(payloadAssignmentId)) return;
      const currentPassengers =
        payloadData.currentPassengers ??
        payloadData.current_passengers ??
        payloadData.currentPassenger ??
        payloadData.passengers ??
        payloadData.passengerCount;

      setData((current) => ({
        ...current,
        [payloadAssignmentId]: {
          ...(payload as VehicleRealtimePayload),
          ...(payloadData as VehicleRealtimePayload),
          vehicleAssignmentId: payloadAssignmentId,
          ...(currentPassengers !== undefined
            ? { currentPassengers: Number(currentPassengers) }
            : {}),
        },
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
