import { useQuery } from "@tanstack/react-query";
import {
  getUpcomingVehicles,
  searchRoutes,
} from "@/services/routes/route-route.service";
import {
  SearchRoutesParams,
  UpcomingVehiclesParams,
} from "@/types/route-search.type";

export function useRouteSearch(params: SearchRoutesParams | null) {
  return useQuery({
    queryKey: ["route-search", params],
    queryFn: () => {
      if (!params) {
        throw new Error("Parameter pencarian rute tidak tersedia");
      }

      return searchRoutes(params);
    },
    enabled: !!params,
  });
}

export function useUpcomingVehicles(
  params: UpcomingVehiclesParams | null,
) {
  return useQuery({
    queryKey: ["upcoming-vehicles", params],
    queryFn: () => {
      if (!params) {
        throw new Error("Parameter upcoming vehicles tidak tersedia");
      }

      return getUpcomingVehicles(params);
    },
    enabled: false,
  });
}