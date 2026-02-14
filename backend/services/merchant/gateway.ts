export type PaymentProvider = "MERCADO_PAGO" | "STUB";

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  paymentId: string;
  qrCode: string;
  copyPasteCode: string;
  expiresAt: string;
}

interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
}

export async function createPixPayment(
  input: PaymentRequest,
  provider: PaymentProvider = "STUB",
  accessToken?: string,
): Promise<PaymentResponse> {
  if (provider === "MERCADO_PAGO" && accessToken) {
    return createMercadoPagoPayment(input, accessToken);
  }
  return createPixPaymentStub(input);
}

async function createMercadoPagoPayment(
  input: PaymentRequest,
  accessToken: string,
): Promise<PaymentResponse> {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 30);

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      transaction_amount: input.amount,
      description: `Reserva #${input.bookingId}`,
      payment_method_id: "pix",
      payer: {
        email: input.customerEmail ?? `${input.customerPhone}@placeholder.com`,
        first_name: input.customerName.split(" ")[0] ?? input.customerName,
        last_name: input.customerName.split(" ").slice(1).join(" ") ?? "",
      },
      date_of_expiration: expirationDate.toISOString(),
      external_reference: input.bookingId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mercado Pago error:", errorText);
    throw new Error(`Mercado Pago API error: ${response.status}`);
  }

  const data = (await response.json()) as MercadoPagoPaymentResponse;

  return {
    paymentId: String(data.id),
    qrCode: data.point_of_interaction?.transaction_data?.qr_code_base64 ?? "",
    copyPasteCode: data.point_of_interaction?.transaction_data?.qr_code ?? "",
    expiresAt: expirationDate.toISOString(),
  };
}

export async function verifyPaymentStatus(
  providerPaymentId: string,
  provider: PaymentProvider,
  accessToken?: string,
): Promise<"pending" | "approved" | "rejected" | "cancelled"> {
  if (provider === "MERCADO_PAGO" && accessToken) {
    return verifyMercadoPagoStatus(providerPaymentId, accessToken);
  }
  return "pending";
}

async function verifyMercadoPagoStatus(
  paymentId: string,
  accessToken: string,
): Promise<"pending" | "approved" | "rejected" | "cancelled"> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return "pending";
  }

  const data = (await response.json()) as MercadoPagoPaymentResponse;
  const status = data.status;

  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return "rejected";
    default:
      return "pending";
  }
}

export async function createPixPaymentStub(input: PaymentRequest): Promise<PaymentResponse> {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 60 * 1000);

  return {
    paymentId: `stub_${input.bookingId}`,
    qrCode: `data:image/png;base64,PIX-${input.bookingId}`,
    copyPasteCode: `00020126580014BR.GOV.BCB.PIX0136${input.bookingId}520400005303986540${input.amount.toFixed(2)}5802BR`,
    expiresAt: expires.toISOString(),
  };
}
