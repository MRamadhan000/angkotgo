import type { DirectionType } from "@/types/vehicles/vehicle.type";
import type { Coordinates } from "@/types/mapbox.type";
import type { CreatePaymentType } from "@/types/payments/payment.type";
import type { PointType } from "@/types/mapbox.type";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const SHEET_TOP_PEEK = 68;
export const SHEET_TOP_FULL = 10;
export const SHEET_OVERDRAG_LIMIT = SHEET_TOP_PEEK + 12;
export const BOOKING_RETURN_STATE_KEY = "getv2-booking-return-state";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SheetSnap = "peek" | "full";

export type ActiveInputState = PointType | null;

export type SelectedRoute = {
  routeId: number;
  direction: DirectionType;
};

export type BookingReturnState = {
  origin: string;
  destination: string;
  originCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  selectedRoute: SelectedRoute | null;
  scenario: 1 | 2;
  pickingMode: PointType;
  bookingVehicleId: number | null;
  bookingAmount: string;
  bookingType: CreatePaymentType;
};
