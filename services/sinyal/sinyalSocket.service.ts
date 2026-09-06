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
   * =========================================================
   * CONNECT
   * =========================================================
   */

  connect(): Socket {
    return io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  },

  /**
   * =========================================================
   * JOIN ASSIGNMENT
   * =========================================================
   *
   * Client join room berdasarkan
   * vehicleAssignmentId.
   *
   * Setelah join, Gateway akan:
   *
   * 1. memasukkan client ke room
   * 2. mengambil latest state dari Redis
   * 3. mengirim latest state ke client
   */

  joinAssignment(socket: Socket, vehicleAssignmentId: string): void {
    if (!socket.connected) {
      return;
    }

    socket.emit("sinyal:join", {
      vehicleAssignmentId,
    });
  },

  /**
   * =========================================================
   * LISTEN SINYAL UPDATE
   * =========================================================
   *
   * Event ini akan menerima:
   *
   * - latest state ketika baru join
   * - realtime update ketika ada perubahan
   */

  onSinyalUpdate(
    socket: Socket,
    callback: (data: SinyalRealtimePayload) => void,
  ): void {
    socket.on("sinyal:updated", callback);
  },

  /**
   * =========================================================
   * REMOVE LISTENER
   * =========================================================
   */

  offSinyalUpdate(
    socket: Socket,
    callback: (data: SinyalRealtimePayload) => void,
  ): void {
    socket.off("sinyal:updated", callback);
  },

  /**
   * =========================================================
   * DISCONNECT
   * =========================================================
   */

  disconnect(socket: Socket): void {
    socket.disconnect();
  },
};
