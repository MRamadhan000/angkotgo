import {
  OperationalStatus,
  SeatState,
} from "@/types/vehicles/seat-management.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getResponseData<T>(response: T | { data?: T }): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data !== undefined
  ) {
    return response.data as T;
  }

  return response as T;
}

export const seatManagementService = {
  async getOperationalStatus(assignmentId: string): Promise<OperationalStatus> {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
    }

    const response = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Gagal mengambil detail penugasan. Status: ${response.status}`,
      );
    }

    const responseJson = await response.json();
    const assignment = getResponseData<any>(responseJson);

    const vehicleCapacity = Number(assignment.vehicle?.capacity ?? 0);
    const currentPassengers = Number(assignment.currentPassengers ?? 0);

    if (vehicleCapacity <= 0) {
      throw new Error("Kapasitas kendaraan tidak tersedia.");
    }

    const safePassengers = Math.min(
      Math.max(currentPassengers, 0),
      vehicleCapacity,
    );

    const seats: SeatState[] = Array.from(
      { length: vehicleCapacity },
      (_, index) => ({
        seatNumber: index + 1,
        isOccupied: index + 1 <= safePassengers,
      }),
    );

    return {
      assignmentId,
      hasConductor: Boolean(assignment.conductor?.id),
      status: assignment.status,
      currentPassengers: safePassengers,
      totalSeats: vehicleCapacity,
      seats,
    };
  },

  async updateSeat(
    assignmentId: string,
    seatNumber: number,
    passengerCount: number,
  ): Promise<{ success: boolean; currentPassengers: number }> {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
    }

    const response = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassengers: passengerCount,
        }),
      },
    );

    const responseJson = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        responseJson?.message ||
          `Gagal memperbarui status kursi. Status: ${response.status}`,
      );
    }

    const result = responseJson?.data ?? responseJson;

    return {
      success: result?.success ?? true,
      currentPassengers: Number(result?.currentPassengers ?? passengerCount),
    };
  },

  async updateJourneyStatus(
    assignmentId: string,
    status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED",
  ): Promise<{ success: boolean; status: string }> {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
    }

    const response = await fetch(
      `${API_BASE_URL}/vehicle-assignments/${assignmentId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      throw new Error("Gagal memperbarui status perjalanan.");
    }

    const responseJson = await response.json();
    return getResponseData(responseJson);
  },

  async requestConductorConnection(
    driverId: string,
    conductorId: string,
  ): Promise<boolean> {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
    }

    const response = await fetch(`${API_BASE_URL}/conductor-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
        conductorId,
      }),
    });

    return response.ok;
  },
};
