"use client";

import { useMemo, useState } from "react";
import {
  useScheduleTemplates,
  useDeleteScheduleTemplate,
  useStartScheduleTemplate,
} from "@/hooks/use-schedule-template";

import { ScheduleTemplate } from "@/types/schedule-template.type";
import { formatTime } from "@/components/ScheduleTemplate/scheduleTemplateUtil";

import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ScheduleTemplate/Animation";

import {
  Avatar,
  DirectionBadge,
  ActiveDays,
  StatusBadge,
  ActiveBadge,
  PersonCard,
} from "@/components/ScheduleTemplate/ui";

import ScheduleTemplateFormModal from "@/components/ScheduleTemplate/ScheduleTemplateFormModal";

export const DAY_OPTIONS = [
  { value: 1, label: "Sen" },
  { value: 2, label: "Sel" },
  { value: 3, label: "Rab" },
  { value: 4, label: "Kam" },
  { value: 5, label: "Jum" },
  { value: 6, label: "Sab" },
  { value: 7, label: "Min" },
];

export const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const TABLE_COLUMNS = [
  { key: "route", label: "Rute" },
  { key: "vehicle", label: "Kendaraan" },
  { key: "driver", label: "Driver" },
  { key: "conductor", label: "Conductor" },
  { key: "time", label: "Waktu" },
  { key: "activeDays", label: "Hari Aktif" },
  { key: "status", label: "Status" },
  { key: "mockLocation", label: "Mock Location" },
  { key: "actions", label: "Aksi" },
] as const;

export default function ScheduleTemplatePage() {
  const {
    data: scheduleTemplates = [],
    isLoading,
    isError,
    error,
  } = useScheduleTemplates();

  const deleteMutation = useDeleteScheduleTemplate();
  const startMutation = useStartScheduleTemplate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplate | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedActive, setSelectedActive] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: ScheduleTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDelete = (template: ScheduleTemplate) => {
    const routeName =
      template.route?.routeName ?? `Template #${template.id}`;

    if (
      !window.confirm(
        `Yakin ingin menghapus schedule template "${routeName}"?`,
      )
    ) {
      return;
    }

    deleteMutation.mutate(template.id);
  };

  const handleStart = () => {
    if (
      !window.confirm(
        "Yakin ingin memulai jadwal sekarang? Sistem akan memproses schedule template yang aktif.",
      )
    ) {
      return;
    }

    startMutation.mutate();
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedDays([]);
    setSelectedStatus("ALL");
    setSelectedActive("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedDays.length > 0 ||
    selectedStatus !== "ALL" ||
    selectedActive !== "ALL";

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scheduleTemplates.filter((template) => {
      const matchesSearch =
        keyword === "" ||
        [
          template.route?.routeName,
          template.route?.routeCode,
          template.vehicle?.vehicleCode,
          template.vehicle?.plateNumber,
          template.driver?.name,
          template.conductor?.name,
        ]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(keyword));

      const matchesDays =
        selectedDays.length === 0 ||
        (template.activeDays ?? []).some((day) =>
          selectedDays.includes(day),
        );

      const matchesStatus =
        selectedStatus === "ALL" ||
        template.status === selectedStatus;

      const matchesActive =
        selectedActive === "ALL" ||
        (selectedActive === "ACTIVE" && template.isActive) ||
        (selectedActive === "INACTIVE" && !template.isActive);

      return (
        matchesSearch &&
        matchesDays &&
        matchesStatus &&
        matchesActive
      );
    });
  }, [
    scheduleTemplates,
    search,
    selectedDays,
    selectedStatus,
    selectedActive,
  ]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <main className="space-y-6 p-4 sm:p-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Schedule Template
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola template jadwal perjalanan kendaraan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {hasActiveFilters
                    ? "Hasil Filter"
                    : "Total Template"}
                </p>

                <p className="mt-0.5 text-xl font-bold text-gray-900">
                  {filteredTemplates.length}

                  {hasActiveFilters && (
                    <span className="ml-1 text-sm font-normal text-gray-400">
                      / {scheduleTemplates.length}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              {startMutation.isPending
                ? "Memulai..."
                : "Mulai Jadwal Sekarang"}
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>

              Tambah Template
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari rute, kendaraan, driver, atau conductor..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-44"
            >
              <option value="ALL">Semua Status</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={selectedActive}
              onChange={(e) =>
                setSelectedActive(
                  e.target.value as
                    | "ALL"
                    | "ACTIVE"
                    | "INACTIVE",
                )
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-40"
            >
              <option value="ALL">Semua</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
            <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">
              Hari Aktif
            </p>

            <div className="flex flex-wrap gap-1.5">
              {DAY_OPTIONS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                const isWeekend = day.value === 6 || day.value === 7;

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    aria-pressed={isSelected}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? isWeekend
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1150px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="px-5 py-4 text-left font-semibold text-gray-600"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {template.route?.routeName ?? "-"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {template.route?.routeCode ?? "-"}
                            </p>
                          </div>

                          <DirectionBadge
                            direction={template.direction}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {template.vehicle ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {template.vehicle.vehicleCode}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {template.vehicle.plateNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Belum ditentukan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {template.driver ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={template.driver.name} />

                            <span className="font-medium text-gray-700">
                              {template.driver.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Belum ditentukan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {template.conductor ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={template.conductor.name}
                            />

                            <span className="font-medium text-gray-700">
                              {template.conductor.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Belum ditentukan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="whitespace-nowrap">
                          <span className="font-semibold text-gray-900">
                            {formatTime(template.startTime)}
                          </span>

                          <span className="mx-2 text-gray-400">
                            →
                          </span>

                          <span className="text-gray-600">
                            {formatTime(template.endTime)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <ActiveDays
                          days={template.activeDays}
                          highlightDays={selectedDays}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <StatusBadge status={template.status} />
                          <ActiveBadge isActive={template.isActive} />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {template.mockLiveLocation ? (
                          <p className="font-medium text-gray-900">
                            {template.mockLiveLocation.name}
                          </p>
                        ) : (
                          <span className="text-gray-400">
                            Tidak digunakan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(template)}
                            disabled={
                              deleteMutation.isPending ||
                              startMutation.isPending
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(template)}
                            disabled={
                              deleteMutation.isPending ||
                              startMutation.isPending
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteMutation.isPending
                              ? "..."
                              : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        hasActiveFilters={hasActiveFilters}
                        onReset={resetFilters}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-gray-100 md:hidden">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div key={template.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {template.route?.routeName ?? "-"}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {template.route?.routeCode ?? "-"}
                        </p>

                        <DirectionBadge
                          direction={template.direction}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(template)}
                      disabled={
                        deleteMutation.isPending ||
                        startMutation.isPending
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit Template
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      disabled={
                        deleteMutation.isPending ||
                        startMutation.isPending
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteMutation.isPending
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5">
                    <p className="text-xs text-gray-400">
                      Waktu Perjalanan
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatTime(template.startTime)}

                      <span className="mx-2 text-gray-400">
                        →
                      </span>

                      {formatTime(template.endTime)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Kendaraan
                    </p>

                    {template.vehicle ? (
                      <div className="rounded-lg border border-gray-100 p-3">
                        <p className="font-semibold text-gray-900">
                          {template.vehicle.vehicleCode}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {template.vehicle.plateNumber}
                          </span>

                          <span>•</span>

                          <span>{template.vehicle.type}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Belum ditentukan
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <PersonCard
                      label="Driver"
                      name={template.driver?.name}
                    />

                    <PersonCard
                      label="Conductor"
                      name={template.conductor?.name}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Hari Aktif
                    </p>

                    <ActiveDays
                      days={template.activeDays}
                      highlightDays={selectedDays}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Status
                      </p>

                      <div className="mt-1">
                        <StatusBadge status={template.status} />
                      </div>
                    </div>

                    <ActiveBadge
                      isActive={template.isActive}
                    />
                  </div>

                  {template.mockLiveLocation && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400">
                        Mock Location
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {template.mockLiveLocation.name}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                hasActiveFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            )}
          </div>
        </section>
      </main>

      <ScheduleTemplateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={selectedTemplate}
      />
    </>
  );
}