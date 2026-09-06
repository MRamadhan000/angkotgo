"use client";

import { useEffect, useState } from "react";

import {
  SinyalSocketService,
  SinyalRealtimePayload,
} from "@/services/sinyal/sinyalSocket.service";

export function useSinyalSocket(vehicleAssignmentId: string) {
  const [sinyal, setSinyal] = useState<SinyalRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!vehicleAssignmentId) {
      setSinyal(null);
      setConnected(false);
      return;
    }

    // Reset data ketika assignment berubah
    setSinyal(null);
    setConnected(false);

    const socket = SinyalSocketService.connect();

    /**
     * Socket berhasil connect
     */
    const handleConnect = () => {
      console.log("Sinyal socket connected:", socket.id);

      setConnected(true);

      // Join room berdasarkan vehicle assignment
      SinyalSocketService.joinAssignment(socket, vehicleAssignmentId);
    };

    /**
     * Socket disconnect
     */
    const handleDisconnect = () => {
      console.log("Sinyal socket disconnected");

      setConnected(false);
    };

    /**
     * Menerima update sinyal
     *
     * Event ini bisa berasal dari:
     *
     * 1. Latest data dari Redis ketika join
     * 2. Update realtime dari driver
     */
    const handleSinyalUpdate = (data: SinyalRealtimePayload) => {
      console.log("Sinyal update:", data);

      // Pastikan data untuk assignment yang sedang dilihat
      if (data.vehicleAssignmentId !== vehicleAssignmentId) {
        return;
      }

      setSinyal(data);
    };

    /**
     * =====================================================
     * REGISTER LISTENER
     * =====================================================
     *
     * Listener dipasang SEBELUM join.
     *
     * Karena setelah join Gateway bisa langsung
     * mengirim latest data dari Redis.
     */

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    SinyalSocketService.onSinyalUpdate(socket, handleSinyalUpdate);

    /**
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
      SinyalSocketService.offSinyalUpdate(socket, handleSinyalUpdate);

      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      SinyalSocketService.disconnect(socket);
    };
  }, [vehicleAssignmentId]);

  return {
    sinyal,
    connected,
  };
}
