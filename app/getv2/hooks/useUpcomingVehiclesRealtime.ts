import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/types/mapbox.type";
import type { UpcomingVehicle } from "@/types/route-search.type";
import {
  useUpcomingVehicles,
} from "@/hooks/routes/useRouteSearch";
import { useVehicleSockets } from "@/hooks/vehicles/useVehicleSocket";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments2";
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

  const { data: vehicleAssignments = [] } = useVehicleAssignments();

  // ─── Merge static + realtime + assignments ───
  const realtimeUpcomingVehicles = (upcomingVehicles?.vehicles ?? []).map(
    (vehicle) => {
      const realtime = realtimeVehicles[vehicle.assignmentId];
      const responseVehicle = vehicle as UpcomingVehicle & {
        current_passengers?: number | null;
        currentPassenger?: number | null;
      };
      const responsePassengers =
        responseVehicle.currentPassengers ??
        responseVehicle.current_passengers ??
        responseVehicle.currentPassenger ??
        null;
      const assignment = vehicleAssignments.find(
        (item) => item.id === vehicle.assignmentId,
      );

      const realtimePassengers =
        realtime?.currentPassengers ??
        (realtime as any)?.current_passengers ??
        (realtime as any)?.passengers ??
        (realtime as any)?.passengerCount;

      const currentPassengers =
        realtimePassengers !== undefined && realtimePassengers !== null
          ? Number(realtimePassengers)
          : responsePassengers !== null && responsePassengers !== undefined
          ? Number(responsePassengers)
          : assignment?.currentPassengers !== undefined && assignment?.currentPassengers !== null
          ? Number(assignment.currentPassengers)
          : null;

      return {
        ...vehicle,
        currentPassengers,
        ...(realtime
          ? {
              vehicleLat: realtime.latitude,
              vehicleLng: realtime.longitude,
              hasLocationData: true,
              lastLocationAt: realtime.createdAt,
              lastLocationAgeSeconds: 0,
              distanceToUserMeters: originCoords
                ? distanceInMeters(
                    originCoords.lat,
                    originCoords.lng,
                    realtime.latitude,
                    realtime.longitude,
                  )
                : vehicle.distanceToUserMeters,
            }
          : {}),
        driverName: vehicle.driverName ?? assignment?.driver?.name,
        vehicleCode: vehicle.vehicleCode ?? assignment?.vehicle?.vehicleCode,
        vehicleCapacity:
          vehicle.vehicleCapacity ?? assignment?.vehicle?.capacity,
        driver: vehicle.driver ?? assignment?.driver,
        vehicle: vehicle.vehicle ?? assignment?.vehicle,
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
