"use client";

import { useEffect, useState } from "react";

import {
  SinyalSocketService,
  SinyalRealtimePayload,
} from "@/services/sinyal/sinyal-socket.service";

export function useSinyalSocket(vehicleAssignmentId: string) {
  const [sinyal, setSinyal] = useState<SinyalRealtimePayload | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!vehicleAssignmentId) {
      return;
    }

    const socket = SinyalSocketService.connect();

    const handleConnect = () => {
      console.log("Sinyal socket connected:", socket.id);

      setConnected(true);

      SinyalSocketService.joinAssignment(socket, vehicleAssignmentId);
    };

    const handleDisconnect = () => {
      console.log("Sinyal socket disconnected");

      setConnected(false);
    };

    const handleSinyalUpdate = (data: SinyalRealtimePayload) => {
      console.log("Sinyal update:", data);

      setSinyal(data);
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    SinyalSocketService.onSinyalUpdate(socket, handleSinyalUpdate);

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
