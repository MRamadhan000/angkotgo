"use client";

import React from "react";
import { SeatGridControl } from "@/components/now/SeatGridControl";
import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";

interface DriverSeatControlProps {
  assignmentDetail: VehicleAssignment;
  onUpdate: (currentPassengers: number) => Promise<unknown>;
  isUpdating: boolean;
}

export function DriverSeatControl({
  assignmentDetail,
  onUpdate,
  isUpdating,
}: DriverSeatControlProps) {
  const currentPassengers = assignmentDetail?.currentPassengers || 0;
  const capacity = assignmentDetail?.vehicle?.capacity || 8;

  const seats = Array.from({ length: capacity }, (_, i) => ({
    seatNumber: i + 1,
    isOccupied: i < currentPassengers,
  }));

  return (
    <div>
      <SeatGridControl
        seats={seats}
        canControl={!isUpdating}
        onToggleSeat={(seatNumber) =>
          onUpdate(
            seats[seatNumber - 1].isOccupied ? seatNumber - 1 : seatNumber,
          )
        }
        hasConductor={false}
        isUserConductor={false}
      />
    </div>
  );
}
