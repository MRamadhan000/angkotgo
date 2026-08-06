import { Route } from "@/types/routes/route.type";
import { DirectionType, Vehicle } from "./vehicle.type";
import { Driver } from "../driver.type";
import { Conductor } from "../conductor.type";

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface VehicleAssignment {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  driverId: number;
  driver?: Driver;
  routeId: number;
  route?: Route;
  direction: DirectionType;
  currentPassengers: number;
  assignmentDate: string; 
  startTime: string; 
  endTime: string; 
  status: AssignmentStatus;
  conductorId?: number;
  conductor?: Conductor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleAssignmentInput {
  vehicleId: number;
  driverId: number;
  conductorId?: number;
  routeId: number;
  direction?: DirectionType;
  assignmentDate: string;
  startTime: string;
  currentPassengers?: number;
  endTime: string;
  status?: AssignmentStatus;
}

export interface UpdateVehicleAssignmentInput extends Partial<CreateVehicleAssignmentInput> {}
