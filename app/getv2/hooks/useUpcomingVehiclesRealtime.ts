import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/types/mapbox.type";
import {
  useUpcomingVehicles,
} from "@/hooks/routes/useRouteSearch";
import { useVehicleSockets } from "@/hooks/vehicles/useVehicleSocket";
import {
  calculateOsrmEstimates,
  type OsrmVehicleEstimate,
} from "@/utils/osrm-estimates";
import { distanceInMeters } from "../getv2.util";
import type { SelectedRoute } from "../types";

/**
 * Mengelola data kendaraan Skenario 2:
 * - Fetch upcoming vehicles dari API
 * - Merge dengan data realtime via WebSocket
 * - Hitung OSRM estimates (ETA & jarak)
 */
export function useUpcomingVehiclesRealtime(
  selectedRoute: SelectedRoute | null,
  originCoords: Coordinates | null,
  destinationCoords: Coordinates | null,
) {
  const [osrmEstimates, setOsrmEstimates] = useState<
    Record<number, OsrmVehicleEstimate>
  >({});
  const osrmEstimateKeyRef = useRef<string | null>(null);

  // ─── Params upcoming vehicles ───
  const upcomingVehiclesParams =
    selectedRoute && originCoords
      ? {
          routeId: selectedRoute.routeId,
          direction: selectedRoute.direction,
          latitude: originCoords.lat,
          longitude: originCoords.lng,
        }
      : null;

  const {
    data: upcomingVehicles,
    isFetching: isLoadingUpcomingVehicles,
    isError: isUpcomingVehiclesError,
    error: upcomingVehiclesError,
  } = useUpcomingVehicles(upcomingVehiclesParams);

  // ─── Realtime via WebSocket ───
  const upcomingAssignmentIds = (upcomingVehicles?.vehicles ?? []).map(
    (vehicle) => vehicle.assignmentId,
  );

  const {
    data: realtimeVehicles,
    connected: isVehicleSocketConnected,
    joinedAssignmentIds,
  } = useVehicleSockets(upcomingAssignmentIds);

  // ─── Merge static + realtime ───
  const realtimeUpcomingVehicles = (upcomingVehicles?.vehicles ?? []).map(
    (vehicle) => {
      const realtime = realtimeVehicles[vehicle.assignmentId];

      // The upcoming API seeds the card; the matching assignment channel can
      // replace the passenger count as soon as a vehicle:updated event arrives.
      const currentPassengers =
        realtime?.currentPassengers !== undefined &&
        realtime?.currentPassengers !== null
          ? Number(realtime.currentPassengers)
          : vehicle.currentPassengers ?? null;
      const vehicleCapacity =
        vehicle.capacity ??
        vehicle.vehicleCapacity ??
        vehicle.vehicle?.capacity ??
        null;
      const hasRealtimeLocation =
        realtime?.latitude !== undefined &&
        realtime?.latitude !== null &&
        realtime?.longitude !== undefined &&
        realtime?.longitude !== null;

      return {
        ...vehicle,
        currentPassengers,
        ...(hasRealtimeLocation
          ? {
              vehicleLat: realtime!.latitude,
              vehicleLng: realtime!.longitude,
              hasLocationData: true,
              lastLocationAt: realtime!.createdAt,
              lastLocationAgeSeconds: 0,
              distanceToUserMeters: originCoords
                ? distanceInMeters(
                    originCoords.lat,
                    originCoords.lng,
                    realtime!.latitude,
                    realtime!.longitude,
                  )
                : vehicle.distanceToUserMeters,
            }
          : {}),
        driverName: vehicle.driverName,
        vehicleCode: vehicle.vehicleCode,
        vehicleCapacity,
        driver: vehicle.driver,
        vehicle: vehicle.vehicle
          ? { ...vehicle.vehicle, capacity: vehicleCapacity }
          : vehicle.vehicle,
        osrmEstimate: osrmEstimates[vehicle.assignmentId] ?? null,
      };
    },
  );

  // ─── Hitung OSRM estimates ───
  useEffect(() => {
    if (
      !upcomingVehicles?.vehicles.length ||
      !originCoords ||
      !destinationCoords
    ) {
      return;
    }

    const estimateKey = [
      originCoords.lat,
      originCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng,
      ...upcomingVehicles.vehicles.map(
        (vehicle) =>
          `${vehicle.assignmentId}:${vehicle.vehicleLat}:${vehicle.vehicleLng}`,
      ),
    ].join("|");

    if (osrmEstimateKeyRef.current === estimateKey) return;
    osrmEstimateKeyRef.current = estimateKey;

    calculateOsrmEstimates(
      upcomingVehicles.vehicles,
      { latitude: originCoords.lat, longitude: originCoords.lng },
      { latitude: destinationCoords.lat, longitude: destinationCoords.lng },
    )
      .then(setOsrmEstimates)
      .catch((error) => {
        console.error("Gagal menghitung estimasi OSRM:", error);
      });
  }, [upcomingVehicles, originCoords, destinationCoords]);

  return {
    upcomingVehicles,
    realtimeVehicles,
    realtimeUpcomingVehicles,
    isLoadingUpcomingVehicles,
    isUpcomingVehiclesError,
    upcomingVehiclesError,
    upcomingAssignmentIds,
    isVehicleSocketConnected,
    joinedAssignmentIds,
  };
}
