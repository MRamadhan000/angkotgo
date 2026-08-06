import { DirectionType, VehicleType } from "./vehicle.type";

export interface EstimatedStopSchedule {
  stopId: number;
  stopName: string;
  stopOrder: number;

  latitude: number;
  longitude: number;

  estimatedArrivalTime: string;
}

export interface DriverSummary {
  id: number;
  name: string;
}

export interface VehicleSummary {
  id: number;
  vehicleCode: string;
  plateNumber: string;
  capacity: number;
  type: VehicleType;
}

export interface VehicleSchedule {
  assignmentId: number;

  date: string;

  driver: DriverSummary;

  routeCode: string;
  routeName: string;

  direction: DirectionType;

  startTime: string;
  endTime: string;

  vehicle: VehicleSummary;

  estimatedStopsSchedule: EstimatedStopSchedule[];
}