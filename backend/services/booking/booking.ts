import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createBookingSchema, updateBookingStatusSchema } from "../shared/validators";
import { createPixPaymentStub } from "../payment/gateway";

interface CheckAvailabilityParams {
  assetId: string;
  date: string;
}

interface CreateBookingBody {
  assetId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  peopleCount: number;
}

interface MerchantBookingsParams {
  merchantId: string;
}

interface UpdateBookingStatusParams {
  merchantId: string;
  bookingId: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
}

function calculateDeposit(basePrice: number): number {
  return Number((basePrice * 0.3).toFixed(2));
}

export const checkAvailability = api(
  { expose: true, method: "GET", path: "/booking/availability/:assetId/:date" },
  async ({ assetId, date }: CheckAvailabilityParams) => {
    const existing = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings
      WHERE asset_id = ${assetId}
        AND booking_date = ${date}::date
        AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
    `;

    return {
      available: (existing?.total ?? 0) === 0,
    };
  },
);

export const createBooking = api(
  { expose: true, method: "POST", path: "/booking" },
  async (body: CreateBookingBody) => {
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const asset = await db.queryRow<{ base_price: number; capacity: number }>`
      SELECT base_price, capacity
      FROM assets
      WHERE id = ${parsed.data.assetId}
        AND merchant_id = ${parsed.data.merchantId}
        AND active = TRUE
    `;

    if (!asset) {
      throw APIError.notFound("Asset not found");
    }

    if (parsed.data.peopleCount > asset.capacity) {
      throw APIError.invalidArgument("People count exceeds asset capacity");
    }

    const conflict = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings
      WHERE asset_id = ${parsed.data.assetId}
        AND booking_date = ${parsed.data.bookingDate}::date
        AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
    `;

    if ((conflict?.total ?? 0) > 0) {
      throw APIError.alreadyExists("Selected date is not available");
    }

    const bookingId = randomUUID();
    const depositAmount = calculateDeposit(asset.base_price);

    await db.exec`
      INSERT INTO bookings (
        id, asset_id, merchant_id, customer_name, customer_phone,
        booking_date, people_count, status, deposit_amount
      ) VALUES (
        ${bookingId}, ${parsed.data.assetId}, ${parsed.data.merchantId}, ${parsed.data.customerName}, ${parsed.data.customerPhone},
        ${parsed.data.bookingDate}::date, ${parsed.data.peopleCount}, 'PENDING_PAYMENT', ${depositAmount}
      )
    `;

    const payment = await createPixPaymentStub({
      bookingId,
      amount: depositAmount,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
    });

    await db.exec`
      UPDATE bookings
      SET payment_id = ${payment.paymentId}, updated_at = now()
      WHERE id = ${bookingId}
    `;

    return {
      bookingId,
      status: "PENDING_PAYMENT" as const,
      depositAmount,
      payment,
    };
  },
);

export const listMerchantBookings = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/bookings" },
  async ({ merchantId }: MerchantBookingsParams) => {
    const rows = await db.queryAll<{
      id: string;
      asset_id: string;
      customer_name: string;
      customer_phone: string;
      booking_date: string;
      people_count: number;
      status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
      deposit_amount: number;
      payment_id: string | null;
    }>`
      SELECT id, asset_id, customer_name, customer_phone, booking_date::text, people_count, status, deposit_amount, payment_id
      FROM bookings
      WHERE merchant_id = ${merchantId}
      ORDER BY booking_date DESC, created_at DESC
      LIMIT 200
    `;

    return {
      bookings: rows,
    };
  },
);

export const updateBookingStatus = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/bookings/:bookingId/status" },
  async ({ merchantId, bookingId, status }: UpdateBookingStatusParams) => {
    const parsed = updateBookingStatusSchema.safeParse({ status });
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const row = await db.queryRow<{ id: string }>`
      SELECT id
      FROM bookings
      WHERE id = ${bookingId}
        AND merchant_id = ${merchantId}
    `;

    if (!row) {
      throw APIError.notFound("Booking not found");
    }

    await db.exec`
      UPDATE bookings
      SET status = ${parsed.data.status}, updated_at = now()
      WHERE id = ${bookingId}
    `;

    return { ok: true };
  },
);
