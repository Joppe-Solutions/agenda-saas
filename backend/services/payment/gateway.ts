export interface PaymentRequest {
  bookingId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
}

export interface PaymentResponse {
  paymentId: string;
  qrCode: string;
  copyPasteCode: string;
  expiresAt: string;
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
