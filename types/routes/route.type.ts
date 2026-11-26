export interface Route {
  id: number;
  routeCode: string;
  code?: string;
  routeName: string;
  name?: string;
  encodedPolyline?: string;
  direction?: string;
  color?: string;
  totalDistanceMeters?: number;
  isActive?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CreateRouteInput = {
  routeCode: string;
  routeName: string;
};

export type UpdateRouteInput = Partial<CreateRouteInput>;