import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/payments/usePayments";
import { usePaymentSocket } from "@/hooks/payments/usePaymentSocket";
import { useCreateSinyal } from "@/hooks/sinyal/useSinyal";
import { PaymentStatus } from "@/types/payments/payment.type";
import type {
  CreatePaymentType,
  PaymentCreateResponse,
} from "@/types/payments/payment.type";
import type { UpcomingVehicle } from "@/types/route-search.type";
import type { Coordinates } from "@/types/mapbox.type";
import type { BookingReturnState, SelectedRoute } from "../types";
import { BOOKING_RETURN_STATE_KEY } from "../types";

type BookingStateDeps = {
  upcomingVehicles: UpcomingVehicle[];
  originCoords: Coordinates | null;
  // Journey state diperlukan untuk menyimpan konteks saat redirect ke login
  origin: string;
  destination: string;
  destinationCoords: Coordinates | null;
  selectedRoute: SelectedRoute | null;
  scenario: 1 | 2;
  pickingMode: string;
};

/**
 * Mengelola state booking & pembayaran Skenario 3:
 * - Pilih kendaraan untuk di-booking
 * - Buat payment
 * - Sinkronisasi status payment via WebSocket
 * - Kirim sinyal ke kendaraan
 */
export function useBookingState({
  upcomingVehicles,
  originCoords,
  origin,
  destination,
  destinationCoords,
  selectedRoute,
  scenario,
  pickingMode,
}: BookingStateDeps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [bookingVehicle, setBookingVehicle] = useState<UpcomingVehicle | null>(
    null,
  );
  const [bookingAmount, setBookingAmount] = useState("5000");
  const [bookingType, setBookingType] = useState<CreatePaymentType>("CASH");
  const [bookingResult, setBookingResult] =
    useState<PaymentCreateResponse | null>(null);

  const bookingPayments = usePayments(null);

  // ─── Realtime payment status via WebSocket ───
  const bookingPaymentRealtime = usePaymentSocket(
    bookingVehicle?.assignmentId ?? null,
  );

  useEffect(() => {
    const realtimePayment = bookingPaymentRealtime.payment;
    if (!realtimePayment || !bookingResult) return;
    if (realtimePayment.id !== bookingResult.data.id) return;
    if (realtimePayment.status === bookingResult.data.status) return;

    const timer = window.setTimeout(() => {
      setBookingResult((previous) =>
        previous
          ? { ...previous, data: { ...previous.data, ...realtimePayment } }
          : previous,
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [bookingPaymentRealtime.payment, bookingResult]);

  // ─── Sinyal ───
  const {
    mutateAsync: createSinyal,
    isPending: isCreatingSinyal,
    isError: isCreateSinyalError,
    error: createSinyalError,
  } = useCreateSinyal();

  // ─── Handlers ───

  const handleBookVehicle = (vehicle: UpcomingVehicle) => {
    if (!isAuthenticated) {
      const stateToRestore: BookingReturnState | null =
        originCoords && destinationCoords && selectedRoute
          ? {
              origin,
              destination,
              originCoords,
              destinationCoords,
              selectedRoute,
              scenario,
              pickingMode: pickingMode as BookingReturnState["pickingMode"],
              bookingVehicleId: vehicle.assignmentId,
              bookingAmount,
              bookingType,
            }
          : null;

      if (stateToRestore) {
        localStorage.setItem(
          BOOKING_RETURN_STATE_KEY,
          JSON.stringify(stateToRestore),
        );
      }

      alert("Silakan login terlebih dahulu untuk melakukan booking.");
      router.push("/auth/login?redirect=%2Fgetv2");
      return;
    }

    setBookingVehicle(vehicle);
    setBookingResult(null);
  };

  const handleCreateBookingPayment = async () => {
    if (!bookingVehicle) return;

    const userId = Number(user?.id);
    const amount = Number(bookingAmount.replace(/\D/g, ""));

    if (!Number.isInteger(userId) || userId <= 0) {
      alert("Silakan login sebagai user sebelum melakukan booking.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 1) {
      alert("Nominal pembayaran harus lebih besar dari 0.");
      return;
    }

    try {
      const result = await bookingPayments.create(userId, {
        vehicleAssignmentId: bookingVehicle.assignmentId,
        paymentType: bookingType,
        amount,
      });
      setBookingResult(result);
    } catch {
      // Error ditampilkan oleh modal dari hook state.
    }
  };

  const handleSendSinyal = async () => {
    if (!originCoords) {
      alert("Titik penjemputan belum tersedia.");
      return;
    }

    const vehicleAssignmentId = upcomingVehicles.map((vehicle) =>
      String(vehicle.assignmentId),
    );

    if (vehicleAssignmentId.length === 0) {
      alert("Belum ada kendaraan yang tersedia.");
      return;
    }

    await createSinyal({
      latitude: originCoords.lat,
      longitude: originCoords.lng,
      vehicleAssignmentId,
    });
  };

  const handleMarkAsSucceeded = async () => {
    const paymentRequestId =
      bookingResult?.data.xendit?.paymentRequestId ??
      bookingResult?.data.xendit?.payment_request_id;
    if (!paymentRequestId || !bookingResult) return;

    await bookingPayments.markAsSucceeded(paymentRequestId);
    setBookingResult((previous) =>
      previous
        ? {
            ...previous,
            data: { ...previous.data, status: PaymentStatus.SUCCEEDED },
          }
        : previous,
    );
  };

  return {
    bookingVehicle,
    bookingAmount,
    bookingType,
    bookingResult,
    bookingPayments,
    isCreatingSinyal,
    isCreateSinyalError,
    createSinyalError,
    setBookingVehicle,
    setBookingResult,
    setBookingAmount,
    setBookingType,
    handleBookVehicle,
    handleCreateBookingPayment,
    handleSendSinyal,
    handleMarkAsSucceeded,
  };
}
