import {
  OperationalStatus,
  SeatState,
} from "@/types/vehicles/seat-management.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const seatManagementService = {
  // Fetch status operasional & kursi saat ini
  async getOperationalStatus(assignmentId: string): Promise<OperationalStatus> {
    if (!API_BASE_URL) {
      // Fallback Local Mock State
      return {
        assignmentId,
        hasConductor: false,
        status: "ONGOING",
        currentPassengers: 3,
        totalSeats: 8,
        seats: Array.from({ length: 8 }, (_, i) => ({
          seatNumber: i + 1,
          isOccupied: i < 3,
        })),
      };
    }

    const res = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) throw new Error("Gagal mengambil status kursi");

    const result = await res.json();
    const assignment = result.data || result;

    const totalSeats = assignment.vehicle?.capacity || 8;
    const currentPassengers = assignment.currentPassengers || 0;

    return {
      assignmentId: String(assignment.id || assignmentId),
      hasConductor: !!(assignment.conductorId || assignment.conductor_id || assignment.conductor),
      status: assignment.status,
      currentPassengers: currentPassengers,
      totalSeats: totalSeats,
      seats: Array.from({ length: totalSeats }, (_, i) => ({
        seatNumber: i + 1,
        isOccupied: i < currentPassengers,
      })),
    };
  },

  // Toggle status kursi
  async updateSeat(
    assignmentId: string,
    seatNumber: number,
    passengerCount: number,
  ): Promise<{ success: boolean; currentPassengers: number }> {
    if (!API_BASE_URL) {
      return { success: true, currentPassengers: passengerCount };
    }

    const res = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassengers: passengerCount }),
      },
    );
    if (!res.ok) throw new Error("Gagal memperbarui kursi");
    return { success: true, currentPassengers: passengerCount };
  },

  async updateJourneyStatus(
    assignmentId: string,
    status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED",
  ): Promise<{ success: boolean; status: string }> {
    if (!API_BASE_URL) {
      return { success: true, status };
    }

    const res = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (!res.ok) throw new Error("Gagal memperbarui status perjalanan");
    return { success: true, status };
  },

  // Sambungkan Kondektur ke Driver
  async requestConductorConnection(
    driverId: string,
    conductorId: string,
  ): Promise<boolean> {
    if (!API_BASE_URL) return true;

    const res = await fetch(`${API_BASE_URL}/conductor-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, conductorId }),
    });
    return res.ok;
  },
};
