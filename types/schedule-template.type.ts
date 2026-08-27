import {
  AssignmentStatus,
  DirectionType,
  VehicleType,
  Vehicle,
} from "./vehicles/vehicle.type";
import { Route } from "./routes/route.type";
import { Driver } from "./driver.type";
import { Conductor } from "./conductor.type";

/**
 * Mock Live Location
 */
export interface MockLiveLocation {
  id: number;
  name: string;
}

/**
 * Schedule Template
 */
export interface ScheduleTemplate {
  id: number;

  routeId: number;
  route: Route | null;

  vehicleId?: number;
  vehicle: Vehicle | null;

  driverId?: number;
  driver: Driver | null;

  conductorId?: number;
  conductor: Conductor | null;

  startTime: string;
  endTime: string;

  direction: DirectionType;
  activeDays: number[];

  isActive: boolean;
  status: AssignmentStatus;

  mockLiveLocationId?: number;
  mockLiveLocation: MockLiveLocation | null;
}

/**
 * Payload untuk CREATE
 */
export interface CreateScheduleTemplateInput {
  routeId: number;

  vehicleId?: number;
  driverId?: number;
  conductorId?: number;

  mockLiveLocationId?: number;

  startTime: string;
  endTime: string;

  direction?: DirectionType;
  activeDays?: number[];

  isActive?: boolean;
  status?: AssignmentStatus;
}

/**
 * Payload untuk UPDATE
 */
export interface UpdateScheduleTemplateInput {
  routeId?: number;

  vehicleId?: number;
  driverId?: number;
  conductorId?: number;

  mockLiveLocationId?: number;

  startTime?: string;
  endTime?: string;

  direction?: DirectionType;
  activeDays?: number[];

  isActive?: boolean;
  status?: AssignmentStatus;
}
