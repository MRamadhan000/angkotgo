import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";

export interface FilterAssignmentsParams {
  assignments: VehicleAssignment[];
  selectedDate: string;
  todayString: string;
  statusFilter: string;
  searchQuery: string;
  sortField: string;
  sortDirection: "asc" | "desc";
}

export function filterAndSortAssignments({
  assignments,
  selectedDate,
  todayString,
  statusFilter,
  searchQuery,
  sortField,
  sortDirection,
}: FilterAssignmentsParams) {
  let list = [...assignments];

  // Filter tanggal
  list = list.filter((item) => {
    const itemDate = item.assignmentDate || todayString;
    return itemDate === selectedDate;
  });

  // Filter status
  if (statusFilter !== "ALL") {
    list = list.filter((item) => item.status === statusFilter);
  }

  // Search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();

    list = list.filter((item) => {
      const vehicle =
        item.vehicle?.vehicleCode ||
        item.vehicle?.plateNumber ||
        "";

      const driver = item.driver?.name || "";

      const route =
        item.route?.routeName ||
        item.route?.routeCode ||
        "";

      const direction = item.direction || "";

      return [vehicle, driver, route, direction].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }

  // Sorting
  list.sort((a, b) => {
    let valA = "";
    let valB = "";

    switch (sortField) {
      case "time":
        valA = a.startTime || "00:00";
        valB = b.startTime || "00:00";
        break;

      case "vehicle":
        valA = a.vehicle?.vehicleCode || a.vehicle?.plateNumber || "";
        valB = b.vehicle?.vehicleCode || b.vehicle?.plateNumber || "";
        break;

      case "driver":
        valA = a.driver?.name || "";
        valB = b.driver?.name || "";
        break;

      case "direction":
        valA = a.direction || "";
        valB = b.direction || "";
        break;

      case "status":
        valA = a.status || "";
        valB = b.status || "";
        break;

      default:
        return 0;
    }

    return sortDirection === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  return list;
}