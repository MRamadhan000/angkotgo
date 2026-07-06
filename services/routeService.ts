// services/routeService.ts

// 1. Parameter Input untuk Query String
export interface CariRuteParams {
  lngA: number;
  latA: number;
  lngB: number;
  latB: number;
}

// 2. Interface untuk setiap item Angkot di dalam array "data"
export interface AngkotMatchData {
  sessionId: string;
  routeId: number;
  kodeAngkot: string;
  namaRute: string;
  arahSesi: "BERANGKAT" | "KEMBALI" | string; // Mengunci nilai arah atau string dinamis
  namaSupir: string;
  platNomor: string;
  nomorLambung: string;
  index_turun: number;
}

// 3. Interface Utama untuk struktur Respons API Backend
export interface CariRuteResponse {
  success: boolean;
  found: boolean;
  totalAvailable: number;
  data: AngkotMatchData[];
}

// types/angkot.ts

export interface AngkotLocationUpdatePayload {
  /** ID unik untuk sesi aktif angkot saat ini */
  sessionId: string;
  
  /** ID unik untuk armada/kendaraan angkot */
  vehicleId: string;
  
  /** Inisial kode trayek angkot (e.g., "AL", "AG") */
  kodeAngkot: string;
  
  /** Arah perjalanan sesi ini */
  arah: "BERANGKAT" | "PULANG" | string;
  
  /** Koordinat Latitude */
  lat: number;
  
  /** Koordinat Longitude */
  lng: number;
  
  /** Timestamp ISO string waktu update terakhir dari backend */
  updatedAt: string;
  
  /** Jenis aksi event websocket */
  action: "location_update" | "vehicle_offline" | "stop_tracking" | string;
}


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Mencari rute angkot yang cocok berdasarkan koordinat titik A (asal) dan titik B (tujuan).
 * @param params Koordinat lngA, latA, lngB, latB
 * @returns Promise berisi data terstruktur CariRuteResponse
 */
export async function cariRuteAngkot(
  params: CariRuteParams,
): Promise<CariRuteResponse> {
  try {
    // Mengonversi params menjadi query string format (?lngA=...&latA=...)
    const queryString = new URLSearchParams({
      lngA: params.lngA.toString(),
      latA: params.latA.toString(),
      lngB: params.lngB.toString(),
      latB: params.latB.toString(),
    }).toString();

    const response = await fetch(`${BASE_URL}/routing/cari?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Diperlukan agar data pencarian real-time tidak terkena stale cache
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal mengambil rute: ${response.status}`,
      );
    }

    // Melakukan casting tipe data kembalian ke format CariRuteResponse
    const result: CariRuteResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Error pada cariRuteAngkot:", error);
    throw error;
  }
}
