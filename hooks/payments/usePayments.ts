"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService } from "@/services/payments/payment.service";
import type {
  CreatePaymentInput,
  Payment,
  PaymentCreateResponse,
  PaymentFinancialResponse,
  PaymentHistoryItem,
  PaymentWebhookResponse,
} from "@/types/payments/payment.type";
import { useQuery } from "@tanstack/react-query";

export function usePayments(assignmentId: number | null) {
  const [data, setData] = useState<PaymentFinancialResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [markingSucceeded, setMarkingSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!assignmentId) return null;

    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getFinancial(assignmentId);
      setData(result);
      return result;
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Gagal mengambil data pembayaran.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refetch();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refetch]);

  const create = useCallback(
    async (
      userId: number,
      input: CreatePaymentInput,
    ): Promise<PaymentCreateResponse> => {
      setCreating(true);
      setError(null);
      try {
        const result = await paymentService.create(userId, input);
        setData((previous) => ({
          summary: previous?.summary ?? null,
          payments: previous
            ? [result.data, ...previous.payments]
            : [result.data],
        }));
        return result;
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Gagal membuat pembayaran.";
        setError(message);
        throw new Error(message);
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const upsertPayment = useCallback((payment: Payment) => {
    setData((previous) => {
      const payments = previous?.payments ?? [];
      const index = payments.findIndex((item) => item.id === payment.id);
      if (index < 0)
        return {
          summary: previous?.summary ?? null,
          payments: [payment, ...payments],
        };
      const next = [...payments];
      next[index] = payment;
      return { summary: previous?.summary ?? null, payments: next };
    });
  }, []);

  const markAsSucceeded = useCallback(
    async (paymentRequestId: string): Promise<PaymentWebhookResponse> => {
      setMarkingSucceeded(true);
      setError(null);
      try {
        return await paymentService.markAsSucceeded({
          payment_request_id: paymentRequestId,
          status: "SUCCEEDED",
        });
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Gagal mengubah status pembayaran.";
        setError(message);
        throw new Error(message);
      } finally {
        setMarkingSucceeded(false);
      }
    },
    [],
  );

  return {
    payments: data?.payments ?? [],
    summary: data?.summary ?? null,
    loading,
    creating,
    markingSucceeded,
    error,
    refetch,
    create,
    upsertPayment,
    markAsSucceeded,
  };
}

export function useHistoryPayments(userId: number | string | null) {
  return useQuery<PaymentHistoryItem[]>({
    queryKey: ["payments", "user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID tidak valid");
      return paymentService.getHistoryByUserId(userId);
    },
    enabled: !!userId, // Hanya jalankan query jika userId ada
  });
}
