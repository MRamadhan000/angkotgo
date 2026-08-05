export type ConductorStatus = "ACTIVE" | "OFF_DUTY" | "SUSPENDED";

export interface VehicleAssignment {
  id: number;
  [key: string]: any;
}

export interface Conductor {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  password?: string;
  address?: string | null;
  photoUrl?: string | null;
  isVerified: boolean;
  status: ConductorStatus;
  totalTrips: number;
  assignments?: VehicleAssignment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type UpdateConductorInput = Partial<
  Omit<Conductor, "id" | "assignments" | "createdAt" | "updatedAt">
> & {
  password?: string;
};

export type CreateConductorInput = Pick<
  Conductor,
  "name" | "nik" | "email" | "phone"
> & {
  password: string;
  address?: string;
  photoUrl?: string;
  status?: ConductorStatus;
  totalTrips?: number;
};
