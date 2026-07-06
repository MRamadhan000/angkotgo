// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  fare: number;
  estimatedTrip: number;
  transit: number;
  destination: string;
  activeVehicles: number;
  recommended?: boolean;
}

export interface Vehicle {
  id: string;
  routeId: string;
  plateNumber: string;
  driver: string;
  speed: number;
  status: string;
  etaPickup: number;
  etaDestination: number;
  distanceToPassenger: number;
  distanceRemaining: number;
}

export interface TrackingData {
  passenger: Location;
  destination: Location;
  vehicle: {
    id: string;
    lat: number;
    lng: number;
  };
}

export type Step = 1 | 2 | 3;

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const ROUTES: Route[] = [
  {
    id: "AL",
    name: "Arjosari – Landungsari",
    fare: 5000,
    estimatedTrip: 22,
    transit: 0,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 4,
    recommended: true,
  },
  {
    id: "AG",
    name: "Arjosari – Gadang",
    fare: 5000,
    estimatedTrip: 26,
    transit: 1,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 2,
  },
  {
    id: "GA",
    name: "Gadang – Arjosari",
    fare: 5000,
    estimatedTrip: 24,
    transit: 0,
    destination: "Universitas Muhammadiyah Malang",
    activeVehicles: 3,
  },
];

export const VEHICLES: Vehicle[] = [
  {
    id: "AL001",
    routeId: "AL",
    plateNumber: "N 1234 AB",
    driver: "Pak Budi",
    speed: 28,
    status: "Menuju Penumpang",
    etaPickup: 4,
    etaDestination: 16,
    distanceToPassenger: 1.3,
    distanceRemaining: 5.2,
  },
  {
    id: "AL002",
    routeId: "AL",
    plateNumber: "N 4312 BC",
    driver: "Pak Agus",
    speed: 24,
    status: "Available",
    etaPickup: 6,
    etaDestination: 18,
    distanceToPassenger: 1.8,
    distanceRemaining: 5.7,
  },
  {
    id: "AG001",
    routeId: "AG",
    plateNumber: "N 5566 AA",
    driver: "Pak Joko",
    speed: 30,
    status: "Available",
    etaPickup: 8,
    etaDestination: 24,
    distanceToPassenger: 2.6,
    distanceRemaining: 7.1,
  },
  {
    id: "GA001",
    routeId: "GA",
    plateNumber: "N 7788 GA",
    driver: "Pak Surya",
    speed: 26,
    status: "Available",
    etaPickup: 5,
    etaDestination: 20,
    distanceToPassenger: 1.5,
    distanceRemaining: 6.0,
  },
];

export const DUMMY_TRACKING_VEHICLE = {
  lat: -7.9442,
  lng: 112.6088,
};

export const MALANG_CENTER = {
  latitude: -7.982611,
  longitude: 112.630875,
};
