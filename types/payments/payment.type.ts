export enum PaymentType {
    QRIS = "qris",
    CASH = "cash",
    TRANSFER = "transfer",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
}

export type CreatePaymentType = "CASH" | "ONLINE";

export interface CreatePaymentInput {
    vehicleAssignmentId: number;
    paymentType: CreatePaymentType;
    amount: number;
}

export interface Payment {
    id: number;
    payment_code: string;
    vehicle_assignment_id: number;
    user_id: number;
    payment_type: PaymentType;
    amount: number;
    status: PaymentStatus;

    // Minimal representation for Conductor UI (optional joins)
    user?: {
        id: number;
        name: string;
    } | null;

    paid_at: string | null;
    created_at: string;
}

export interface PaymentApiRecord {
    id?: number;
    paymentId?: number;
    payment_code?: string;
    paymentCode?: string;
    vehicle_assignment_id?: number;
    vehicleAssignmentId?: number;
    user_id?: number;
    userId?: number;
    payment_type?: string;
    paymentType?: string;
    amount?: number;
    status?: string;
    paid_at?: string | null;
    paidAt?: string | null;
    created_at?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: { id: number; name: string } | null;
}

export interface PaymentCreateResponse {
    message: string;
    data: Payment & {
        xendit?: {
            paymentRequestId?: string;
            referenceId?: string;
            status?: string;
            channelCode?: string;
            qrString?: string;
        };
    };
}

export interface PaymentFinancialResponse {
    summary: Record<string, number> | null;
    payments: Payment[];
}

export type PaymentSocketPayload = PaymentApiRecord;
