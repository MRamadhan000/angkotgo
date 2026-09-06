"use client";

import { useEffect, useState } from "react";

import {
  VehicleSocketService,
  VehicleRealtimePayload,
} from "@/services/vehicles/vehicle-socket.service";

export function useVehicleSocket(vehicleAssignmentId: number) {
  const [vehicle, setVehicle] = useState<VehicleRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!vehicleAssignmentId) {
      return;
    }

    const socket = VehicleSocketService.connect();

    // =========================
    // CONNECT
    // =========================
    const handleConnect = () => {
      console.log("Vehicle socket connected:", socket.id);

      setConnected(true);

      VehicleSocketService.joinAssignment(socket, vehicleAssignmentId);
    };

    // =========================
    // DISCONNECT
    // =========================
    const handleDisconnect = () => {
      console.log("Vehicle socket disconnected");

      setConnected(false);
    };

    // =========================
    // VEHICLE UPDATE
    // =========================
    const handleVehicleUpdate = (data: VehicleRealtimePayload) => {
      console.log("Vehicle update:", data);

      setVehicle(data);
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    VehicleSocketService.onVehicleUpdate(socket, handleVehicleUpdate);

    // =========================
    // CLEANUP
    // =========================
    return () => {
      VehicleSocketService.offVehicleUpdate(socket, handleVehicleUpdate);

      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      VehicleSocketService.disconnect(socket);
    };
  }, [vehicleAssignmentId]);

  return {
    vehicle,
    connected,
  };
}
