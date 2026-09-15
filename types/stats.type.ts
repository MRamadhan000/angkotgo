export interface Tariff {
  id: number;
  name: string;
  nominal: number;
}

export interface MostPopularRoute {
  id: number;
  routeCode: string;
  routeName: string;
  totalUsage: number;
}

export interface TodayAssignmentsByStatus {
  SCHEDULED: number;
  ONGOING: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface TopPassengerAssignment {
  vehicleAssignmentId: number;
  routeCode: string;
  routeName: string;
  totalPassengers: number;
}

export interface StatsData {
  totalDrivers: number;
  activeDrivers: number;
  inactiveDrivers: number;
  activeVehicles: number;
  inactiveVehicles: number;
  totalRoutes: number;
  totalRouteStops: number;
  totalTodayAssignments: number;
  todayAssignmentsByStatus: TodayAssignmentsByStatus;
  topPassengersByAssignment: TopPassengerAssignment[];
  mostPopularRoute: MostPopularRoute | null;
  tariffs: Tariff[];
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: StatsData;
}
