import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getUpcomingVehicles } from "@/services/routes/route-route.service";
import type { Coordinates, PointType } from "@/types/mapbox.type";
import type { UpcomingVehicle } from "@/types/route-search.type";
import type { CreatePaymentType } from "@/types/payments/payment.type";
import {
  BOOKING_RETURN_STATE_KEY,
  type BookingReturnState,
  type SelectedRoute,
} from "../types";

type JourneySetters = {
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  setOriginCoords: (v: Coordinates | null) => void;
  setDestinationCoords: (v: Coordinates | null) => void;
  setSelectedRoute: (v: SelectedRoute | null) => void;
  setScenario: (v: 1 | 2) => void;
  setPickingMode: (v: PointType) => void;
  setBookingAmount: (v: string) => void;
  setBookingType: (v: CreatePaymentType) => void;
  setBookingVehicle: (v: UpcomingVehicle | null) => void;
  setBookingResult: (v: null) => void;
  setShowGpsModal: (v: boolean) => void;
};

type JourneyState = {
  origin: string;
  destination: string;
  originCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  selectedRoute: SelectedRoute | null;
  scenario: 1 | 2;
  pickingMode: PointType;
  bookingVehicle: UpcomingVehicle | null;
  pendingBookingVehicleId: number | null;
  bookingAmount: string;
  bookingType: CreatePaymentType;
};

/**
 * Menyimpan dan memulihkan state perjalanan pengguna dari localStorage.
 * Digunakan untuk mempertahankan konteks booking saat user redirect ke halaman login.
 */
export function useJourneyPersistence(
  journeyState: JourneyState,
  realtimeUpcomingVehicles: UpcomingVehicle[],
  setters: JourneySetters,
) {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [isRestoringBooking, setIsRestoringBooking] = useState(false);
  const [pendingBookingVehicleId, setPendingBookingVehicleId] = useState<
    number | null
  >(null);

  const restoredBookingStateRef = useRef(false);
  const journeyHydratedRef = useRef(false);
  const currentJourneyActivityRef = useRef(false);

  const {
    origin,
    destination,
    originCoords,
    destinationCoords,
    selectedRoute,
    scenario,
    pickingMode,
    bookingVehicle,
    bookingAmount,
    bookingType,
  } = journeyState;

  // ─── Track apakah ada journey aktif ───
  useEffect(() => {
    currentJourneyActivityRef.current =
      Boolean(origin.trim()) ||
      Boolean(destination.trim()) ||
      Boolean(originCoords) ||
      Boolean(destinationCoords) ||
      Boolean(selectedRoute) ||
      Boolean(bookingVehicle) ||
      pendingBookingVehicleId !== null;
  }, [
    origin,
    destination,
    originCoords,
    destinationCoords,
    selectedRoute,
    bookingVehicle,
    pendingBookingVehicleId,
  ]);

  // ─── Restore state dari localStorage ───
  useEffect(() => {
    if (isAuthLoading) return;

    if (
      restoredBookingStateRef.current &&
      currentJourneyActivityRef.current
    ) {
      return;
    }

    restoredBookingStateRef.current = true;
    let restoreTimer: number | undefined;

    try {
      const storedState = localStorage.getItem(BOOKING_RETURN_STATE_KEY);
      if (!storedState) {
        journeyHydratedRef.current = true;
        return;
      }

      const savedState = JSON.parse(storedState) as BookingReturnState;
      restoreTimer = window.setTimeout(async () => {
        setIsRestoringBooking(true);
        setters.setOrigin(savedState.origin);
        setters.setDestination(savedState.destination);
        setters.setOriginCoords(savedState.originCoords);
        setters.setDestinationCoords(savedState.destinationCoords);
        setters.setSelectedRoute(savedState.selectedRoute);
        setters.setBookingAmount(savedState.bookingAmount);
        setters.setBookingType(savedState.bookingType);
        setPendingBookingVehicleId(savedState.bookingVehicleId);
        setters.setScenario(
          savedState.scenario ?? (savedState.selectedRoute ? 2 : 1),
        );
        setters.setPickingMode(savedState.pickingMode ?? "destination");
        setters.setShowGpsModal(false);
        journeyHydratedRef.current = true;

        try {
          if (!savedState.selectedRoute || !savedState.originCoords) return;

          const vehicleParams = {
            routeId: savedState.selectedRoute.routeId,
            direction: savedState.selectedRoute.direction,
            latitude: savedState.originCoords.lat,
            longitude: savedState.originCoords.lng,
          };

          await queryClient.fetchQuery({
            queryKey: ["upcoming-vehicles", vehicleParams],
            queryFn: () => getUpcomingVehicles(vehicleParams),
          });
        } catch (error) {
          console.error("Gagal memulihkan kendaraan booking:", error);
        } finally {
          setIsRestoringBooking(false);
        }
      }, 0);
    } catch {
      localStorage.removeItem(BOOKING_RETURN_STATE_KEY);
    }

    return () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
    };
  }, [isAuthLoading, isAuthenticated, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Save state ke localStorage saat ada perubahan ───
  useEffect(() => {
    if (isAuthLoading || !journeyHydratedRef.current) return;

    const journeyStateToSave: BookingReturnState = {
      origin,
      destination,
      originCoords,
      destinationCoords,
      selectedRoute,
      scenario,
      pickingMode,
      bookingVehicleId: bookingVehicle?.assignmentId ?? pendingBookingVehicleId,
      bookingAmount,
      bookingType,
    };

    const hasJourneyActivity =
      Boolean(origin.trim()) ||
      Boolean(destination.trim()) ||
      Boolean(originCoords) ||
      Boolean(destinationCoords) ||
      Boolean(selectedRoute) ||
      Boolean(bookingVehicle) ||
      pendingBookingVehicleId !== null;

    if (hasJourneyActivity) {
      localStorage.setItem(
        BOOKING_RETURN_STATE_KEY,
        JSON.stringify(journeyStateToSave),
      );
    }
  }, [
    isAuthLoading,
    origin,
    destination,
    originCoords,
    destinationCoords,
    selectedRoute,
    scenario,
    pickingMode,
    bookingVehicle,
    pendingBookingVehicleId,
    bookingAmount,
    bookingType,
  ]);

  // ─── Resolve pendingBookingVehicleId → bookingVehicle ───
  useEffect(() => {
    if (pendingBookingVehicleId === null) return;

    const vehicle = realtimeUpcomingVehicles.find(
      (item) => item.assignmentId === pendingBookingVehicleId,
    );
    if (!vehicle) return;

    const restoreTimer = window.setTimeout(() => {
      setters.setBookingVehicle(vehicle);
      setters.setBookingResult(null);
      setPendingBookingVehicleId(null);
      setIsRestoringBooking(false);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [pendingBookingVehicleId, realtimeUpcomingVehicles]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isRestoringBooking,
    pendingBookingVehicleId,
  };
}
