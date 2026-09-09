import type {
  CreatePaymentInput,
  Payment,
  PaymentCreateResponse,
  PaymentFinancialResponse,
  PaymentApiRecord,
  PaymentWebhookResponse,
  UpdatePaymentStatusInput,
  PaymentHistoryResponse,
  PaymentHistoryItem,
} from "@/types/payments/payment.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function normalizePayment(payment: PaymentApiRecord): Payment {
  const userId = Number(payment.user_id ?? payment.userId ?? payment.user?.id);
  const userName =
    payment.user?.name ??
    payment.user?.full_name ??
    payment.user?.fullName ??
    payment.user?.username ??
    payment.user_name ??
    payment.userName ??
    payment.username ??
    payment.name;

  return {
    id: Number(payment.id ?? payment.paymentId),
    payment_code: String(payment.payment_code ?? payment.paymentCode ?? ""),
    vehicle_assignment_id: Number(
      payment.vehicle_assignment_id ?? payment.vehicleAssignmentId,
    ),
    user_id: userId,
    payment_type: String(
      payment.payment_type ?? payment.paymentType ?? "CASH",
    ).toUpperCase() as Payment["payment_type"],
    amount: Number(payment.amount ?? 0),
    status: String(payment.status ?? "PENDING") as Payment["status"],
    user: userName ? { id: userId, name: userName } : null,
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
      body && typeof body === "object" && "data" in body ? body.data : body;
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
        ? rawPayments.map((payment) =>
            normalizePayment(payment as PaymentApiRecord),
          )
        : [],
    };
  },

  async markAsSucceeded(
    input: UpdatePaymentStatusInput,
  ): Promise<PaymentWebhookResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/webhook/xendit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseResponse<PaymentWebhookResponse>(response);
  },

  async getHistoryByUserId(
    userId: number | string,
  ): Promise<PaymentHistoryItem[]> {
    const response = await fetch(
      `http://localhost:3000/payments/user/${userId}`,
    );
    const result: PaymentHistoryResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "History pembayaran tidak ditemukan");
    }

    // Mengembalikan array of PaymentHistoryItem
    return result.data;
  },

  async updatePaymentStatusToSucceeded(xenditPaymentRequestId: string) {
    const response = await fetch(
      "http://localhost:3000/payments/webhook/xendit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_request_id: xenditPaymentRequestId,
          status: "SUCCEEDED",
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate status pembayaran");
    }
  },
};
