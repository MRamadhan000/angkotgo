import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
  UserResponse,
  UsersResponse,
  DeleteUserResponse,
  UpdateStatusUserRequest,
} from "@/types/user.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  async register(data: CreateUserRequest): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal membuat user");
    }

    return result;
  },

  async login(data: LoginUserRequest): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login gagal");
    }

    return result;
  },

  async findAll(): Promise<UsersResponse> {
    const response = await fetch(`${API_URL}/users`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data user");
    }

    return result;
  },

  async findOne(id: number): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/${id}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "User tidak ditemukan");
    }

    return result;
  },

  async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memperbarui user");
    }

    return result;
  },

  async updateStatus(
    id: number,
    data: UpdateStatusUserRequest,
  ): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memperbarui status user");
    }

    return result;
  },

  async activate(id: number): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/${id}/activate`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengaktifkan user");
    }

    return result;
  },

  async deactivate(id: number): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/users/${id}/deactivate`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menonaktifkan user");
    }

    return result;
  },

  async remove(id: number): Promise<DeleteUserResponse> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menghapus user");
    }

    return result;
  },

  async restore(id: number): Promise<DeleteUserResponse> {
    const response = await fetch(`${API_URL}/users/${id}/restore`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memulihkan user");
    }

    return result;
  },

  async findDeleted(): Promise<UsersResponse> {
    const response = await fetch(`${API_URL}/users/deleted`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil user yang dihapus");
    }

    return result;
  },
};
