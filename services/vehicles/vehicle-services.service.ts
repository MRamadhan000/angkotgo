import {
  VehicleService,
  CreateVehicleServiceInput,
  UpdateVehicleServiceInput,
} from "@/types/vehicles/vehicle-service.type";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/vehicle-services`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Terjadi kesalahan pada server.");
  }

  return response.json();
}

export const vehicleServiceService = {
  async getAll(): Promise<VehicleService[]> {
    const response = await fetch(BASE_URL);
    const result = await handleResponse<{ data: VehicleService[] }>(response);

    return result.data;
  },

  async getByVehicleId(vehicleId: number): Promise<VehicleService[]> {
    const response = await fetch(`${BASE_URL}/vehicle/${vehicleId}`);

    const result = await handleResponse<{ data: VehicleService[] }>(response);

    return result.data;
  },

  async getById(id: number): Promise<VehicleService> {
    const response = await fetch(`${BASE_URL}/${id}`);
    const result = await handleResponse<{ data: VehicleService }>(response);

    return result.data;
  },

  async create(data: CreateVehicleServiceInput): Promise<VehicleService> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ data: VehicleService }>(response);

    return result.data;
  },

  async update(
    id: number,
    data: UpdateVehicleServiceInput,
  ): Promise<VehicleService> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ data: VehicleService }>(response);

    return result.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    return handleResponse<{ message: string }>(response);
  },
};
