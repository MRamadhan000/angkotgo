export enum DirectionType {
  FORWARD = 'FORWARD',
  RETURN = 'RETURN'
}

export interface Route {
  id: number;
  routeCode: string;
  routeName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CreateRouteInput = {
  code: string;
  name: string;
  direction?: DirectionType | string;
  color?: string;
  encodedPolyline: string;
  totalDistanceMeters?: number;
  isActive?: boolean;
};

export type UpdateRouteInput = Partial<CreateRouteInput>;