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

export type PersonnelAssignmentRole = "DRIVER" | "CONDUCTOR";

export interface UpcomingVehicleAssignment {
  id: number;
  assignmentDate: string;
  startTime: string;
  status: AssignmentStatus;
  direction?: DirectionType;
  route?: Pick<Route, "code" | "name" | "direction">;
  vehicle?: Pick<Vehicle, "plateNumber" | "vehicleCode">;
}

export interface VehicleAssignment {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  driverId: number;
  driver?: Driver;
  routeId: number;
  route?: Route;
  currentPassengers: number;
  assignmentDate: string; 
  startTime: string; 
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
  assignmentDate: string;
  startTime: string;
  currentPassengers?: number;
  status?: AssignmentStatus;
}

export interface UpdateVehicleAssignmentInput extends Partial<CreateVehicleAssignmentInput> {}
