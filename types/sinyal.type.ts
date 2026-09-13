import { User } from "./user.type";
import { VehicleAssignment } from "./vehicles/vehicle-assignments.type";

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
  targetLat: number | null;
  targetLng: number | null;
  sourceName: string | null;
  destName: string | null;
  vehicleAssignmentId?: string[];
}

export interface UpdateSinyalPayload {
  status: SinyalStatus;
}
