export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AssignmentStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DirectionType {
  FORWARD = 'FORWARD',
  RETURN = 'RETURN',
}

export enum ServiceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
}

export interface VehicleAssignment {
  id: number;
  [key: string]: any;
}

export interface VehicleService {
  id: number;
  [key: string]: any;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  currentOdometer: number;
  status: VehicleStatus;
  assignments?: VehicleAssignment[];
  services?: VehicleService[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CreateVehicleInput = {
  plateNumber: string;
  vehicleCode: string;
  capacity?: number;
  currentOdometer?: number;
  status?: VehicleStatus;
  assignments?: any[];
  services?: any[];
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;