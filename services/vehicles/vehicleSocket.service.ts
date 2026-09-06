import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface VehicleRealtimePayload {
  vehicleAssignmentId: number;
  latitude: number;
  longitude: number;
  currentStopId?: number;
  stopStatus: string;
  createdAt: string;
}

export const VehicleSocketService = {
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
   * Client join room berdasarkan vehicleAssignmentId.
   *
   * Setelah join, Gateway akan:
   *
   * 1. memasukkan client ke room
   * 2. mengambil latest location dari Redis
   * 3. mengirim latest location ke client
   */

  joinAssignment(socket: Socket, vehicleAssignmentId: number): void {
    if (!socket.connected) {
      return;
    }

    socket.emit("vehicle:join", {
      vehicleAssignmentId,
    });
  },

  /**
   * =========================================================
   * LISTEN VEHICLE UPDATE
   * =========================================================
   *
   * Event ini menerima:
   *
   * - latest location ketika pertama kali join
   * - realtime location ketika driver bergerak
   */

  onVehicleUpdate(
    socket: Socket,
    callback: (data: VehicleRealtimePayload) => void,
  ): void {
    socket.on("vehicle:updated", callback);
  },

  /**
   * =========================================================
   * REMOVE LISTENER
   * =========================================================
   */

  offVehicleUpdate(
    socket: Socket,
    callback: (data: VehicleRealtimePayload) => void,
  ): void {
    socket.off("vehicle:updated", callback);
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
