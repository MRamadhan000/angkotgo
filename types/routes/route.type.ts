export interface Route {
  id: number;
  routeCode: string;
  routeName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CreateRouteInput = {
  routeCode: string;
  routeName: string;
};

export type UpdateRouteInput = Partial<CreateRouteInput>;