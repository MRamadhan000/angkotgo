import { UpcomingVehiclesResponse } from "@/types/route-search.type";

export const dummyUpcomingVehicles: UpcomingVehiclesResponse = {
  routeLengthMeters: 3883.63453685515,
  userFraction: 0.391507358027097,
  userOffsetFromRouteMeters: 23.6306820688109,

  vehicles: [
    {
      assignmentId: 71,
      vehicleId: 1,
      driverId: 9,
      conductorId: 7,

      status: "ONGOING",

      hasLocationData: true,
      lastLocationAt: "2026-08-27T11:00:24.055Z",
      lastLocationAgeSeconds: 101548,

      vehicleLat: -7.9263577,
      vehicleLng: 112.6016423,

      hasPassedUser: false,
      distanceToUserMeters: 1520.4714970669484,
      vehicleFraction: 0,
    },

    {
      assignmentId: 85,
      vehicleId: 3,
      driverId: 12,
      conductorId: 9,

      status: "ONGOING",

      hasLocationData: true,
      lastLocationAt: "2026-08-27T11:00:39.568Z",
      lastLocationAgeSeconds: 101532,

      vehicleLat: -7.9263577,
      vehicleLng: 112.6016423,

      hasPassedUser: false,
      distanceToUserMeters: 1520.4714970669484,
      vehicleFraction: 0,
    },

    {
      assignmentId: 99,
      vehicleId: 7,
      driverId: 14,
      conductorId: 11,

      status: "ONGOING",

      hasLocationData: true,
      lastLocationAt: "2026-08-27T11:00:55.098Z",
      lastLocationAgeSeconds: 101517,

      vehicleLat: -7.9263577,
      vehicleLng: 112.6016423,

      hasPassedUser: false,
      distanceToUserMeters: 1520.4714970669484,
      vehicleFraction: 0,
    },
  ],
};