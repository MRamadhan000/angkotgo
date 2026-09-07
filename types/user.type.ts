// --- ENUMS & TYPES ---
export type UserStatus = 'ACTIVE' | 'PENDING' | 'DEACTIVE';

// --- INTERFACES & MODELS ---
export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  status: UserStatus;
  createdAt: string;
  updated_at: string;
  deletedAt?: string | null;
  token?: string;
}

// --- REQUEST TYPES ---
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Alias untuk kecocokan penamaan fitur
export type CreateUserDto = CreateUserRequest;
export type RegisterUserRequest = CreateUserRequest;

export interface UpdateUserRequest {
  password?: string;
  name?: string;
  phone?: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface UpdateStatusUserRequest {
  status: UserStatus;
}

// --- RESPONSE TYPES ---
export interface UserResponse {
  message: string;
  data: User;
}

export interface UsersResponse {
  message: string;
  data: User[];
}

export interface DeleteUserResponse {
  message: string;
}

export interface RestoreUserResponse {
  message: string;
}