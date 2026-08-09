export interface SeatState {
  seatNumber: number; // 1 - 8
  isOccupied: boolean;
  passengerType?: "REGULAR" | "STUDENT" | "ELDERLY";
}

export interface OperationalStatus {
  assignmentId: string;
  hasConductor: boolean;
  conductorId?: string;
  conductorName?: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  currentPassengers: number;
  totalSeats: number;
  seats: SeatState[];
}

export interface ConductorRequest {
  requestId: string;
  conductorId: string;
  conductorName: string;
  driverId: string;
  vehiclePlate: string;
  timestamp: string;
}
