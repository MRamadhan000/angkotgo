"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  retrievePlace,
  reverseGeocode,
  suggestPlaces,
} from "@/services/mapbox.service";

type PointType = "origin" | "destination";

export function useMapbox() {
  /**
   * =========================================================
   * SEARCH BOX SESSION
   * =========================================================
   *
   * Satu session untuk origin.
   * Satu session untuk destination.
   *
   * useRef digunakan supaya session tidak berubah
   * setiap kali component melakukan re-render.
   */
  const originSession = useRef(crypto.randomUUID());
  const destinationSession = useRef(crypto.randomUUID());

  /**
   * =========================================================
   * GET SESSION TOKEN
   * =========================================================
   */
  const getSessionToken = (type: PointType) => {
    return type === "origin"
      ? originSession.current
      : destinationSession.current;
  };

  /**
   * =========================================================
   * SUGGEST
   * =========================================================
   */
  const suggest = useMutation({
    mutationFn: ({
      query,
      type,
      proximity,
    }: {
      query: string;
      type: PointType;
      proximity?: string;
    }) => {
      const sessionToken = getSessionToken(type);

      return suggestPlaces(query, sessionToken, proximity);
    },
  });

  /**
   * =========================================================
   * RETRIEVE
   * =========================================================
   *
   * Session yang digunakan harus sama dengan session
   * yang digunakan ketika suggest.
   */
  const retrieve = useMutation({
    mutationFn: ({ mapboxId, type }: { mapboxId: string; type: PointType }) => {
      const sessionToken = getSessionToken(type);

      return retrievePlace(mapboxId, sessionToken);
    },
  });

  /**
   * =========================================================
   * REVERSE GEOCODING
   * =========================================================
   *
   * Reverse tidak membutuhkan session Search Box.
   */
  const reverse = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      reverseGeocode(lat, lng),
  });

  /**
   * =========================================================
   * RESET SESSION
   * =========================================================
   *
   * Dipanggil ketika user menghapus origin/destination
   * dan memulai pencarian baru.
   */
  const resetSession = (type: PointType) => {
    if (type === "origin") {
      originSession.current = crypto.randomUUID();
    } else {
      destinationSession.current = crypto.randomUUID();
    }
  };

  return {
    suggest,
    retrieve,
    reverse,
    resetSession,
  };
}
