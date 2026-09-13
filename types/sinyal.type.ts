import { Route } from "@/types/routes/route.type";
import { User } from "./user.type";
import { DirectionType } from "./vehicles/vehicle.type";
export type SinyalStatus = "ACTIVE" | "COMPLETED";

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface SinyalVehicleAssignment {
  id: number;
  vehicleId: number;
  driverId: number;
  conductorId: number;
  status: string;
  driver?: { id?: number; name?: string | null; [key: string]: unknown } | null;
  vehicle?: {
    vehicleCode?: string | null;
    capacity?: number | null;
    [key: string]: unknown;
  } | null;
  currentPassengers?: number | null;
  [key: string]: unknown;
}

export interface SinyalDetail {
  id: string;
  idSinyal: string;
  vehicleAssignmentId: number;
  vehicleAssignment: SinyalVehicleAssignment;
  createdAt: string;
}

export interface Sinyal {
  id: string;

  latitude: number;
  longitude: number;

  userId: number;
  user?: User;

  geom: GeoJSONPoint | null;
  targetLat: number | null;
  targetLng: number | null;
  sourceName: string | null;
  destName: string | null;

  routeId: number | null;
  route?: Route;
  direction: DirectionType | null;

  status: SinyalStatus;

  vehicleAssignmentId: string | null;

  details: SinyalDetail[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateSinyalPayload {
  userId: number;
  latitude: number;
  longitude: number;
  targetLat?: number | null;
  targetLng?: number | null;
  sourceName?: string | null;
  destName?: string | null;
  routeId?: number | null;
  direction?: DirectionType | null;
  vehicleAssignmentId?: string[];
}

export interface UpdateSinyalPayload {
  status: SinyalStatus;
}