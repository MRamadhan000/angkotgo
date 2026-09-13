 export function distanceInMeters(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
) {
  const earthRadius = 6371000;
  const latitudeDelta = ((secondLatitude - firstLatitude) * Math.PI) / 180;
  const longitudeDelta = ((secondLongitude - firstLongitude) * Math.PI) / 180;
  const firstLatitudeRadians = (firstLatitude * Math.PI) / 180;
  const secondLatitudeRadians = (secondLatitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitudeRadians) *
      Math.cos(secondLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

import type { Sinyal } from "@/types/sinyal.type";
import type { UpcomingVehicle, UpcomingVehiclesResponse } from "@/types/route-search.type";

/**
 * Mengubah data details[] dari response sinyal menjadi format UpcomingVehiclesResponse
 * yang dikenali oleh useUpcomingVehicles / UpcomingVehicleList.
 */
export function buildSyntheticUpcomingVehicles(
  sinyal: Sinyal,
): UpcomingVehiclesResponse {
  const vehicles: UpcomingVehicle[] = (sinyal.details ?? []).map((detail) => {
    const va = detail.vehicleAssignment;
    return {
      assignmentId: va.id,
      vehicleId: va.vehicleId,
      driverId: va.driverId,
      conductorId: va.conductorId,
      status: (va.status as UpcomingVehicle["status"]) ?? "ONGOING",
      hasLocationData: false,
      lastLocationAt: null,
      lastLocationAgeSeconds: null,
      vehicleLat: null,
      vehicleLng: null,
      hasPassedUser: false,
      distanceToUserMeters: 0,
      vehicleFraction: 0,
      driverName: va.driver?.name ?? null,
      vehicleCode: va.vehicle?.vehicleCode ?? null,
      vehicleCapacity: va.vehicle?.capacity ?? null,
      currentPassengers: va.currentPassengers ?? null,
      driver: va.driver ? { name: va.driver.name } : null,
      vehicle: va.vehicle
        ? { vehicleCode: va.vehicle.vehicleCode, capacity: va.vehicle.capacity }
        : null,
    };
  });

  return {
    routeLengthMeters: 0,
    userFraction: 0,
    userOffsetFromRouteMeters: 0,
    vehicles,
  };
}
