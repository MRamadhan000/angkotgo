import { Coordinates } from "@/types/mapbox.type";

interface RouteSearchValidationParams {
  origin: string;
  destination: string;
  originCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
}

interface RouteSearchValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateRouteSearch({
  origin,
  destination,
  originCoords,
  destinationCoords,
}: RouteSearchValidationParams): RouteSearchValidationResult {
  if (!origin.trim()) {
    return {
      isValid: false,
      message: "Lokasi penjemputan belum diisi.",
    };
  }

  if (!destination.trim()) {
    return {
      isValid: false,
      message: "Lokasi tujuan belum diisi.",
    };
  }

  if (!originCoords) {
    return {
      isValid: false,
      message: "Pilih lokasi penjemputan dari suggestion atau peta.",
    };
  }

  if (!destinationCoords) {
    return {
      isValid: false,
      message: "Pilih lokasi tujuan dari suggestion atau peta.",
    };
  }

  return {
    isValid: true,
  };
}