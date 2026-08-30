"use client";

import { useEffect, useState } from "react";

import {
  useCreateScheduleTemplate,
  useUpdateScheduleTemplate,
} from "@/hooks/use-schedule-template";

import { useRoutes } from "@/hooks/routes/useRoutes";
import { useConductors } from "@/hooks/useConductors";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/vehicles/useVehicles";

import {
  DirectionType,
  AssignmentStatus,
} from "@/types/vehicles/vehicle.type";

import { ScheduleTemplate } from "@/types/schedule-template.type";

import {
  DAY_OPTIONS,
  STATUS_OPTIONS,
} from "@/app/admin/dashboard/schedule-templates/page";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  template?: ScheduleTemplate | null;
}

/* ================= DIRECTION OPTIONS ================= */

const DIRECTION_OPTIONS: {
  value: DirectionType;
  label: string;
}[] = [
  {
    value: DirectionType.FORWARD,
    label: "Pergi",
  },
  {
    value: DirectionType.RETURN,
    label: "Pulang",
  },
];

export default function ScheduleTemplateFormModal({
  isOpen,
  onClose,
  template,
}: Props) {
  const isEdit = Boolean(template);

  /* ================= FETCH RELATIONS ================= */

  const {
    data: routes = [],
    isLoading: loadingRoutes,
  } = useRoutes();

  const {
    data: drivers = [],
    isLoading: loadingDrivers,
  } = useDrivers();

  const {
    data: conductors = [],
    isLoading: loadingConductors,
  } = useConductors();

  const {
    data: vehicles = [],
    isLoading: loadingVehicles,
  } = useVehicles();

  /* ================= MUTATIONS ================= */

  const createMutation =
    useCreateScheduleTemplate();

  const updateMutation =
    useUpdateScheduleTemplate();

  /* ================= FORM STATE ================= */

  const [routeId, setRouteId] = useState("");

  const [vehicleId, setVehicleId] = useState("");

  const [driverId, setDriverId] = useState("");

  const [conductorId, setConductorId] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [direction, setDirection] =
    useState<DirectionType>(
      DirectionType.FORWARD,
    );

  const [activeDays, setActiveDays] =
    useState<number[]>([]);

  const [status, setStatus] =
    useState<AssignmentStatus>(
      AssignmentStatus.SCHEDULED,
    );

  const [isActive, setIsActive] =
    useState(true);

  const [error, setError] = useState("");

  /* ================= INITIAL FORM ================= */

  useEffect(() => {
    if (!isOpen) return;

    setError("");

    if (template) {
      setRouteId(
        template.route?.id
          ? String(template.route.id)
          : "",
      );

      setVehicleId(
        template.vehicle?.id
          ? String(template.vehicle.id)
          : "",
      );

      setDriverId(
        template.driver?.id
          ? String(template.driver.id)
          : "",
      );

      setConductorId(
        template.conductor?.id
          ? String(template.conductor.id)
          : "",
      );

      setStartTime(
        template.startTime ?? "",
      );

      setEndTime(
        template.endTime ?? "",
      );

      setDirection(
        template.direction ??
          DirectionType.FORWARD,
      );

      setActiveDays(
        template.activeDays ?? [],
      );

      setStatus(
        template.status ??
          AssignmentStatus.SCHEDULED,
      );

      setIsActive(
        template.isActive ?? true,
      );
    } else {
      resetForm();
    }
  }, [isOpen, template]);

  /* ================= RESET ================= */

  const resetForm = () => {
    setRouteId("");

    setVehicleId("");

    setDriverId("");

    setConductorId("");

    setStartTime("");

    setEndTime("");

    setDirection(
      DirectionType.FORWARD,
    );

    setActiveDays([]);

    setStatus(
      AssignmentStatus.SCHEDULED,
    );

    setIsActive(true);

    setError("");
  };

  /* ================= TOGGLE DAY ================= */

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day)
        ? prev.filter(
            (item) => item !== day,
          )
        : [...prev, day].sort(
            (a, b) => a - b,
          ),
    );
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError("");

    /* ================= VALIDATION ================= */

    if (!routeId) {
      setError("Route wajib dipilih.");
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Waktu mulai dan selesai wajib diisi.",
      );
      return;
    }

    if (activeDays.length === 0) {
      setError(
        "Pilih minimal satu hari aktif.",
      );
      return;
    }

    /* ================= PAYLOAD ================= */

    const data = {
      routeId: Number(routeId),

      vehicleId: vehicleId
        ? Number(vehicleId)
        : undefined,

      driverId: driverId
        ? Number(driverId)
        : undefined,

      conductorId: conductorId
        ? Number(conductorId)
        : undefined,

      startTime,

      endTime,

      direction,

      activeDays,

      status,

      isActive,

      /**
       * Sementara dummy.
       * Nanti bisa diganti dengan
       * select mock location.
       */
      mockLiveLocationId: 1,
    };

    /* ================= UPDATE ================= */

    if (isEdit && template) {
      updateMutation.mutate(
        {
          id: template.id,
          payload: data,
        },
        {
          onSuccess: () => {
            onClose();
          },

          onError: (err) => {
            setError(
              err instanceof Error
                ? err.message
                : "Gagal memperbarui template.",
            );
          },
        },
      );

      return;
    }

    /* ================= CREATE ================= */

    createMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },

      onError: (err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal membuat template.",
        );
      },
    });
  };

  /* ================= STATES ================= */

  if (!isOpen) {
    return null;
  }

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending;

  const isLoadingRelations =
    loadingRoutes ||
    loadingDrivers ||
    loadingConductors ||
    loadingVehicles;

  /* ================= RENDER ================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit
                ? "Edit Schedule Template"
                : "Buat Schedule Template"}
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              {isEdit
                ? "Perbarui konfigurasi template jadwal."
                : "Tambahkan template jadwal perjalanan baru."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ================= FORM ================= */}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
            {/* ================= ROUTE ================= */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Route
              </label>

              <select
                value={routeId}
                onChange={(e) =>
                  setRouteId(e.target.value)
                }
                disabled={
                  loadingRoutes ||
                  isSubmitting
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingRoutes
                    ? "Memuat route..."
                    : "Pilih route"}
                </option>

                {routes.map((route) => (
                  <option
                    key={route.id}
                    value={route.id}
                  >
                    {route.routeCode} -{" "}
                    {route.routeName}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= VEHICLE ================= */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Kendaraan
              </label>

              <select
                value={vehicleId}
                onChange={(e) =>
                  setVehicleId(e.target.value)
                }
                disabled={
                  loadingVehicles ||
                  isSubmitting
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingVehicles
                    ? "Memuat kendaraan..."
                    : "Pilih kendaraan"}
                </option>

                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.vehicleCode} -{" "}
                    {vehicle.plateNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= DRIVER & CONDUCTOR ================= */}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* DRIVER */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Driver
                </label>

                <select
                  value={driverId}
                  onChange={(e) =>
                    setDriverId(
                      e.target.value,
                    )
                  }
                  disabled={
                    loadingDrivers ||
                    isSubmitting
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingDrivers
                      ? "Memuat driver..."
                      : "Pilih driver"}
                  </option>

                  {drivers.map((driver) => (
                    <option
                      key={driver.id}
                      value={driver.id}
                    >
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONDUCTOR */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Conductor
                </label>

                <select
                  value={conductorId}
                  onChange={(e) =>
                    setConductorId(
                      e.target.value,
                    )
                  }
                  disabled={
                    loadingConductors ||
                    isSubmitting
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingConductors
                      ? "Memuat conductor..."
                      : "Pilih conductor"}
                  </option>

                  {conductors.map(
                    (conductor) => (
                      <option
                        key={conductor.id}
                        value={conductor.id}
                      >
                        {conductor.name}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* ================= TIME ================= */}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* START */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Waktu Mulai
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* END */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Waktu Selesai
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(
                      e.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* ================= DIRECTION ================= */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Arah
              </label>

              <select
                value={direction}
                onChange={(e) =>
                  setDirection(
                    e.target.value as DirectionType,
                  )
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              >
                {DIRECTION_OPTIONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* ================= ACTIVE DAYS ================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hari Aktif
              </label>

              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => {
                  const selected =
                    activeDays.includes(
                      day.value,
                    );

                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        toggleDay(
                          day.value,
                        )
                      }
                      disabled={isSubmitting}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= STATUS ================= */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as AssignmentStatus,
                  )
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              >
                {STATUS_OPTIONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* ================= ACTIVE ================= */}

            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked,
                  )
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Template aktif
                </p>

                <p className="text-xs text-gray-400">
                  Template dapat digunakan
                  untuk membuat jadwal.
                </p>
              </div>
            </label>

            {/* ================= MOCK LOCATION ================= */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mock Live Location
              </label>

              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                Dummy Location ID: 1
              </div>
            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}

          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingRelations
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}