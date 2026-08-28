export interface WalkingInfo {
  distance: number;
  duration: number;
}

export interface SearchRoutesParams {
  userLat: number;
  userLng: number;
  destLat: number;
  destLng: number;
}

export interface RouteSearchResult {
  routeId: number;
  routeCode: string;
  routeName: string;
  direction: "FORWARD" | "BACKWARD";
  sequenceTitikAwal: number;
  sequenceTitikTujuan: number;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  beelineTotal: number;
  walkingToRoute: WalkingInfo;
  walkingToDestination: WalkingInfo;
  totalWalkingDistance: number;
  totalWalkingDuration: number;
}

export type RouteSearchResponse = RouteSearchResult[];