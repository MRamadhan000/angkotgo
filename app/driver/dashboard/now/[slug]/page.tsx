"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { useSeatManagement } from "@/hooks/vehicles/useSeatManagement";
import { useVehicleAssignmentFinancial } from "@/hooks/payment/useVehicleAssignmentFinancial";

import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";
import { PaymentItem } from "@/types/payment.type";

import { EstimatedStopsTimeline } from "@/components/common/EstimatedStopsTimeline";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";
import { SeatGridControl } from "@/components/now/SeatGridControl";

type AssignmentDetailWithPersonnel = VehicleSchedule & {
  status?: string;
  driver?: {
    id: number;
    name: string;
  } | null;
  conductor?: {
    id: number;
    name: string;
  } | null;
  routeName?: string;
  routeCode?: string;
  direction?: string;
  startTime?: string;
  endTime?: string;
  vehicle?: {
    id: number;
    vehicleCode: string;
    plateNumber: string;
  } | null;
  estimatedStopsSchedule?: unknown[];
};

export default function AssignmentDetailPage() {
  const params = useParams<{ slug: string }>();
  const assignmentId = Number(params.slug);

  const { user } = useAuth();

  const [isStopsOpen, setIsStopsOpen] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("SCHEDULED");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { assignmentDetail, detailLoading, detailError, getAssignmentById } =
    usePersonnelSchedule();

  const {
    status: seatStatus,
    loading: seatsLoading,
    error: seatsError,
    canControl,
    toggleSeat,
    toggleJourneyStatus,
  } = useSeatManagement(String(assignmentId), false);

  const {
    summary,
    payments,
    isLoading: paymentLoading,
    error: paymentError,
  } = useVehicleAssignmentFinancial(assignmentId);

  const detail = assignmentDetail as AssignmentDetailWithPersonnel | null;

  useEffect(() => {
    if (!assignmentId || Number.isNaN(assignmentId)) return;

    void getAssignmentById(assignmentId);
  }, [assignmentId, getAssignmentById]);

  useEffect(() => {
    if (detail?.status) {
      setSelectedStatus(detail.status.toUpperCase());
    }
  }, [detail?.status]);

  const handleUpdateStatus = async () => {
    if (!seatStatus || !canControl) return;

    setIsUpdatingStatus(true);

    try {
      const currentStatus = seatStatus.status;

      if (selectedStatus === "ONGOING" && currentStatus !== "ONGOING") {
        await toggleJourneyStatus();
      }

      if (selectedStatus === "COMPLETED" && currentStatus !== "COMPLETED") {
        await toggleJourneyStatus();
      }

      setIsStatusModalOpen(false);
      await getAssignmentById(assignmentId);
    } catch (error) {
      console.error("Gagal mengubah status perjalanan:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!assignmentId || Number.isNaN(assignmentId)) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <ErrorAlert message="ID penugasan tidak valid." />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          title="Detail Penugasan Kendaraan"
          description="Informasi profil, status penugasan, ketersediaan seat, dan pemasukan perjalanan."
        />

        {detailLoading && <DetailLoading />}

        {detailError && !detailLoading && <ErrorAlert message={detailError} />}

        {!detailLoading && !detailError && detail && (
          <>
            <DriverProfileWidget user={user} assignment={detail} />

            <AssignmentStatusCard
              status={detail.status || seatStatus?.status || "SCHEDULED"}
              onOpenModal={() => setIsStatusModalOpen(true)}
            />

            <SeatAvailabilityWidget
              currentPassengers={seatStatus?.currentPassengers ?? 0}
              totalSeats={seatStatus?.totalSeats ?? 0}
              loading={seatsLoading}
              error={seatsError}
            />

            <FinancialWidget
              summary={summary}
              payments={payments}
              loading={paymentLoading}
              error={paymentError}
            />

            <SeatGridControl
              seats={seatStatus?.seats || []}
              canControl={canControl}
              onToggleSeat={toggleSeat}
              hasConductor={seatStatus?.hasConductor || false}
              isUserConductor={false}
            />

            <EstimatedStopsTimeline
              stops={detail.estimatedStopsSchedule || []}
              isOpen={isStopsOpen}
              onToggle={() => setIsStopsOpen((previous) => !previous)}
            />
          </>
        )}
      </div>

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onSave={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />
    </main>
  );
}

function DriverProfileWidget({
  user,
  assignment,
}: {
  user: any;
  assignment: AssignmentDetailWithPersonnel;
}) {
  const driverName = assignment.driver?.name || user?.name || "Driver";

  const initials = driverName
    .split(" ")
    .map((part: string) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-blue-100">Profil Pengemudi</p>

          <h2 className="truncate text-lg font-bold">{driverName}</h2>

          <p className="truncate text-xs text-blue-100">
            {user?.email || "Email belum tersedia"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-xs sm:grid-cols-4">
        <ProfileItem label="Rute" value={assignment.routeName || "-"} />
        <ProfileItem label="Kode Rute" value={assignment.routeCode || "-"} />
        <ProfileItem label="Arah" value={assignment.direction || "-"} />
        <ProfileItem
          label="Kendaraan"
          value={assignment.vehicle?.plateNumber || "-"}
        />
      </div>
    </section>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-blue-100">{label}</p>
      <p className="truncate font-semibold text-white">{value}</p>
    </div>
  );
}

function SeatAvailabilityWidget({
  currentPassengers,
  totalSeats,
  loading,
  error,
}: {
  currentPassengers: number;
  totalSeats: number;
  loading: boolean;
  error: string | null;
}) {
  const availableSeats = Math.max(totalSeats - currentPassengers, 0);
  const percentage =
    totalSeats > 0 ? Math.min((currentPassengers / totalSeats) * 100, 100) : 0;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Ketersediaan Seat
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {loading
              ? "Memuat status seat..."
              : `${currentPassengers} / ${totalSeats} seat terisi`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{availableSeats}</p>

          <p className="text-[10px] text-gray-400">Seat tersedia</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}

function FinancialWidget({
  summary,
  payments,
  loading,
  error,
}: {
  summary: {
    totalTransactions: number;
    totalPaidTransactions: number;
    totalPendingTransactions: number;
    totalFailedTransactions: number;
    totalCancelledTransactions: number;
    totalPaid: number;
    totalPending: number;
    totalCash: number;
    totalOnline: number;
  } | null;
  payments: PaymentItem[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 border-b border-gray-100 pb-4">
        <h2 className="text-sm font-bold text-slate-900">Detail Pembayaran</h2>

        <p className="mt-1 text-xs text-gray-500">
          Data pembayaran berdasarkan penugasan ini.
        </p>
      </div>

      {loading && (
        <p className="py-6 text-center text-xs text-gray-400">
          Memuat data pembayaran...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>
      )}

      {!loading && !error && summary && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FinancialItem
              label="Total Pemasukan"
              value={formatCurrency(summary.totalPaid)}
              highlighted
            />

            <FinancialItem
              label="Transaksi Dibayar"
              value={String(summary.totalPaidTransactions)}
            />

            <FinancialItem
              label="Pembayaran Cash"
              value={formatCurrency(summary.totalCash)}
            />

            <FinancialItem
              label="Pembayaran Online"
              value={formatCurrency(summary.totalOnline)}
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase text-gray-500">
                  <th className="px-3 py-3">Kode Pembayaran</th>
                  <th className="px-3 py-3">Tipe</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Jumlah</th>
                  <th className="px-3 py-3">Waktu</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium">
                      {payment.paymentCode}
                    </td>

                    <td className="px-3 py-3">{payment.paymentType}</td>

                    <td className="px-3 py-3">{payment.status}</td>

                    <td className="px-3 py-3 font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-3 py-3 text-gray-500">
                      {formatPaymentDate(payment.paidAt || payment.createdAt)}
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      Belum ada transaksi pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function FinancialItem({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlighted
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <p className="text-[10px] text-gray-500">{label}</p>

      <p
        className={`mt-1 text-sm font-bold ${
          highlighted ? "text-emerald-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatPaymentDate(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
