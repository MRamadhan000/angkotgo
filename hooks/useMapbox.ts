import { useMutation } from "@tanstack/react-query";
import {
  retrievePlace,
  reverseGeocode,
  suggestPlaces,
} from "@/services/mapbox.service";

export function useMapbox() {
  const suggest = useMutation({
    mutationFn: ({
      query,
      sessionToken,
      proximity,
    }: {
      query: string;
      sessionToken: string;
      proximity?: string;
    }) => suggestPlaces(query, sessionToken, proximity),
  });

  const retrieve = useMutation({
    mutationFn: ({
      mapboxId,
      sessionToken,
    }: {
      mapboxId: string;
      sessionToken: string;
    }) => retrievePlace(mapboxId, sessionToken),
  });

  const reverse = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      reverseGeocode(lat, lng),
  });

  return {
    suggest,
    retrieve,
    reverse,
  };
}
