"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Conductor,
  CreateConductorInput,
  UpdateConductorInput,
} from "@/types/conductor.type";
import { conductorService } from "@/services/conductor.service";

export function useConductors() {
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConductors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conductorService.getAllConductors();
      setConductors(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data kondektur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConductors();
  }, [fetchConductors]);

  const createConductor = async (data: CreateConductorInput) => {
    try {
      const newConductor = await conductorService.registerConductor(data);
      setConductors((prev) => [newConductor, ...prev]);
      return newConductor;
    } catch (err: any) {
      throw err;
    }
  };

  const updateConductor = async (
    id: number | string,
    data: UpdateConductorInput,
  ) => {
    try {
      const updated = await conductorService.updateConductor(id, data);
      setConductors((prev) =>
        prev.map((item) => (item.id === Number(id) ? updated : item)),
      );
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteConductor = async (id: number | string) => {
    try {
      await conductorService.deactiveConductor(id);
      setConductors((prev) => prev.filter((item) => item.id !== Number(id)));
    } catch (err: any) {
      throw err;
    }
  };

  const loginConductor = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const result = await conductorService.login(credentials);
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    conductors,
    loading,
    error,
    refetch: fetchConductors,
    createConductor,
    updateConductor,
    deleteConductor,
    loginConductor,
  };
}

export function useConductorDetail(id: number | string | null) {
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await conductorService.getConductorById(id);
        setConductor(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail kondektur");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { conductor, loading, error };
}