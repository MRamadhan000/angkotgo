import { DirectionType } from "../vehicles/vehicle.type";
import { Route } from "./route.type";

export interface RouteStopType {
    id: number;
    routeId: number;
    direction: DirectionType;
    stopName: string;
    latitude: number;
    longitude: number;
    stopOrder: number;
    route?: Route;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface CreateRouteStopInput {
    routeId: number;
    direction: DirectionType;
    stopName: string;
    latitude: number;
    longitude: number;
    stopOrder: number;
}

export interface UpdateRouteStopInput extends Partial<CreateRouteStopInput> {}