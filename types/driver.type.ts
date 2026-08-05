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

export type UpdateDriverInput = Partial<
  Omit<
    Driver,
    | "id"
    | "averageRating"
    | "totalTrips"
    | "assignments"
    | "createdAt"
    | "updatedAt"
  >
> & {
  password?: string;
};

export type CreateDriverInput = Pick<
  Driver,
  "name" | "nik" | "email" | "phone" | "licenseNumber" | "licenseExpiryDate"
> & {
  password: string;
  address?: string;
};
