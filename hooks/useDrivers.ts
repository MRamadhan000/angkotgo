"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { driverService } from "@/services/driver.service";
import {
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
} from "@/types/driver.type";

export const driverKeys = {
  all: ["drivers"] as const,

  detail: (id: number | string) =>
    ["drivers", id] as const,
};

export function useDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: driverKeys.all,

    queryFn: async () => {
      const response = await driverService.getAllDrivers();

      if (Array.isArray(response)) {
        return response;
      }

      if (
        response &&
        typeof response === "object"
      ) {
        const result = response as {
          data?: unknown;
          drivers?: unknown;
        };

        if (Array.isArray(result.data)) {
          return result.data as Driver[];
        }

        if (Array.isArray(result.drivers)) {
          return result.drivers as Driver[];
        }
      }

      return [];
    },

    retry: 1,
  });
}

export function useDriverDetail(
  id: number | string | null,
) {
  return useQuery<Driver, Error>({
    queryKey:
      id !== null
        ? driverKeys.detail(id)
        : ["drivers", "detail", "empty"],

    queryFn: () => {
      if (
        id === null ||
        id === undefined ||
        id === ""
      ) {
        throw new Error(
          "ID driver tidak tersedia.",
        );
      }

      return driverService.getDriverById(id);
    },

    enabled:
      id !== null &&
      id !== undefined &&
      id !== "",

    retry: 1,
  });
}

export function useRegisterDriver() {
  const queryClient = useQueryClient();

  return useMutation<
    Driver,
    Error,
    CreateDriverInput
  >({
    mutationFn: async (
      data: CreateDriverInput,
    ) => {
      const response =
        await driverService.registerDriver(data);

      /**
       * Support:
       *
       * {
       *   data: {...}
       * }
       *
       * atau langsung:
       *
       * {...}
       */

      if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        return (response as any).data as Driver;
      }

      return response as Driver;
    },

    onSuccess: () => {
      /**
       * Refresh daftar driver.
       */
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      });
    },
  });
}

/* ============================================================
 * UPDATE DRIVER
 * ============================================================ */

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation<
    Driver,
    Error,
    {
      id: number | string;
      data: UpdateDriverInput;
    }
  >({
    mutationFn: async ({
      id,
      data,
    }) => {
      const response =
        await driverService.updateDriver(
          id,
          data,
        );

      /**
       * Support response:
       *
       * {
       *   data: {...}
       * }
       *
       * atau langsung {...}
       */

      if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        return (response as any).data as Driver;
      }

      return response as Driver;
    },

    onSuccess: (updatedDriver, variables) => {
      /**
       * Refresh list.
       */
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      });

      /**
       * Refresh detail driver.
       */
      queryClient.invalidateQueries({
        queryKey: driverKeys.detail(
          variables.id,
        ),
      });

      /**
       * Optional:
       * langsung update cache detail supaya UI
       * terasa lebih cepat.
       */
      queryClient.setQueryData(
        driverKeys.detail(variables.id),
        updatedDriver,
      );
    },
  });
}

/* ============================================================
 * DEACTIVATE DRIVER
 * ============================================================ */

export function useDeactiveDriver() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    number | string
  >({
    mutationFn: async (
      id: number | string,
    ) => {
      return driverService.deactiveDriver(id);
    },

    onSuccess: (_, id) => {
      /**
       * Refresh daftar driver.
       */
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      });

      /**
       * Hapus cache detail driver.
       */
      queryClient.removeQueries({
        queryKey: driverKeys.detail(id),
      });
    },
  });
}