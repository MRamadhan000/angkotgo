export type DriverStatus = "ACTIVE" | "OFF_DUTY" | "SUSPENDED";

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface VehicleAssignment {
  id: number;
  [key: string]: any;
}

export interface Driver {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string | Date;
  address?: string | null;
  photoUrl?: string | null;
  isVerified: boolean;
  status: DriverStatus;
  averageRating: number;
  totalTrips: number;
  bankAccountInfo?: BankAccountInfo | null;
  assignments?: VehicleAssignment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UpdateDriverInput {
  name?: string;
  nik?: string;
  email?: string;
  phone?: string;
  password?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  address?: string | null;
  photoUrl?: string | null;
  isVerified?: boolean;
  status?: DriverStatus;
  bankAccountInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  } | null;
}

export interface CreateDriverInput {
  name: string;
  nik: string;
  email: string;
  phone: string;
  password: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address?: string;
}
