// src/services/vehicle/vehicle-location.api.ts

import {
  CreateVehicleLocationPayload,
  VehicleLocation,
  VehicleLocationResponse,
  VehicleLocationsResponse,
  VehicleAssignmentResponse,
  DeleteVehicleLocationResponse,
} from "@/types/vehicles/vehicle-location.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const BASE_URL = `${API_URL}/vehicle-locations`;

export const VehicleLocationService = {
  async create(
    payload: CreateVehicleLocationPayload,
  ): Promise<VehicleLocation> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Gagal merekam lokasi kendaraan.");
    }

    const result: VehicleLocationResponse = await response.json();

    return result.data;
  },

  async startSession(assignmentId: number) {
    const response = await fetch(`${BASE_URL}/start-session/${assignmentId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Gagal memulai sesi kendaraan.");
    }

    const result: VehicleAssignmentResponse = await response.json();

    return result.data;
  },

  async findAll(vehicleAssignmentId?: number): Promise<VehicleLocation[]> {
    const params = new URLSearchParams();

    if (vehicleAssignmentId !== undefined) {
      params.set("vehicleAssignmentId", String(vehicleAssignmentId));
    }

    const url =
      params.toString().length > 0
        ? `${BASE_URL}?${params.toString()}`
        : BASE_URL;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal mengambil daftar lokasi kendaraan.");
    }

    const result: VehicleLocationsResponse = await response.json();

    return result.data;
  },

  async findLatestByAssignmentId(
    assignmentId: number,
  ): Promise<VehicleLocation> {
    const response = await fetch(`${BASE_URL}/latest/${assignmentId}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil lokasi terbaru kendaraan.");
    }

    const result: VehicleLocationResponse = await response.json();

    return result.data;
  },

  async findById(id: number): Promise<VehicleLocation> {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil detail lokasi kendaraan.");
    }

    const result: VehicleLocationResponse = await response.json();

    return result.data;
  },

  async update(
    id: number,
    payload: Partial<CreateVehicleLocationPayload>,
  ): Promise<VehicleLocation> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Gagal memperbarui lokasi kendaraan.");
    }

    const result: VehicleLocationResponse = await response.json();

    return result.data;
  },

  async remove(id: number): Promise<DeleteVehicleLocationResponse> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus lokasi kendaraan.");
    }

    return response.json();
  },
};
