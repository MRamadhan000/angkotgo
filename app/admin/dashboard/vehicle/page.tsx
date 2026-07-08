"use client";

import { useState, useEffect } from "react";

interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  status: string;
}

export default function VehicleDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleCode: "",
    capacity: 0,
    status: "ACTIVE", 
  });

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:3000/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data kendaraan:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity) 
        }), 
      });

      if (response.ok) {
        alert("Kendaraan berhasil ditambahkan!");
        setIsModalOpen(false);
        setFormData({ plateNumber: "", vehicleCode: "", capacity: 0, status: "ACTIVE" }); 
        fetchVehicles(); 
      } else {
        const errorData = await response.json();
        alert(`Gagal: ${errorData.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Gagal submit:", error);
      alert("Gagal terhubung ke server (Abaikan jika sedang Blind Integration).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Kendaraan</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Kendaraan
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Plat Nomor</th>
              <th className="p-3">Kode Kendaraan</th>
              <th className="p-3">Kapasitas</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{vehicle.plateNumber}</td>
                  <td className="p-3">{vehicle.vehicleCode}</td>
                  <td className="p-3">{vehicle.capacity} Penumpang</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${vehicle.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  Data belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Tambah Kendaraan Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Plat Nomor</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  className="w-full border p-2 rounded"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kode Kendaraan</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  className="w-full border p-2 rounded"
                  value={formData.vehicleCode}
                  onChange={(e) => setFormData({ ...formData, vehicleCode: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kapasitas</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full border p-2 rounded"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
