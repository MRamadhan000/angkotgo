import { useState, useEffect, useCallback } from "react";
import { 
  VehicleAssignment, 
  CreateVehicleAssignmentInput, 
  UpdateVehicleAssignmentInput 
} from "@/types/vehicles/vehicle-assignments.type";
import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";

export function useVehicleAssignments() {
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil semua data penugasan
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleAssignmentService.getAll();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data penugasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Fungsi untuk membuat penugasan baru
  const createAssignment = async (data: CreateVehicleAssignmentInput) => {
    try {
      const newAssignment = await vehicleAssignmentService.create(data);
      setAssignments((prev) => [newAssignment, ...prev]);
      return newAssignment;
    } catch (err: any) {
      throw new Error(err.message || "Gagal membuat penugasan baru.");
    }
  };

  const updateAssignment = async (id: number, data: UpdateVehicleAssignmentInput) => {
    try {
      const updated = await vehicleAssignmentService.update(id, data);
      setAssignments((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "Gagal memperbarui penugasan.");
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      await vehicleAssignmentService.remove(id);
      setAssignments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Gagal menghapus penugasan.");
    }
  };

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}