"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import {
  useUpdateVehicleAssignmentv2,
  useVehicleAssignmentv2,
} from "@/hooks/vehicles/useVehicleAssignments2";
import {
  useCreateVehicleLocation,
  useVehicleLocations,
} from "@/hooks/vehicles/useVehicleLocation";
import { useVehicleSocket } from "@/hooks/vehicles/useVehicleSocket";
import { useActiveSinyal } from "@/hooks/sinyal/useSinyal";
import { useSinyalRealtime } from "@/hooks/sinyal/useSinyalSocket";
import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useRouteStops } from "@/hooks/routes/useRouteStops";
import { usePayments } from "@/hooks/payments/usePayments";
import { usePaymentSocket } from "@/hooks/payments/usePaymentSocket";

import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";
import { RouteStopType } from "@/types/routes/route-stop.type";

import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";

// ─── Types ───────────────────────────────────────────────────
export type LocationSource = "manual" | "gps" | "socket" | "last-known";

export interface ActiveUserLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: "ACTIVE";
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// ─── Hook ────────────────────────────────────────────────────
export function useAssignmentDetail() {
  const params = useParams();
  const rawSlug = params?.slug;
  const assignmentId = Number(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
  const hasValidAssignmentId =
    Number.isInteger(assignmentId) && assignmentId > 0;

  const { user } = useAuth();

  // ── Modal state ──────────────────────────────────────────
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("SCHEDULED");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // ── GPS state ────────────────────────────────────────────
  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<Coordinate | null>(null);
  const [selectedVehicleLocation, setSelectedVehicleLocation] =
    useState<Coordinate | null>(null);

  // ── Data fetching hooks ──────────────────────────────────
  const {
    data: assignmentDetail,
    isLoading: detailLoading,
    error: assignmentError,
  } = useVehicleAssignmentv2(assignmentId);

  const updateAssignment = useUpdateVehicleAssignmentv2();

  const { data: vehicleLocations = [] } = useVehicleLocations(
    hasValidAssignmentId ? assignmentId : undefined,
  );

  const createVehicleLocation = useCreateVehicleLocation();

  const {
    payments,
    summary,
    loading: paymentsLoading,
    error: paymentsError,
    upsertPayment,
  } = usePayments(hasValidAssignmentId ? assignmentId : null);

  const paymentRealtime = usePaymentSocket(
    hasValidAssignmentId ? assignmentId : null,
  );

  const {
    data: vehicleRealtime,
    connected: vehicleSocketConnected,
    joined: vehicleSocketJoined,
  } = useVehicleSocket(hasValidAssignmentId ? assignmentId : null);

  const assignmentKey = hasValidAssignmentId ? String(assignmentId) : "";

  const { data: activeUserSignals = [] } = useActiveSinyal(assignmentKey);

  const {
    data: userRealtime,
    connected: userSocketConnected,
    joined: userSocketJoined,
  } = useSinyalRealtime(hasValidAssignmentId ? assignmentKey : null);

  const direction = assignmentDetail?.direction;
  const routeId = assignmentDetail?.routeId ?? 0;

  const { data: routePaths = [] } = useRoutePaths(routeId, direction!);
  const { data: routeStops = [] } = useRouteStops(routeId, direction!);

  // ── Computed values ──────────────────────────────────────
  const detailError = assignmentError?.message ?? null;

  const latestVehicleLocation = useMemo(
    () =>
      [...vehicleLocations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ?? null,
    [vehicleLocations],
  );

  const activeUserLocations = useMemo(() => {
    const locations = activeUserSignals
      .filter(
        (signal) =>
          signal.status === "ACTIVE" &&
          (String(signal.vehicleAssignmentId) === assignmentKey ||
            signal.details.some(
              (detail) =>
                String(detail.vehicleAssignmentId) === assignmentKey,
            )),
      )
      .map((signal) => ({
        id: signal.id,
        latitude: Number(signal.latitude),
        longitude: Number(signal.longitude),
        status: "ACTIVE" as const,
      }));

    if (
      userRealtime?.status === "ACTIVE" &&
      String(userRealtime.vehicleAssignmentId) === assignmentKey
    ) {
      const realtimeLocation = {
        id: userRealtime.sinyalId,
        latitude: Number(userRealtime.latitude),
        longitude: Number(userRealtime.longitude),
        status: "ACTIVE" as const,
      };
      const existingIndex = locations.findIndex(
        (location) => location.id === realtimeLocation.id,
      );

      if (existingIndex >= 0) locations[existingIndex] = realtimeLocation;
      else locations.push(realtimeLocation);
    }

    return locations.filter(
      (location) =>
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude),
    );
  }, [activeUserSignals, assignmentKey, userRealtime]);

  const vehicleLocation = vehicleRealtime
    ? {
        latitude: Number(vehicleRealtime.latitude),
        longitude: Number(vehicleRealtime.longitude),
      }
    : latestVehicleLocation
      ? {
          latitude: Number(latestVehicleLocation.latitude),
          longitude: Number(latestVehicleLocation.longitude),
        }
      : null;

  const displayedVehicleLocation =
    selectedVehicleLocation ?? gpsLocation ?? vehicleLocation;

  const locationSource: LocationSource = selectedVehicleLocation
    ? "manual"
    : gpsLocation
      ? "gps"
      : vehicleRealtime
        ? "socket"
        : "last-known";

  const locationSourceLabel = selectedVehicleLocation
    ? "manual / route stop"
    : gpsLocation
      ? "GPS browser"
      : vehicleRealtime
        ? "socket"
        : "POST terakhir";

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => {
    if (paymentRealtime.payment) {
      upsertPayment(paymentRealtime.payment);
    }
  }, [paymentRealtime.payment, upsertPayment]);

  useEffect(() => {
    if (
      !hasValidAssignmentId ||
      !gpsPermissionGranted ||
      !navigator.geolocation
    ) {
      return;
    }

    let isMounted = true;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isMounted || selectedVehicleLocation) return;
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (isMounted && error.code !== 1) {
          setLocationError(
            "Lokasi GPS belum tersedia. Posisi socket/manual tetap dapat digunakan.",
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [gpsPermissionGranted, hasValidAssignmentId, selectedVehicleLocation]);

  // ── Handlers ─────────────────────────────────────────────
  const handleEnableGps = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      setGpsLocation(location);
      setGpsPermissionGranted(true);
      setShowGpsModal(false);
    } catch (error) {
      setLocationError(
        error instanceof GeolocationPositionError && error.code === 1
          ? "Akses GPS wajib diizinkan untuk menampilkan posisi awal driver."
          : "Lokasi GPS belum tersedia. Coba aktifkan GPS lalu ulangi.",
      );
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!assignmentDetail || !hasValidAssignmentId) return;
    try {
      await updateAssignment.mutateAsync({
        id: assignmentId,
        data: { status: selectedStatus as AssignmentStatus },
      });
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Gagal mengubah status:", error);
    }
  }, [
    assignmentDetail,
    hasValidAssignmentId,
    assignmentId,
    selectedStatus,
    updateAssignment,
  ]);

  const handleCreateVehicleLocation = useCallback(
    async (stop: RouteStopType) => {
      if (!hasValidAssignmentId) return;

      setLocationError(null);
      try {
        await createVehicleLocation.mutateAsync({
          vehicleAssignmentId: assignmentId,
          latitude: Number(stop.latitude),
          longitude: Number(stop.longitude),
          currentStopId: stop.id,
        });
        setSelectedVehicleLocation({
          latitude: Number(stop.latitude),
          longitude: Number(stop.longitude),
        });
        setIsLocationModalOpen(false);
      } catch (error) {
        setLocationError(
          error instanceof Error
            ? error.message
            : "Gagal menyimpan posisi kendaraan.",
        );
      }
    },
    [hasValidAssignmentId, assignmentId, createVehicleLocation],
  );

  const handleUpdatePassengers = useCallback(
    (currentPassengers: number) =>
      updateAssignment.mutateAsync({
        id: assignmentId,
        data: { currentPassengers },
      }),
    [assignmentId, updateAssignment],
  );

  // ── Return ───────────────────────────────────────────────
  return {
    // Auth
    user,

    // Core data
    assignmentId,
    assignmentDetail,
    hasValidAssignmentId,
    routePaths,
    routeStops,

    // Loading & error
    detailLoading,
    detailError,

    // Payments
    payments,
    paymentSummary: summary,
    paymentsLoading,
    paymentsError,
    paymentRealtimeStatus: {
      connected: paymentRealtime.connected,
      joined: paymentRealtime.joined,
    },

    // Location
    displayedVehicleLocation,
    locationSource,
    locationSourceLabel,
    activeUserLocations,
    locationError,

    // GPS
    gpsState: {
      isLocating,
      showModal: showGpsModal,
      granted: gpsPermissionGranted,
    },

    // Socket status (for debug)
    vehicleSocketStatus: {
      connected: vehicleSocketConnected,
      joined: vehicleSocketJoined,
    },
    userSocketStatus: {
      connected: userSocketConnected,
      joined: userSocketJoined,
    },

    // Modal state
    isStatusModalOpen,
    selectedStatus,
    isLocationModalOpen,

    // Mutation states
    isUpdatingStatus: updateAssignment.isPending,
    isUpdatingLocation: createVehicleLocation.isPending,

    // Actions
    actions: {
      enableGps: handleEnableGps,
      updateStatus: handleUpdateStatus,
      createVehicleLocation: handleCreateVehicleLocation,
      updatePassengers: handleUpdatePassengers,
      openStatusModal: () => setIsStatusModalOpen(true),
      closeStatusModal: () => setIsStatusModalOpen(false),
      setSelectedStatus: (status: string) => setSelectedStatus(status),
      openLocationModal: () => setIsLocationModalOpen(true),
      closeLocationModal: () => setIsLocationModalOpen(false),
      dismissGpsModal: () => undefined,
    },
  };
}
