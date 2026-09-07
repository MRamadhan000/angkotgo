"use client";

import { useEffect, useState } from "react";
import { paymentSocket } from "@/services/payments/paymentSocket.service";
import type { Payment } from "@/types/payments/payment.type";

export function usePaymentSocket(assignmentId: number | null) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const socket = paymentSocket.connect();
    const handleConnect = () => {
      setConnected(true);
      setError(null);
      paymentSocket.join(assignmentId);
    };
    const handleJoined = (response: { vehicleAssignmentId: number }) => {
      if (response.vehicleAssignmentId === assignmentId) setJoined(true);
    };
    const handleUpdated = (nextPayment: Payment) => {
      if (nextPayment.vehicle_assignment_id === assignmentId) {
        setPayment(nextPayment);
      }
    };
    const handleDisconnect = () => {
      setConnected(false);
      setJoined(false);
    };
    const handleConnectError = (socketError: Error) => {
      setConnected(false);
      setError(socketError.message);
    };

    paymentSocket.onConnect(handleConnect);
    paymentSocket.onJoined(handleJoined);
    paymentSocket.onUpdated(handleUpdated);
    paymentSocket.onDisconnect(handleDisconnect);
    paymentSocket.onConnectError(handleConnectError);

    if (socket.connected) handleConnect();

    return () => {
      paymentSocket.offConnect(handleConnect);
      paymentSocket.offJoined(handleJoined);
      paymentSocket.offUpdated(handleUpdated);
      paymentSocket.offDisconnect(handleDisconnect);
      paymentSocket.offConnectError(handleConnectError);
    };
  }, [assignmentId]);

  return { payment, connected, joined, error };
}
