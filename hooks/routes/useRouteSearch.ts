import { useQuery } from "@tanstack/react-query";
import { searchRoutes } from "@/services/routes/search-route.service";
import { SearchRoutesParams } from "@/types/route-search";

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
