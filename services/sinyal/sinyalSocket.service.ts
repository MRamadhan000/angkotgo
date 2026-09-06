import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface SinyalRealtimePayload {
  sinyalId: string;
  vehicleAssignmentId: string;
  latitude: number;
  longitude: number;
  status: "ACTIVE" | "COMPLETED";
}

export interface SinyalJoinPayload {
  vehicleAssignmentId: string;
}

class SinyalSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
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

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  join(vehicleAssignmentId: string): void {
    if (!this.socket) {
      console.warn("[SinyalSocket] Socket belum connect");

      return;
    }

    this.socket.emit("sinyal:join", {
      vehicleAssignmentId,
    });
  }

  onUpdated(callback: (data: SinyalRealtimePayload) => void): void {
    this.socket?.on("sinyal:updated", callback);
  }

  offUpdated(callback: (data: SinyalRealtimePayload) => void): void {
    this.socket?.off("sinyal:updated", callback);
  }

  onJoined(
    callback: (data: { vehicleAssignmentId: string; room: string }) => void,
  ): void {
    this.socket?.on("sinyal:joined", callback);
  }

  offJoined(
    callback: (data: { vehicleAssignmentId: string; room: string }) => void,
  ): void {
    this.socket?.off("sinyal:joined", callback);
  }

  onConnect(callback: () => void): void {
    this.socket?.on("connect", callback);
  }

  offConnect(callback: () => void): void {
    this.socket?.off("connect", callback);
  }

  onDisconnect(callback: (reason: string) => void): void {
    this.socket?.on("disconnect", callback);
  }

  offDisconnect(callback: (reason: string) => void): void {
    this.socket?.off("disconnect", callback);
  }

  onConnectError(callback: (error: Error) => void): void {
    this.socket?.on("connect_error", callback);
  }

  offConnectError(callback: (error: Error) => void): void {
    this.socket?.off("connect_error", callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const sinyalSocket = new SinyalSocketService();
