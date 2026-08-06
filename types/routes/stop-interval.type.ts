import { DirectionType } from "@/types/vehicles/vehicle.type";

export interface StopInterval {
  id: number;
  routeId: number;
  direction: DirectionType;
  fromStopId: number;
  toStopId: number;
  durationInSeconds: number;
  distanceInMeters: number;
  fromStop?: any;
  toStop?: any;
}

export interface CreateStopIntervalInput {
  routeId: number;
  direction: DirectionType;
  fromStopId: number;
  toStopId: number;
  durationInSeconds: number;
  distanceInMeters: number;
}

export interface UpdateStopIntervalInput extends Partial<CreateStopIntervalInput> {}