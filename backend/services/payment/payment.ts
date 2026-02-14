import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createPixPayment, verifyPaymentStatus, PaymentProvider } from "./gateway";
import type { Payment } from "../shared/types";

interface CreatePaymentBody {
  bookingId: string;
}

interface PaymentWebhookBody {
  type?: string;
  data?: {
    id: string;
  };
  action?: string;
}

interface MercadoPagoWebhookData {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

interface ListPaymentsParams {
  merchantId: string;
}

export const createPayment = api(
  { expose: true, method: "POST", path: "/payment" },
  async (body: CreatePaymentBody) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      deposit_amount: number;
      asset_id: string;
      booking_date: Date;
      start_time: string | null;
    }>`
      SELECT id, merchant_id, customer_name, customer_phone, customer_email, deposit_amount, asset_id, booking_date, start_time
      FROM bookings
      WHERE id = ${body.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const merchant = await db.queryRow<{
      mercado_pago_access_token: string | null;
    }>`
      SELECT mercado_pago_access_token FROM merchants WHERE id = ${booking.merchant_id}
    `;

    const provider: PaymentProvider = merchant?.mercado_pago_access_token ? "MERCADO_PAGO" : "STUB";
    const accessToken = merchant?.mercado_pago_access_token ?? undefined;

    const payment = await createPixPayment(
      {
        bookingId: booking.id,
        amount: booking.deposit_amount,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email ?? undefined,
        customerPhone: booking.customer_phone,
      },
      provider,
      accessToken,
    );

    const paymentId = randomUUID();

    await db.exec`
      INSERT INTO payments (id, booking_id, merchant_id, amount, status, payment_method, provider, provider_payment_id, qr_code, copy_paste_code)
      VALUES (
        ${paymentId},
        ${booking.id},
        ${booking.merchant_id},
        ${booking.deposit_amount},
        'pending',
        'PIX',
        ${provider},
        ${payment.paymentId},
        ${payment.qrCode},
        ${payment.copyPasteCode}
      )
    `;

    await db.exec`
      UPDATE bookings
      SET payment_id = ${payment.paymentId}, qr_code = ${payment.qrCode}, copy_paste_code = ${payment.copyPasteCode}, updated_at = now()
      WHERE id = ${booking.id}
    `;

    return payment;
  },
);

export const paymentWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/payment" },
  async (body: MercadoPagoWebhookData) => {
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;

      const payment = await db.queryRow<{
        id: string;
        booking_id: string;
        merchant_id: string;
        provider: string;
        provider_payment_id: string;
      }>`
        SELECT id, booking_id, merchant_id, provider, provider_payment_id
        FROM payments
        WHERE provider_payment_id = ${paymentId}
      `;

      if (payment) {
        const merchant = await db.queryRow<{
          mercado_pago_access_token: string | null;
        }>`
          SELECT mercado_pago_access_token FROM merchants WHERE id = ${payment.merchant_id}
        `;

        const status = await verifyPaymentStatus(
          paymentId,
          payment.provider as PaymentProvider,
          merchant?.mercado_pago_access_token ?? undefined,
        );

        if (status === "approved") {
          await db.exec`
            UPDATE payments
            SET status = 'approved', paid_at = now()
            WHERE id = ${payment.id}
          `;

          await db.exec`
            UPDATE bookings
            SET status = 'CONFIRMED', updated_at = now()
            WHERE id = ${payment.booking_id}
          `;
        } else if (status === "rejected" || status === "cancelled") {
          await db.exec`
            UPDATE payments
            SET status = 'rejected'
            WHERE id = ${payment.id}
          `;

          await db.exec`
            UPDATE bookings
            SET status = 'CANCELLED', updated_at = now()
            WHERE id = ${payment.booking_id}
          `;
        }
      }
    }

    return { ok: true };
  },
);

export const listMerchantPayments = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/payments" },
  async ({ merchantId }: ListPaymentsParams): Promise<{ payments: Payment[] }> => {
    const rows = await db.queryAll<{
      id: string;
      booking_id: string;
      merchant_id: string;
      amount: number;
      status: string;
      payment_method: string;
      provider: string;
      provider_payment_id: string;
      qr_code: string | null;
      copy_paste_code: string | null;
      paid_at: string | null;
      created_at: string;
    }>`
      SELECT id, booking_id, merchant_id, amount, status, payment_method, provider, provider_payment_id, qr_code, copy_paste_code, paid_at, created_at
      FROM payments
      WHERE merchant_id = ${merchantId}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return {
      payments: rows.map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        merchantId: row.merchant_id,
        amount: Number(row.amount),
        status: row.status as Payment["status"],
        paymentMethod: row.payment_method as Payment["paymentMethod"],
        provider: row.provider as Payment["provider"],
        providerPaymentId: row.provider_payment_id,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        paidAt: row.paid_at ?? undefined,
        createdAt: row.created_at,
      })),
    };
  },
);

export const checkPaymentStatus = api(
  { expose: true, method: "GET", path: "/payment/:paymentId/status" },
  async ({ paymentId }: { paymentId: string }) => {
    const payment = await db.queryRow<{
      id: string;
      booking_id: string;
      merchant_id: string;
      provider: string;
      provider_payment_id: string;
      status: string;
    }>`
      SELECT id, booking_id, merchant_id, provider, provider_payment_id, status
      FROM payments
      WHERE id = ${paymentId}
    `;

    if (!payment) {
      throw APIError.notFound("Payment not found");
    }

    return {
      status: payment.status,
      bookingId: payment.booking_id,
    };
  },
);
