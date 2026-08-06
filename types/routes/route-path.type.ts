import { DirectionType } from "@/types/vehicle.type";

export interface RoutePath {
  id: number;
  routeId: number;
  direction: DirectionType;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateRoutePathInput {
  routeId: number;
  direction: DirectionType;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
}

export type UpdateRoutePathInput = Partial<CreateRoutePathInput>;