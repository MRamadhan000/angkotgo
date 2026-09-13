import { Route } from "@/types/routes/route.type";
import { User } from "./user.type";
import { VehicleAssignment } from "./vehicles/vehicle-assignments.type";
import { DirectionType } from "./vehicles/vehicle.type";
export type SinyalStatus = "ACTIVE" | "COMPLETED";

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface SinyalDetail {
  id: string;
  idSinyal: string;
  vehicleAssignmentId: string;
  vehicleAssignment?: VehicleAssignment;
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