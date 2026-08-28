import type {
  RouteSearchResponse,
  SearchRoutesParams,
  UpcomingVehiclesParams,
  UpcomingVehiclesResponse,
} from "@/types/route-search.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function searchRoutes(
  params: SearchRoutesParams,
): Promise<RouteSearchResponse> {
  const queryParams = new URLSearchParams({
    userLat: String(params.userLat),
    userLng: String(params.userLng),
    destLat: String(params.destLat),
    destLng: String(params.destLng),
  });

  const response = await fetch(
    `${API_URL}/routes/search?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Gagal mencari rute");
  }

  return response.json();
}

export async function getUpcomingVehicles(
  params: UpcomingVehiclesParams,
): Promise<UpcomingVehiclesResponse> {
  const queryParams = new URLSearchParams({
    routeId: String(params.routeId),
    direction: params.direction,
    latitude: String(params.latitude),
    longitude: String(params.longitude),
  });

  const response = await fetch(
    `${API_URL}/routes/upcoming-vehicles?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil kendaraan yang akan datang");
  }

  return response.json();
}
