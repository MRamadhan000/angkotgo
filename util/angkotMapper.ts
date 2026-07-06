import { AngkotMatchData } from "@/services/routeService";

// Interface untuk hasil data yang sudah dibersihkan/diekstrak
export interface AngkotCleanData {
  sessionId: string;
  kodeInisial: string; // Akan berisi "AL", "AG", dll.
  namaRute: string;
  namaSupir: string;
  platNomor: string;
  nomorLambung: string;
  indexTurun: number;
}

/**
 * Mengambil kode inisial angkot (seperti AL, AG, dsb) dari kodeAngkot mentah.
 * Contoh: "AL_BERANGKAT" -> "AL"
 */
export function ekstrakKodeAngkot(kodeMentah: string): string {
  if (!kodeMentah) return "-";
  // Memecah string berdasarkan karakter underscore (_) dan mengambil bagian pertama
  return kodeMentah.split("_")[0].toUpperCase();
}

/**
 * Mengubah (Map) array data angkot mentah dari Backend menjadi format bersih
 * @param listAngkot Array dari response.data backend
 */
export function mapAngkotToCleanData(
  listAngkot: AngkotMatchData[],
): AngkotCleanData[] {
  if (!listAngkot || !Array.isArray(listAngkot)) return [];

  return listAngkot.map((angkot) => ({
    sessionId: angkot.sessionId,
    kodeInisial: ekstrakKodeAngkot(angkot.kodeAngkot),
    namaRute: angkot.namaRute,
    namaSupir: angkot.namaSupir,
    platNomor: angkot.platNomor,
    nomorLambung: angkot.nomorLambung,
    indexTurun: angkot.index_turun,
  }));
}
