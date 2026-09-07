import type {
  CreatePaymentInput,
  Payment,
  PaymentCreateResponse,
  PaymentFinancialResponse,
  PaymentApiRecord,
} from "@/types/payments/payment.type";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function normalizePayment(payment: PaymentApiRecord): Payment {
  return {
    id: Number(payment.id ?? payment.paymentId),
    payment_code: String(payment.payment_code ?? payment.paymentCode ?? ""),
    vehicle_assignment_id: Number(
      payment.vehicle_assignment_id ?? payment.vehicleAssignmentId,
    ),
    user_id: Number(payment.user_id ?? payment.userId),
    payment_type: String(
      payment.payment_type ?? payment.paymentType ?? "CASH",
    ).toUpperCase() as Payment["payment_type"],
    amount: Number(payment.amount ?? 0),
    status: String(payment.status ?? "PENDING") as Payment["status"],
    user: payment.user
      ? { id: Number(payment.user.id), name: payment.user.name }
      : null,
    paid_at: payment.paid_at ?? payment.paidAt ?? null,
    created_at: String(payment.created_at ?? payment.createdAt ?? ""),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : "Gagal memproses pembayaran.";
    throw new Error(message);
  }

  return body as T;
}

export const paymentService = {
  async create(
    userId: number,
    input: CreatePaymentInput,
  ): Promise<PaymentCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await parseResponse<{
      message: string;
      data: PaymentApiRecord & {
        xendit?: PaymentCreateResponse["data"]["xendit"];
      };
    }>(response);

    return {
      message: body.message,
      data: {
        ...normalizePayment(body.data),
        xendit: body.data.xendit,
      },
    };
  },

  async getFinancial(assignmentId: number): Promise<PaymentFinancialResponse> {
    const response = await fetch(
      `${API_BASE_URL}/payments/financial/vehicle-assignment/${assignmentId}`,
      { headers: { "Content-Type": "application/json" } },
    );
    const body = await parseResponse<unknown>(response);
    const payload =
      body && typeof body === "object" && "data" in body
        ? body.data
        : body;
    const financialData =
      payload && typeof payload === "object" ? payload : null;
    const rawPayments = Array.isArray(body)
      ? body
      : financialData && "payments" in financialData
        ? financialData.payments
        : Array.isArray(payload)
          ? payload
          : [];
    const summary =
      financialData && "summary" in financialData && financialData.summary
        ? financialData.summary
        : null;

    return {
      summary: summary as PaymentFinancialResponse["summary"],
      payments: Array.isArray(rawPayments)
        ? rawPayments.map((payment) => normalizePayment(payment as PaymentApiRecord))
        : [],
    };
  },
};
