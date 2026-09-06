// src/types/vehicle-location.type.ts

export enum StopStatus {
  HEADING_TO = "HEADING_TO",
  ARRIVED = "ARRIVED",
  DEPARTED = "DEPARTED",
}

export interface CreateVehicleLocationPayload {
  vehicleAssignmentId: number;
  latitude: number;
  longitude: number;
  currentStopId?: number;
  stopStatus?: StopStatus;
}

export interface VehicleLocation {
  id: number;
  vehicleAssignmentId: number;
  latitude: number;
  longitude: number;
  currentStopId?: number;
  stopStatus: StopStatus;
  geom: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  createdAt: string;
}

export interface VehicleLocationResponse {
  message: string;
  data: VehicleLocation;
}

export interface VehicleLocationsResponse {
  message: string;
  data: VehicleLocation[];
}

export interface VehicleAssignmentResponse {
  message: string;
  data: unknown;
}

export interface DeleteVehicleLocationResponse {
  message: string;
}