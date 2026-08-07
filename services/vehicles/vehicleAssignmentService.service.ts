import { TripHistoryItem } from "@/types/vehicles/trip-history.type";
import {
  VehicleAssignment,
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
} from "@/types/vehicles/vehicle-assignments.type";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const vehicleAssignmentService = {
  async getAll(): Promise<VehicleAssignment[]> {
    const response = await fetch(`${API_URL}/vehicle-assignments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal mengambil data penugasan kendaraan.",
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getById(id: number): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal mengambil data penugasan dengan ID ${id}.`,
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  async getSchedulesByDate(date: string): Promise<VehicleSchedule[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/schedules?date=${date}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal mengambil data jadwal estimasi halte.",
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getDriverTripHistory(
    driverId: number | string,
  ): Promise<TripHistoryItem[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/driver/${driverId}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Gagal mengambil riwayat trip untuk driver ID ${driverId}.`,
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getConductorTripHistory(
    conductorId: number | string,
  ): Promise<TripHistoryItem[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/conductor/${conductorId}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Gagal mengambil riwayat trip untuk kondektur ID ${conductorId}.`,
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async create(data: CreateVehicleAssignmentInput): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal membuat penugasan kendaraan baru.",
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  async update(
    id: number,
    data: UpdateVehicleAssignmentInput,
  ): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal memperbarui penugasan dengan ID ${id}.`,
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal menghapus penugasan dengan ID ${id}.`,
      );
    }
  },
};
