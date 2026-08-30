export enum PaymentType {
    QRIS = "qris",
    CASH = "cash",
    TRANSFER = "transfer",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
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
