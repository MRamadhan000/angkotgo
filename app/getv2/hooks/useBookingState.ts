import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/payments/usePayments";
import { usePaymentSocket } from "@/hooks/payments/usePaymentSocket";
import {
  useCompleteSinyal,
  useCreateSinyal,
} from "@/hooks/sinyal/useSinyal";
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
  showAlert: (message: string, onSubmit?: () => void) => Promise<boolean>;
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
  showAlert,
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
  const [sinyalId, setSinyalId] = useState<string | null>(null);

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
  const { mutateAsync: completeSinyal, isPending: isCompletingSinyal } =
    useCompleteSinyal();

  // ─── Handlers ───

  const handleBookVehicle = async (vehicle: UpcomingVehicle) => {
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

      const confirmed = await showAlert(
        "Silakan login terlebih dahulu untuk melakukan booking.",
        () => router.push("/auth/login?redirect=%2Fgetv2"),
      );
      if (!confirmed) return;
      return;
    }

    setBookingVehicle(vehicle);
    setBookingResult(null);
  };

  const handleCreateBookingPayment = async (): Promise<boolean> => {
    if (!bookingVehicle) return false;

    const userId = Number(user?.id);
    const amount = Number(bookingAmount.replace(/\D/g, ""));

    if (!Number.isInteger(userId) || userId <= 0) {
      await showAlert("Silakan login sebagai user sebelum melakukan booking.");
      return false;
    }
    if (!Number.isFinite(amount) || amount < 1) {
      await showAlert("Nominal pembayaran harus lebih besar dari 0.");
      return false;
    }

    try {
      const result = await bookingPayments.create(userId, {
        vehicleAssignmentId: bookingVehicle.assignmentId,
        paymentType: bookingType,
        amount,
      });
      setBookingResult(result);
      return true;
    } catch {
      // Error ditampilkan oleh modal dari hook state.
      return false;
    }
  };

  const handleSendSinyal = async (): Promise<boolean> => {
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
              bookingVehicleId: bookingVehicle?.assignmentId ?? null,
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

      const confirmed = await showAlert(
        "Silakan login terlebih dahulu untuk mengirim sinyal.",
        () => router.push("/auth/login?redirect=%2Fgetv2"),
      );
      return confirmed;
    }

    if (!originCoords) {
      await showAlert("Titik penjemputan belum tersedia.");
      return false;
    }

    const vehicleAssignmentId = upcomingVehicles.map((vehicle) =>
      String(vehicle.assignmentId),
    );

    if (vehicleAssignmentId.length === 0) {
      await showAlert("Belum ada kendaraan yang tersedia.");
      return false;
    }

    const createdSinyal = await createSinyal({
      latitude: originCoords.lat,
      longitude: originCoords.lng,
      vehicleAssignmentId,
      userId: Number(user?.id),
    });
    setSinyalId(createdSinyal.id);
    return true;
  };

  const handleCompleteSinyal = async (): Promise<void> => {
    if (!sinyalId) {
      throw new Error("ID sinyal tidak tersedia.");
    }

    await completeSinyal({
      id: sinyalId,
      data: { status: "COMPLETED" },
    });
    setSinyalId(null);
  };

  const handleMarkAsSucceeded = async (): Promise<boolean> => {
    if (!bookingResult) return false;

    const paymentRequestId =
      bookingResult.data.xendit?.paymentRequestId ??
      bookingResult.data.xendit?.payment_request_id;

    if (!paymentRequestId) return false;

    try {
      // Panggil webhook — parseResponse di service akan throw jika bukan 200/201
      const response = await bookingPayments.markAsSucceeded(paymentRequestId);
      const responseStatus = response.data?.status?.toUpperCase();

      if (responseStatus && responseStatus !== PaymentStatus.SUCCEEDED) {
        throw new Error("Status pembayaran belum berhasil dikonfirmasi.");
      }

      // Hanya sampai sini jika response 200/201 → update state → animasi sukses
      setBookingResult((previous) =>
        previous
          ? {
              ...previous,
              data: { ...previous.data, status: PaymentStatus.SUCCEEDED },
            }
          : previous,
      );
      return true;
    } catch {
      // Webhook gagal (4xx/5xx) — error sudah di-set oleh usePayments.
      // Animasi sukses TIDAK ditampilkan.
      return false;
    }
  };

  return {
    bookingVehicle,
    bookingAmount,
    bookingType,
    bookingResult,
    bookingPayments,
    isCreatingSinyal,
    isCompletingSinyal,
    isCreateSinyalError,
    createSinyalError,
    setBookingVehicle,
    setBookingResult,
    setBookingAmount,
    setBookingType,
    handleBookVehicle,
    handleCreateBookingPayment,
    handleSendSinyal,
    handleCompleteSinyal,
    handleMarkAsSucceeded,
  };
}
