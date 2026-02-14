import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createPixPaymentStub } from "./gateway";

interface CreatePaymentBody {
  bookingId: string;
}

interface PaymentWebhookBody {
  paymentId: string;
  status: "approved" | "rejected" | "pending";
  bookingId: string;
}

export const createPayment = api(
  { expose: true, method: "POST", path: "/payment" },
  async (body: CreatePaymentBody) => {
    const booking = await db.queryRow<{
      id: string;
      customer_name: string;
      customer_phone: string;
      deposit_amount: number;
    }>`
      SELECT id, customer_name, customer_phone, deposit_amount
      FROM bookings
      WHERE id = ${body.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const payment = await createPixPaymentStub({
      bookingId: booking.id,
      amount: booking.deposit_amount,
      customerName: booking.customer_name,
      customerPhone: booking.customer_phone,
    });

    await db.exec`
      UPDATE bookings
      SET payment_id = ${payment.paymentId}, updated_at = now()
      WHERE id = ${booking.id}
    `;

    return payment;
  },
);

export const paymentWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/payment" },
  async (body: PaymentWebhookBody) => {
    if (!body.paymentId || !body.bookingId) {
      throw APIError.invalidArgument("Missing bookingId/paymentId");
    }

    const nextStatus = body.status === "approved" ? "CONFIRMED" : body.status === "rejected" ? "CANCELLED" : "PENDING_PAYMENT";

    await db.exec`
      UPDATE bookings
      SET status = ${nextStatus}, updated_at = now()
      WHERE id = ${body.bookingId}
    `;

    return { ok: true };
  },
);
