import { io, Socket } from "socket.io-client";
import { normalizePayment } from "@/services/payments/payment.service";
import type { Payment, PaymentSocketPayload } from "@/types/payments/payment.type";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

class PaymentSocketService {
  private socket: Socket | null = null;
  private updatedHandlers = new Map<
    (payment: Payment) => void,
    (payment: PaymentSocketPayload) => void
  >();

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    return this.socket;
  }

  join(vehicleAssignmentId: number): void {
    this.socket?.emit("payment:join", { vehicleAssignmentId });
  }

  onConnect(callback: () => void): void {
    this.socket?.on("connect", callback);
  }

  offConnect(callback: () => void): void {
    this.socket?.off("connect", callback);
  }

  onJoined(callback: (data: { vehicleAssignmentId: number; room: string }) => void): void {
    this.socket?.on("payment:joined", callback);
  }

  offJoined(callback: (data: { vehicleAssignmentId: number; room: string }) => void): void {
    this.socket?.off("payment:joined", callback);
  }

  onUpdated(callback: (payment: Payment) => void): void {
    const handler = (payment: PaymentSocketPayload) => {
      callback(normalizePayment(payment));
    };
    this.updatedHandlers.set(callback, handler);
    this.socket?.on("payment:updated", handler);
  }

  offUpdated(callback: (payment: Payment) => void): void {
    const handler = this.updatedHandlers.get(callback);
    if (handler) this.socket?.off("payment:updated", handler);
    this.updatedHandlers.delete(callback);
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
}

export const paymentSocket = new PaymentSocketService();
