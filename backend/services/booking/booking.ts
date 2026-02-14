import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createBookingSchema, updateBookingStatusSchema } from "../shared/validators";
import { createPixPayment, PaymentProvider } from "../merchant/gateway";

interface CheckAvailabilityParams {
  assetId: string;
  date: string;
}

interface CreateBookingBody {
  assetId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
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

export const checkTimeSlotAvailability = api(
  { expose: true, method: "GET", path: "/booking/availability/:assetId/:date/:startTime" },
  async ({ assetId, date, startTime }: CheckAvailabilityParams & { startTime: string }) => {
    const existing = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings
      WHERE asset_id = ${assetId}
        AND booking_date = ${date}::date
        AND start_time = ${startTime}
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

    const asset = await db.queryRow<{ base_price: number; capacity: number; pricing_type: string; duration_minutes: number | null }>`
      SELECT base_price, capacity, pricing_type, duration_minutes
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

    let conflictQuery;
    if (parsed.data.startTime && asset.pricing_type === "HOURLY") {
      conflictQuery = db.queryRow<{ total: number }>`
        SELECT COUNT(*)::int AS total
        FROM bookings
        WHERE asset_id = ${parsed.data.assetId}
          AND booking_date = ${parsed.data.bookingDate}::date
          AND start_time = ${parsed.data.startTime}
          AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
      `;
    } else {
      conflictQuery = db.queryRow<{ total: number }>`
        SELECT COUNT(*)::int AS total
        FROM bookings
        WHERE asset_id = ${parsed.data.assetId}
          AND booking_date = ${parsed.data.bookingDate}::date
          AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
      `;
    }

    const conflict = await conflictQuery;
    if ((conflict?.total ?? 0) > 0) {
      throw APIError.alreadyExists("Selected date/time is not available");
    }

    const bookingId = randomUUID();
    const depositAmount = calculateDeposit(asset.base_price);

    let endTime: string | null = null;
    if (parsed.data.startTime && asset.duration_minutes) {
      const [hours, minutes] = parsed.data.startTime.split(":").map(Number);
      const endMinutes = hours * 60 + minutes + asset.duration_minutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
    }

    await db.exec`
      INSERT INTO bookings (
        id, asset_id, merchant_id, customer_name, customer_phone, customer_email,
        booking_date, start_time, end_time, people_count, status, deposit_amount
      ) VALUES (
        ${bookingId}, ${parsed.data.assetId}, ${parsed.data.merchantId}, ${parsed.data.customerName}, ${parsed.data.customerPhone}, ${parsed.data.customerEmail ?? null},
        ${parsed.data.bookingDate}::date, ${parsed.data.startTime ?? null}, ${endTime}, ${parsed.data.peopleCount}, 'PENDING_PAYMENT', ${depositAmount}
      )
    `;

    const merchant = await db.queryRow<{
      mercado_pago_access_token: string | null;
    }>`
      SELECT mercado_pago_access_token FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    const provider: PaymentProvider = merchant?.mercado_pago_access_token ? "MERCADO_PAGO" : "STUB";

    const payment = await createPixPayment(
      {
        bookingId,
        amount: depositAmount,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
      },
      provider,
      merchant?.mercado_pago_access_token ?? undefined,
    );

    await db.exec`
      INSERT INTO payments (id, booking_id, merchant_id, amount, status, payment_method, provider, provider_payment_id, qr_code, copy_paste_code)
      VALUES (
        ${randomUUID()},
        ${bookingId},
        ${parsed.data.merchantId},
        ${depositAmount},
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
      customer_email: string | null;
      booking_date: string;
      start_time: string | null;
      end_time: string | null;
      people_count: number;
      status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
      deposit_amount: number;
      payment_id: string | null;
      qr_code: string | null;
      copy_paste_code: string | null;
      created_at: string;
    }>`
      SELECT id, asset_id, customer_name, customer_phone, customer_email, booking_date::text, start_time, end_time, people_count, status, deposit_amount, payment_id, qr_code, copy_paste_code, created_at::text
      FROM bookings
      WHERE merchant_id = ${merchantId}
      ORDER BY booking_date DESC, created_at DESC
      LIMIT 200
    `;

    return {
      bookings: rows.map((row) => ({
        id: row.id,
        assetId: row.asset_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date,
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,
        peopleCount: row.people_count,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        paymentId: row.payment_id,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        createdAt: row.created_at,
      })),
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
