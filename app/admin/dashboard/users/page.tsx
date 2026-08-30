"use client";

import { useState } from "react";
import {
  FiRefreshCw,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiUserX,
  FiMail,
} from "react-icons/fi";

import { useToast } from "@/context/ToastContext";
import {
  useUsers,
  useUpdateUser,
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
} from "@/hooks/useUsers";

import { User, UserStatus, UpdateUserRequest } from "@/types/user.type";

import { EditUserModal } from "@/components/user/EditUserModal";

const TABLE_HEADERS = [
  "User",
  "Email",
  "No. Telepon",
  "Status",
  "Waktu",
  "Aksi",
];

const STATUS_FILTERS: {
  label: string;
  value: UserStatus | "ALL";
}[] = [
  { label: "Semua", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Deactive", value: "DEACTIVE" },
];

export default function UsersDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useUsers();

  const updateUser = useUpdateUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const deleteUser = useDeleteUser();

  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<UserStatus | "ALL">("ALL");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users: User[] = data?.data ?? [];

  const filteredUsers = users.filter(
    (user) => activeTab === "ALL" || user.status === activeTab,
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleSaveEdit = async (updatedData: UpdateUserRequest) => {
    if (!selectedUser) return;

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: updatedData,
      });

      setSelectedUser(null);
      success("User berhasil diperbarui.");
    } catch (err) {
      showError(
        `Gagal mengupdate user, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateUser.mutateAsync(id);
      success("User berhasil diaktifkan.");
    } catch (err) {
      showError(
        `Gagal mengaktifkan user, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateUser.mutateAsync(id);
      success("User berhasil dinonaktifkan.");
    } catch (err) {
      showError(
        `Gagal menonaktifkan user, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return;
    }

    try {
      await deleteUser.mutateAsync(id);
      success("User berhasil dihapus.");
    } catch (err) {
      showError(
        `Gagal menghapus user, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const getStatusClass = (status: UserStatus) => {
    const classes = {
      ACTIVE: "bg-blue-50 text-blue-700",
      PENDING: "bg-amber-50 text-amber-700",
      DEACTIVE: "bg-rose-50 text-rose-700",
    };

    return classes[status] ?? "bg-gray-50 text-gray-700";
  };

  const getStatusIcon = (status: UserStatus) => {
    const icons = {
      ACTIVE: <FiCheckCircle className="w-3 h-3" />,
      PENDING: <FiClock className="w-3 h-3" />,
      DEACTIVE: <FiUserX className="w-3 h-3" />,
    };

    return icons[status] ?? <FiUser className="w-3 h-3" />;
  };

  const statusCount = (status: UserStatus) =>
    users.filter((user) => user.status === status).length;

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>

          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh pengguna sistem AngkotGo.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />

          {isFetching ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>
            Gagal memuat data:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan."}
          </span>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total User",
            value: users.length,
            color: "text-gray-900",
          },
          {
            label: "Active",
            value: statusCount("ACTIVE"),
            color: "text-blue-600",
          },
          {
            label: "Pending",
            value: statusCount("PENDING"),
            color: "text-amber-600",
          },
          {
            label: "Deactive",
            value: statusCount("DEACTIVE"),
            color: "text-rose-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase">
              {stat.label}
            </p>

            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {STATUS_FILTERS.map((tab) => {
          const count =
            tab.value === "ALL" ? users.length : statusCount(tab.value);

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab.value
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {TABLE_HEADERS.map((header) => (
                  <th key={header} className="py-4 px-6 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {/* LOADING */}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memuat data user...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data user untuk kategori ini.
                  </td>
                </tr>
              )}

              {/* DATA */}
              {!isLoading &&
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    {/* USER */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />

                        <span className="text-xs whitespace-nowrap">
                          {user.email || "-"}
                        </span>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" />

                        <span className="text-xs font-mono whitespace-nowrap">
                          {user.phone || "-"}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${getStatusClass(
                          user.status,
                        )}`}
                      >
                        {getStatusIcon(user.status)}
                        {user.status}
                      </span>
                    </td>

                    {/* WAKTU */}
                    <td className="py-4 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />

                        <span>
                          Dibuat:{" "}
                          {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      <div className="text-gray-400 mt-0.5">
                        Diubah:{" "}
                        {new Date(user.updated_at).toLocaleDateString("id-ID")}
                      </div>
                    </td>

                    {/* AKSI */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* EDIT */}
                        <button
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                          disabled={updateUser.isPending}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>

                        {/* ACTIVATE */}
                        {user.status !== "ACTIVE" && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            title="Aktifkan User"
                            disabled={activateUser.isPending}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* DEACTIVATE */}
                        {user.status === "ACTIVE" && (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            title="Nonaktifkan User"
                            disabled={deactivateUser.isPending}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FiUserX className="w-4 h-4" />
                          </button>
                        )}

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Hapus User"
                          disabled={deleteUser.isPending}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditUserModal
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
