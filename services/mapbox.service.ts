import type {
  Coordinates,
  MapboxRetrieveResponse,
  MapboxReverseGeocodeResponse,
  MapboxSuggestResponse,
} from "@/types/mapbox.type";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SUGGEST = "https://api.mapbox.com/search/searchbox/v1/suggest";

const RETRIEVE = "https://api.mapbox.com/search/searchbox/v1/retrieve";

const REVERSE_GEOCODE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const BBOX = "112.45,-8.35,112.85,-7.75";

const PROXIMITY = "112.6214,-7.9839";

function getToken() {
  if (!TOKEN) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.");
  }

  return TOKEN;
}

export async function suggestPlaces(
  query: string,
  sessionToken: string,
  proximity?: string,
): Promise<MapboxSuggestResponse> {
  const token = getToken();

  const params = new URLSearchParams({
    q: query,
    access_token: token,
    session_token: sessionToken,
    language: "id",
    country: "ID",
    limit: "8",
    proximity: proximity ?? PROXIMITY,
    bbox: BBOX,
    types: "poi,address,street,place",
  });

  const response = await fetch(`${SUGGEST}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Suggest error: ${response.status}`);
  }

  return response.json();
}

export async function retrievePlace(
  mapboxId: string,
  sessionToken: string,
): Promise<{
  coords: Coordinates;
  placeName: string;
  address: string;
}> {
  const token = getToken();

  const params = new URLSearchParams({
    access_token: token,
    session_token: sessionToken,
    language: "id",
  });

  const response = await fetch(
    `${RETRIEVE}/${encodeURIComponent(mapboxId)}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Retrieve error: ${response.status}`);
  }

  const data: MapboxRetrieveResponse = await response.json();

  const feature = data.features?.[0];

  if (!feature) {
    throw new Error("Lokasi tidak ditemukan.");
  }

  const coordinates = feature.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    throw new Error("Koordinat tidak ditemukan.");
  }

  const [lng, lat] = coordinates;

  const properties = feature.properties ?? {};

  const placeName = properties.name_preferred ?? properties.name ?? "Lokasi";

  const address = properties.full_address ?? properties.place_formatted ?? "";

  return {
    coords: {
      lat: Number(lat),
      lng: Number(lng),
    },
    placeName,
    address,
  };
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const token = getToken();

  const response = await fetch(
    `${REVERSE_GEOCODE}/${lng},${lat}.json?access_token=${token}&country=id&language=id&limit=1`,
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding error: ${response.status}`);
  }

  const data: MapboxReverseGeocodeResponse = await response.json();

  return (
    data.features?.[0]?.place_name ??
    `Lokasi (${lat.toFixed(5)}, ${lng.toFixed(5)})`
  );
}
