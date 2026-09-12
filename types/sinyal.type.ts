import { User } from "./user.type";

export type SinyalStatus = "ACTIVE" | "COMPLETED";

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Sinyal {
  id: string;

  latitude: number;
  longitude: number;

  userId: number;
  user?: User;

  geom: GeoJSONPoint | null;

  status: SinyalStatus;

  vehicleAssignmentId: string | null;

  details: SinyalDetail[];

  createdAt: string;
  updatedAt: string;
}

export interface SinyalDetail {
  id: string;

  idSinyal: string;

  vehicleAssignmentId: string;

  createdAt: string;
}

export interface CreateSinyalPayload {
  userId: number;
  latitude: number;
  longitude: number;
  vehicleAssignmentId?: string[];
}

export interface UpdateSinyalPayload {
  status: SinyalStatus;
}
