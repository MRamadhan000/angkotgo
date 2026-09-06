import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type SinyalStatusRealtime = "ACTIVE" | "COMPLETED";

export interface SinyalRealtimePayload {
  sinyalId: string;
  vehicleAssignmentId: string;
  latitude: number;
  longitude: number;
  status: SinyalStatusRealtime;
}

export const SinyalSocketService = {
  /**
   * Connect ke WebSocket
   */
  connect(): Socket {
    return io(SOCKET_URL, {
      transports: ["websocket"],
    });
  },

  /**
   * Driver join room berdasarkan
   * vehicleAssignmentId
   */
  joinAssignment(socket: Socket, vehicleAssignmentId: string) {
    socket.emit("sinyal:join", {
      vehicleAssignmentId,
    });
  },

  /**
   * Listen perubahan sinyal
   */
  onSinyalUpdate(
    socket: Socket,
    callback: (data: SinyalRealtimePayload) => void,
  ) {
    socket.on("sinyal:updated", callback);
  },

  /**
   * Remove listener
   */
  offSinyalUpdate(
    socket: Socket,
    callback: (data: SinyalRealtimePayload) => void,
  ) {
    socket.off("sinyal:updated", callback);
  },

  /**
   * Disconnect WebSocket
   */
  disconnect(socket: Socket) {
    socket.disconnect();
  },
};
