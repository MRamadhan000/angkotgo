import { Conductor } from "../conductor.type";
import { Driver } from "../driver.type";
import { AssignmentStatus, DirectionType, Vehicle } from "./vehicle.type";

export interface TripHistoryItem {
  routeId: any;
  assignmentId: number;
  date: string | Date;
  status: AssignmentStatus;
  conductor?: Conductor;
  driver?: Driver;
  routeCode?: string;
  routeName?: string;
  direction: DirectionType;
  startTime: string;
  endTime: string;
  vehicle?: Vehicle;
}
