"use client";

import { useCallback, useEffect, useState } from "react";
import { getFinancialByVehicleAssignment } from "@/services/payment.service";
import { VehicleAssignmentFinancialResponse } from "@/types/payment.type";

export function useVehicleAssignmentFinancial(vehicleAssignmentId: number) {
  const [data, setData] = useState<VehicleAssignmentFinancialResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancial = useCallback(async () => {
    if (!vehicleAssignmentId || Number.isNaN(vehicleAssignmentId)) {
      setData(null);
      setIsLoading(false);
      setError("ID penugasan tidak valid.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getFinancialByVehicleAssignment(vehicleAssignmentId);

      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengambil data pembayaran.";

      setData(null);
      setError(message);
      console.error("[useVehicleAssignmentFinancial]", err);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleAssignmentId]);

  useEffect(() => {
    void fetchFinancial();
  }, [fetchFinancial]);

  return {
    data,
    summary: data?.summary ?? null,
    payments: data?.payments ?? [],
    isLoading,
    error,
    refetch: fetchFinancial,
  };
}
