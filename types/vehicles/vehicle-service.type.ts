import { ServiceType } from "./vehicle.type";

export interface VehicleService {
  id: number;
  vehicleId: number;

  serviceType: ServiceType;

  description: string;
  cost: number;

  odometerAtService: number;
  serviceDate: string;

  nextServiceDate?: string | null;
  nextServiceOdometer?: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleServiceInput {
  vehicleId: number;

  serviceType?: ServiceType;

  description: string;
  cost?: number;

  odometerAtService: number;
  serviceDate: string;

  nextServiceDate?: string;
  nextServiceOdometer?: number;
}

export interface UpdateVehicleServiceInput {
  serviceType?: ServiceType;

  description?: string;
  cost?: number;

  odometerAtService?: number;
  serviceDate?: string;

  nextServiceDate?: string | null;
  nextServiceOdometer?: number | null;
}