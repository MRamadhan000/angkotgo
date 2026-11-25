import { TripHistoryItem } from "@/types/vehicles/trip-history.type";
import {
  VehicleAssignment,
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
  PersonnelAssignmentRole,
  UpcomingVehicleAssignment,
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

    const result = (await response.json()) as unknown;
    const assignment =
      typeof result === "object" &&
      result !== null &&
      "data" in result &&
      result.data
        ? result.data
        : result;
    const normalizedAssignment = (assignment ?? {}) as Partial<VehicleAssignment> & {
      assignmentId?: number;
    };

    return {
      ...normalizedAssignment,
      id: normalizedAssignment.id ?? normalizedAssignment.assignmentId ?? id,
    } as VehicleAssignment;
  },

  async getByDate(date: string): Promise<VehicleAssignment[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/date/${date}`,
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
          `Gagal mengambil data penugasan untuk tanggal ${date}.`,
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getUpcomingAssignments(
    userId: string | number,
    role: PersonnelAssignmentRole,
  ): Promise<UpcomingVehicleAssignment[]> {
    const queryParams = new URLSearchParams({
      userId: String(userId),
      role,
    });
    const response = await fetch(
      `${API_URL}/vehicle-assignments/upcoming?${queryParams.toString()}`,
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
        errorData.message || "Gagal mengambil daftar penugasan mendatang.",
      );
    }

    const result: unknown = await response.json();
    const assignments =
      typeof result === "object" &&
      result !== null &&
      "data" in result
        ? result.data
        : result;

    if (!Array.isArray(assignments)) {
      throw new Error("Format respons jadwal mendatang tidak valid.");
    }

    return assignments.map((item) => {
      const assignment = item as UpcomingVehicleAssignment;
      return {
        id: assignment.id,
        assignmentDate: assignment.assignmentDate,
        startTime: assignment.startTime,
        status: assignment.status,
        direction: assignment.direction ?? assignment.route?.direction,
        route: assignment.route
          ? {
              code: assignment.route.code,
              name: assignment.route.name,
              direction: assignment.route.direction,
            }
          : undefined,
        vehicle: assignment.vehicle
          ? {
              plateNumber: assignment.vehicle.plateNumber,
              vehicleCode: assignment.vehicle.vehicleCode,
            }
          : undefined,
      };
    });
  },

  async getSchedulesByDate(date: string): Promise<VehicleSchedule[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/date/${date}`,
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
      `${API_URL}/vehicle-assignments/history?id=${driverId}&type=driver`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil riwayat driver.");
    }

    const result = await response.json();
    const items = Array.isArray(result) ? result : result.data ?? [];

    return items.map(
      (item: TripHistoryItem & { total_amount?: number | string }) => ({
        ...item,
        totalAmount: Number(item.totalAmount ?? item.total_amount ?? 0),
      }),
    );
  },

  async getConductorTripHistory(
    conductorId: number | string,
  ): Promise<TripHistoryItem[]> {
    const response = await fetch(
      `${API_URL}/vehicle-assignments/history?id=${conductorId}&type=conductor`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  async getActiveScheduleByPersonnel(params: {
    targetDate?: string;
    driverId?: number;
    conductorId?: number;
  }): Promise<TripHistoryItem[]> {
    const queryParams = new URLSearchParams();
    if (params.targetDate) {
      queryParams.append("date", params.targetDate);
    }
    if (params.driverId) {
      queryParams.append("driverId", params.driverId.toString());
    }
    if (params.conductorId) {
      queryParams.append("conductorId", params.conductorId.toString());
    }

    const response = await fetch(
      `${API_URL}/vehicle-assignments/active-schedule-by-personnel?${queryParams.toString()}`,
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
        errorData.message || "Gagal mengambil jadwal aktif personel.",
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getScheduleByPersonnelId(params: {
    driverId?: number;
    conductorId?: number;
  }): Promise<TripHistoryItem[]> {
    const queryParams = new URLSearchParams();
    if (params.driverId)
      queryParams.append("driverId", params.driverId.toString());
    if (params.conductorId)
      queryParams.append("conductorId", params.conductorId.toString());

    const response = await fetch(
      `${API_URL}/vehicle-assignments/personnel-schedule?${queryParams.toString()}`,
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
          "Gagal mengambil riwayat jadwal penugasan personel.",
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
