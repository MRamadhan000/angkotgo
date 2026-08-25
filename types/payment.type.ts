// types/payment.ts (Atau bisa disatukan dengan definisi tipe Anda)
export enum PaymentType {
  CASH = "CASH",
  ONLINE = "ONLINE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface MidtransDetail {
  orderId: string | null;
  transactionId: string | null;
  paymentType: string | null;
  transactionStatus: string | null;
  transactionTime: string | null;
  settlementTime: string | null;
}

export interface PaymentItem {
  id: number;
  paymentCode: string;
  userId: number;
  user: {
    id: number;
    name?: string;
    email?: string;
  };
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  midtrans: MidtransDetail;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalTransactions: number;
  totalPaidTransactions: number;
  totalPendingTransactions: number;
  totalFailedTransactions: number;
  totalCancelledTransactions: number;
  totalPaid: number;
  totalPending: number;
  totalCash: number;
  totalOnline: number;
}

export interface VehicleAssignmentFinancialResponse {
  vehicleAssignmentId: number;
  summary: FinancialSummary;
  payments: PaymentItem[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
