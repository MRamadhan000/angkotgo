export interface OsrmCoordinate {
  latitude: number;
  longitude: number;
}

export interface OsrmEstimate {
  distanceMeters: number;
  durationSeconds: number;
  durationMinSeconds: number;
  durationMaxSeconds: number;
}

export interface OsrmVehicleEstimate {
  total: OsrmEstimate | null;
  vehicleToUser: OsrmEstimate | null;
  userToDestination: OsrmEstimate | null;
}

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
  }>;
}

const OSRM_BASE_URL =
  process.env.NEXT_PUBLIC_OSRM_URL || "https://router.project-osrm.org";

const MIN_SPEED_KMH = 12;
const MAX_SPEED_KMH = 25;

function durationForSpeed(distanceMeters: number, speedKmh: number) {
  return (distanceMeters / 1000 / speedKmh) * 3600;
}

async function getOsrmRoute(
  coordinates: OsrmCoordinate[],
): Promise<OsrmEstimate | null> {
  if (coordinates.length < 2) return null;

  const coordinatePath = coordinates
    .map(({ longitude, latitude }) => `${longitude},${latitude}`)
    .join(";");
  const response = await fetch(
    `${OSRM_BASE_URL}/route/v1/driving/${coordinatePath}?overview=false&steps=false`,
  );

  if (!response.ok) return null;

  const result = (await response.json()) as OsrmRouteResponse;
  const route = result.routes?.[0];
  if (result.code !== "Ok" || !route) return null;

  return {
    distanceMeters: route.distance,
    durationSeconds: Math.round(
      (durationForSpeed(route.distance, MIN_SPEED_KMH) +
        durationForSpeed(route.distance, MAX_SPEED_KMH)) /
        2,
    ),
    durationMinSeconds: Math.round(
      durationForSpeed(route.distance, MAX_SPEED_KMH),
    ),
    durationMaxSeconds: Math.round(
      durationForSpeed(route.distance, MIN_SPEED_KMH),
    ),
  };
}

export async function calculateOsrmEstimates(
  vehicles: Array<{
    assignmentId: number;
    vehicleLat: number | null;
    vehicleLng: number | null;
  }>,
  userLocation: OsrmCoordinate,
  destination: OsrmCoordinate,
): Promise<Record<number, OsrmVehicleEstimate>> {
  const userToDestination = await getOsrmRoute([userLocation, destination]);
  const validVehicles = vehicles.filter(
    (vehicle) =>
      Number.isFinite(vehicle.vehicleLat) &&
      Number.isFinite(vehicle.vehicleLng),
  );

  const estimates = await Promise.all(
    validVehicles.map(async (vehicle) => {
      const vehicleLocation = {
        latitude: Number(vehicle.vehicleLat),
        longitude: Number(vehicle.vehicleLng),
      };
      const [vehicleToUser, total] = await Promise.all([
        getOsrmRoute([vehicleLocation, userLocation]),
        getOsrmRoute([vehicleLocation, userLocation, destination]),
      ]);

      return [
        vehicle.assignmentId,
        { total, vehicleToUser, userToDestination },
      ] as const;
    }),
  );

  return Object.fromEntries(estimates);
}
