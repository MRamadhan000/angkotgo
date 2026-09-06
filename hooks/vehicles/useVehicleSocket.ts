"use client";

import { useEffect, useState } from "react";

import {
  VehicleSocketService,
  VehicleRealtimePayload,
} from "@/services/vehicles/vehicleSocket.service";

export function useVehicleSocket(vehicleAssignmentId: number) {
  const [vehicle, setVehicle] = useState<VehicleRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!vehicleAssignmentId) {
      setVehicle(null);
      setConnected(false);
      return;
    }

    // Reset ketika assignment berubah
    setVehicle(null);
    setConnected(false);

    const socket = VehicleSocketService.connect();

    /**
     * Socket connected
     */
    const handleConnect = () => {
      console.log("Vehicle socket connected:", socket.id);

      setConnected(true);

      /**
       * Join room setelah socket connected
       */
      VehicleSocketService.joinAssignment(socket, vehicleAssignmentId);
    };

    /**
     * Socket disconnected
     */
    const handleDisconnect = () => {
      console.log("Vehicle socket disconnected");

      setConnected(false);
    };

    /**
     * Vehicle location update
     */
    const handleVehicleUpdate = (data: VehicleRealtimePayload) => {
      console.log("Vehicle location update:", data);

      /**
       * Pastikan update berasal dari
       * vehicle assignment yang sedang dilihat.
       */
      if (data.vehicleAssignmentId !== vehicleAssignmentId) {
        return;
      }

      setVehicle(data);
    };

    /**
     * Register listener
     *
     * Listener dipasang sebelum join supaya
     * latest data dari Redis tidak terlewat.
     */

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    VehicleSocketService.onVehicleUpdate(socket, handleVehicleUpdate);

    /**
     * Cleanup
     */
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
