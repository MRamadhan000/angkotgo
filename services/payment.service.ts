import {
  ApiResponse,
  VehicleAssignmentFinancialResponse,
} from "@/types/payment.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Mengambil data keuangan dan seluruh daftar transaksi berdasarkan ID Penugasan Kendaraan (Vehicle Assignment ID)
 * @param vehicleAssignmentId ID dari penugasan kendaraan
 */
export async function getFinancialByVehicleAssignment(
  vehicleAssignmentId: number,
): Promise<VehicleAssignmentFinancialResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/payments/financial/vehicle-assignment/${vehicleAssignmentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Tambahkan Authorization header di sini jika menggunakan token bearer (JWT)
          // "Authorization": `Bearer ${token}`,
        },
        // Atur cache sesuai kebutuhan Next.js (misal: 'no-store' untuk data real-time kas driver)
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil data keuangan: ${response.statusText}`);
    }

    const result: ApiResponse<VehicleAssignmentFinancialResponse> =
      await response.json();
    return result.data;
  } catch (error) {
    console.error("Error getFinancialByVehicleAssignment:", error);
    throw error;
  }
}
export type { VehicleAssignmentFinancialResponse };
