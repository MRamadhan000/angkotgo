import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface VehicleRealtimePayload {
  vehicleAssignmentId: number;
  currentPassengers: number;
  latitude: number;
  longitude: number;
  currentStopId?: number;
  stopStatus: string;
  createdAt: string;
}

interface VehicleJoinResponse {
  vehicleAssignmentId: number;
  room: string;
}

class VehicleSocketService {
  private socket: Socket | null = null;

  /**
   * =====================================================
   * CONNECT
   * =====================================================
   */
  connect(): Socket {
    // Jangan membuat connection baru kalau
    // socket sudah ada dan masih connected
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,
    });

    return this.socket;
  }

  /**
   * =====================================================
   * DISCONNECT
   * =====================================================
   */
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();

    this.socket = null;
  }

  /**
   * =====================================================
   * JOIN VEHICLE
   * =====================================================
   */
  join(vehicleAssignmentId: number): void {
    if (!this.socket) {
      console.warn("[VehicleSocket] Socket belum connect");

      return;
    }

    this.socket.emit("vehicle:join", {
      vehicleAssignmentId,
    });
  }

  /**
   * =====================================================
   * VEHICLE UPDATED
   * =====================================================
   */
  onUpdated(
    callback: (data: VehicleRealtimePayload) => void,
  ): void {
    this.socket?.on("vehicle:updated", callback);
  }

  offUpdated(
    callback: (data: VehicleRealtimePayload) => void,
  ): void {
    this.socket?.off("vehicle:updated", callback);
  }

  /**
   * =====================================================
   * VEHICLE JOINED
   * =====================================================
   */
  onJoined(
    callback: (data: VehicleJoinResponse) => void,
  ): void {
    this.socket?.on("vehicle:joined", callback);
  }

  offJoined(
    callback: (data: VehicleJoinResponse) => void,
  ): void {
    this.socket?.off("vehicle:joined", callback);
  }

  /**
   * =====================================================
   * CONNECT
   * =====================================================
   */
  onConnect(callback: () => void): void {
    this.socket?.on("connect", callback);
  }

  offConnect(callback: () => void): void {
    this.socket?.off("connect", callback);
  }

  /**
   * =====================================================
   * DISCONNECT
   * =====================================================
   */
  onDisconnect(
    callback: (reason: string) => void,
  ): void {
    this.socket?.on("disconnect", callback);
  }

  offDisconnect(
    callback: (reason: string) => void,
  ): void {
    this.socket?.off("disconnect", callback);
  }

  /**
   * =====================================================
   * CONNECT ERROR
   * =====================================================
   */
  onConnectError(
    callback: (error: Error) => void,
  ): void {
    this.socket?.on("connect_error", callback);
  }

  offConnectError(
    callback: (error: Error) => void,
  ): void {
    this.socket?.off("connect_error", callback);
  }

  /**
   * =====================================================
   * GET SOCKET
   * =====================================================
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * =====================================================
   * GET SOCKET ID
   * =====================================================
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * =====================================================
   * IS CONNECTED
   * =====================================================
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const vehicleSocket =
  new VehicleSocketService();