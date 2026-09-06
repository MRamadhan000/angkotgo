import type { DirectionType } from "@/types/vehicles/vehicle.type";
import type { OsrmVehicleEstimate } from "@/utils/osrm-estimates";

export interface WalkingInfo {
  distance: number;
  duration: number;
}

export interface SearchRoutesParams {
  userLat: number;
  userLng: number;
  destLat: number;
  destLng: number;
}

export interface RouteSearchResult {
  routeId: number;
  routeCode: string;
  routeName: string;
  direction: "FORWARD" | "BACKWARD";
  sequenceTitikAwal: number;
  sequenceTitikTujuan: number;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  beelineTotal: number;
  walkingToRoute: WalkingInfo;
  walkingToDestination: WalkingInfo;
  totalWalkingDistance: number;
  totalWalkingDuration: number;
}

export type RouteSearchResponse = RouteSearchResult[];

export interface UpcomingVehicle {
  assignmentId: number;
  vehicleId: number;
  driverId: number;
  conductorId: number;
  status: "ONGOING" | "COMPLETED" | "CANCELLED";
  hasLocationData: boolean;
  lastLocationAt: string | null;
  lastLocationAgeSeconds: number | null;
  vehicleLat: number | null;
  vehicleLng: number | null;
  hasPassedUser: boolean;
  distanceToUserMeters: number;
  vehicleFraction: number;
  driverName?: string | null;
  vehicleCode?: string | null;
  vehicleCapacity?: number | null;
  currentPassengers?: number | null;
  driver?: { name?: string | null } | null;
  vehicle?: {
    vehicleCode?: string | null;
    capacity?: number | null;
  } | null;
  osrmEstimate?: OsrmVehicleEstimate | null;
}

export interface UpcomingVehiclesParams {
  routeId: number;
  direction: DirectionType;
  latitude: number;
  longitude: number;
}

export interface UpcomingVehiclesResponse {
  routeLengthMeters: number;
  userFraction: number;
  userOffsetFromRouteMeters: number;
  vehicles: UpcomingVehicle[];
}