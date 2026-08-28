export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapboxSuggestion {
  mapbox_id: string;
  name: string;
  name_preferred?: string;
  place_formatted?: string;
  full_address?: string;
}

export interface MapboxSuggestResponse {
  suggestions: MapboxSuggestion[];
}

export interface MapboxRetrieveFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    name_preferred?: string;
    full_address?: string;
    place_formatted?: string;
  };
}

export interface MapboxRetrieveResponse {
  features?: MapboxRetrieveFeature[];
}

export interface MapboxReverseGeocodeFeature {
  place_name?: string;
}

export interface MapboxReverseGeocodeResponse {
  features?: MapboxReverseGeocodeFeature[];
}

export type PointType = "origin" | "destination";

export type MapboxSearchLoadingState =
  | "origin"
  | "destination"
  | "retrieve-origin"
  | "retrieve-destination"
  | null;

export type ActiveInputState = "origin" | "destination" | null;
