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
   * Connect ke WebSocket
   */
  connect(): Socket {
    return io(SOCKET_URL, {
      transports: ["websocket"],
    });
  },

  /**
   * Join room berdasarkan
   * vehicleAssignmentId
   */
  joinAssignment(socket: Socket, vehicleAssignmentId: number) {
    socket.emit("vehicle:join", {
      vehicleAssignmentId,
    });
  },

  /**
   * Listen update lokasi kendaraan
   */
  onVehicleUpdate(
    socket: Socket,
    callback: (data: VehicleRealtimePayload) => void,
  ) {
    socket.on("vehicle:updated", callback);
  },

  /**
   * Remove listener
   */
  offVehicleUpdate(
    socket: Socket,
    callback: (data: VehicleRealtimePayload) => void,
  ) {
    socket.off("vehicle:updated", callback);
  },

  /**
   * Disconnect socket
   */
  disconnect(socket: Socket) {
    socket.disconnect();
  },
};
