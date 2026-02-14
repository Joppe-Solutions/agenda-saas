import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createBookingSchema, updateBookingStatusSchema } from "../shared/validators";
import { createPixPayment, PaymentProvider } from "../merchant/gateway";
import type { Booking } from "../shared/types";

interface CheckAvailabilityParams {
  resourceId: string;
  date: string;
}

interface CreateBookingBody {
  resourceId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  peopleCount: number;
  notes?: string;
}

interface MerchantBookingsParams {
  merchantId: string;
  status?: Booking["status"];
  fromDate?: string;
  toDate?: string;
}

interface UpdateBookingStatusParams {
  merchantId: string;
  bookingId: string;
}

interface UpdateBookingStatusBody {
  status: Booking["status"];
  internalNotes?: string;
}

interface GetBookingParams {
  bookingId: string;
}

async function checkTimeConflict(
  resourceId: string,
  bookingDate: string,
  startTime: string | undefined,
  endTime: string | undefined,
  excludeBookingId?: string
): Promise<boolean> {
  if (!startTime || !endTime) {
    const fullDayConflict = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings
      WHERE resource_id = ${resourceId}
        AND booking_date = ${bookingDate}::date
        AND status NOT IN ('cancelled', 'no_show')
        AND id != ${excludeBookingId ?? null}
    `;
    return (fullDayConflict?.total ?? 0) > 0;
  }

  const slotConflict = await db.queryRow<{ total: number }>`
    SELECT COUNT(*)::int AS total
    FROM bookings
    WHERE resource_id = ${resourceId}
      AND booking_date = ${bookingDate}::date
      AND status NOT IN ('cancelled', 'no_show')
      AND id != ${excludeBookingId ?? null}
      AND start_time < ${endTime}
      AND end_time > ${startTime}
  `;

  return (slotConflict?.total ?? 0) > 0;
}

async function checkBlockConflict(
  resourceId: string,
  bookingDate: string,
  startTime: string | undefined,
  endTime: string | undefined
): Promise<boolean> {
  if (!startTime || !endTime) {
    const fullDayBlock = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM blocks
      WHERE resource_id = ${resourceId}
        AND start_time <= ${bookingDate}::date + INTERVAL '1 day'
        AND end_time >= ${bookingDate}::date
    `;
    return (fullDayBlock?.total ?? 0) > 0;
  }

  const slotBlock = await db.queryRow<{ total: number }>`
    SELECT COUNT(*)::int AS total
    FROM blocks
    WHERE resource_id = ${resourceId}
      AND start_time < (${bookingDate}::date || ' ' || ${endTime} || ':00')::timestamptz
      AND end_time > (${bookingDate}::date || ' ' || ${startTime} || ':00')::timestamptz
  `;

  return (slotBlock?.total ?? 0) > 0;
}

export const checkAvailability = api(
  { expose: true, method: "GET", path: "/booking/availability/:resourceId/:date" },
  async ({ resourceId, date }: CheckAvailabilityParams) => {
    const resource = await db.queryRow<{ id: string }>`
      SELECT id FROM resources WHERE id = ${resourceId} AND active = TRUE
    `;

    if (!resource) {
      throw APIError.notFound("Resource not found or inactive");
    }

    const hasConflict = await checkTimeConflict(resourceId, date, undefined, undefined);
    const hasBlock = await checkBlockConflict(resourceId, date, undefined, undefined);

    return {
      available: !hasConflict && !hasBlock,
    };
  },
);

export const checkTimeSlotAvailability = api(
  { expose: true, method: "GET", path: "/booking/availability/:resourceId/:date/:startTime/:endTime" },
  async ({ resourceId, date, startTime, endTime }: CheckAvailabilityParams & { startTime: string; endTime: string }) => {
    const resource = await db.queryRow<{ id: string }>`
      SELECT id FROM resources WHERE id = ${resourceId} AND active = TRUE
    `;

    if (!resource) {
      throw APIError.notFound("Resource not found or inactive");
    }

    const hasConflict = await checkTimeConflict(resourceId, date, startTime, endTime);
    const hasBlock = await checkBlockConflict(resourceId, date, startTime, endTime);

    return {
      available: !hasConflict && !hasBlock,
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

    const resource = await db.queryRow<{
      base_price: number;
      capacity: number;
      pricing_type: string;
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
    }>`
      SELECT base_price, capacity, pricing_type, duration_minutes, buffer_before_minutes, buffer_after_minutes
      FROM resources
      WHERE id = ${parsed.data.resourceId}
        AND merchant_id = ${parsed.data.merchantId}
        AND active = TRUE
    `;

    if (!resource) {
      throw APIError.notFound("Resource not found");
    }

    if (parsed.data.peopleCount > resource.capacity) {
      throw APIError.invalidArgument(`Capacidade máxima: ${resource.capacity} pessoas`);
    }

    const merchant = await db.queryRow<{
      signal_percentage: number;
      signal_deadline_minutes: number;
      signal_auto_cancel: boolean;
      mercado_pago_access_token: string | null;
    }>`
      SELECT signal_percentage, signal_deadline_minutes, signal_auto_cancel, mercado_pago_access_token
      FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    let startTime = parsed.data.startTime;
    let endTime = parsed.data.endTime;

    if (!startTime && !endTime) {
      if (resource.pricing_type === "HOURLY" || resource.pricing_type === "SLOT") {
        throw APIError.invalidArgument("Horário inicial é obrigatório para este tipo de recurso");
      }
    }

    if (startTime && !endTime) {
      if (resource.duration_minutes) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const endMinutes = hours * 60 + minutes + resource.duration_minutes;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
      } else {
        throw APIError.invalidArgument("Horário final é obrigatório quando duração não está definida");
      }
    }

    const hasConflict = await checkTimeConflict(parsed.data.resourceId, parsed.data.bookingDate, startTime, endTime);
    if (hasConflict) {
      throw APIError.alreadyExists("Horário já reservado");
    }

    const hasBlock = await checkBlockConflict(parsed.data.resourceId, parsed.data.bookingDate, startTime, endTime);
    if (hasBlock) {
      throw APIError.alreadyExists("Horário bloqueado");
    }

    const minAdvanceMinutes = 30;
    const now = new Date();
    const bookingDateTime = new Date(`${parsed.data.bookingDate}T${startTime || "00:00"}:00`);
    if (bookingDateTime.getTime() - now.getTime() < minAdvanceMinutes * 60 * 1000) {
      throw APIError.invalidArgument(`Mínimo ${minAdvanceMinutes} minutos de antecedência`);
    }

    const bookingId = randomUUID();
    const totalAmount = Number(resource.base_price);
    const depositAmount = Number((totalAmount * merchant.signal_percentage / 100).toFixed(2));

    const signalExpiresAt = new Date(now.getTime() + merchant.signal_deadline_minutes * 60 * 1000);

    let customerId: string | null = null;
    const existingCustomer = await db.queryRow<{ id: string }>`
      SELECT id FROM customers 
      WHERE merchant_id = ${parsed.data.merchantId} AND phone = ${parsed.data.customerPhone}
    `;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      customerId = randomUUID();
      await db.exec`
        INSERT INTO customers (id, merchant_id, name, phone, email)
        VALUES (${customerId}, ${parsed.data.merchantId}, ${parsed.data.customerName}, ${parsed.data.customerPhone}, ${parsed.data.customerEmail ?? null})
      `;
    }

    await db.exec`
      INSERT INTO bookings (
        id, resource_id, merchant_id, customer_id, customer_name, customer_phone, customer_email,
        booking_date, start_time, end_time, people_count, status, deposit_amount, total_amount,
        notes, signal_expires_at
      ) VALUES (
        ${bookingId}, ${parsed.data.resourceId}, ${parsed.data.merchantId}, ${customerId}, 
        ${parsed.data.customerName}, ${parsed.data.customerPhone}, ${parsed.data.customerEmail ?? null},
        ${parsed.data.bookingDate}::date, ${startTime ?? null}, ${endTime ?? null}, 
        ${parsed.data.peopleCount}, 'pending_payment', ${depositAmount}, ${totalAmount},
        ${parsed.data.notes ?? null}, ${signalExpiresAt.toISOString()}
      )
    `;

    const provider: PaymentProvider = merchant.mercado_pago_access_token ? "MERCADO_PAGO" : "STUB";

    const payment = await createPixPayment(
      {
        bookingId,
        amount: depositAmount,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
      },
      provider,
      merchant.mercado_pago_access_token ?? undefined,
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
      status: "pending_payment" as const,
      depositAmount,
      totalAmount,
      signalExpiresAt: signalExpiresAt.toISOString(),
      payment,
    };
  },
);

export const getBooking = api(
  { expose: true, method: "GET", path: "/booking/:bookingId" },
  async ({ bookingId }: GetBookingParams): Promise<{ booking: Booking }> => {
    const row = await db.queryRow<{
      id: string;
      resource_id: string;
      merchant_id: string;
      customer_id: string | null;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string | null;
      end_time: string | null;
      people_count: number;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      payment_id: string | null;
      qr_code: string | null;
      copy_paste_code: string | null;
      notes: string | null;
      internal_notes: string | null;
      signal_expires_at: Date | null;
    }>`
      SELECT id, resource_id, merchant_id, customer_id, customer_name, customer_phone, customer_email,
             booking_date, start_time, end_time, people_count, status, deposit_amount, total_amount,
             payment_id, qr_code, copy_paste_code, notes, internal_notes, signal_expires_at
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (!row) {
      throw APIError.notFound("Booking not found");
    }

    return {
      booking: {
        id: row.id,
        resourceId: row.resource_id,
        merchantId: row.merchant_id,
        customerId: row.customer_id ?? undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date.toISOString().split('T')[0],
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,
        peopleCount: row.people_count,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        totalAmount: Number(row.total_amount),
        paymentId: row.payment_id,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
        signalExpiresAt: row.signal_expires_at?.toISOString(),
      },
    };
  },
);

export const listMerchantBookings = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/bookings" },
  async ({ merchantId, status, fromDate, toDate }: MerchantBookingsParams) => {
    const rows = await db.queryAll<{
      id: string;
      resource_id: string;
      merchant_id: string;
      customer_id: string | null;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string | null;
      end_time: string | null;
      people_count: number;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      payment_id: string | null;
      qr_code: string | null;
      copy_paste_code: string | null;
      notes: string | null;
      internal_notes: string | null;
      signal_expires_at: Date | null;
      created_at: Date;
      resource_name: string;
    }>`
      SELECT b.id, b.resource_id, b.merchant_id, b.customer_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.people_count, b.status, b.deposit_amount, b.total_amount,
             b.payment_id, b.qr_code, b.copy_paste_code, b.notes, b.internal_notes, b.signal_expires_at, b.created_at,
             r.name as resource_name
      FROM bookings b
      LEFT JOIN resources r ON b.resource_id = r.id
      WHERE b.merchant_id = ${merchantId}
        AND (${status}::text IS NULL OR b.status = ${status})
        AND (${fromDate}::text IS NULL OR b.booking_date >= ${fromDate}::date)
        AND (${toDate}::text IS NULL OR b.booking_date <= ${toDate}::date)
      ORDER BY b.booking_date DESC, b.start_time ASC NULLS LAST, b.created_at DESC
      LIMIT 200
    `;

    return {
      bookings: rows.map((row) => ({
        id: row.id,
        resourceId: row.resource_id,
        merchantId: row.merchant_id,
        customerId: row.customer_id ?? undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date.toISOString().split('T')[0],
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,
        peopleCount: row.people_count,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        totalAmount: Number(row.total_amount),
        paymentId: row.payment_id,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
        signalExpiresAt: row.signal_expires_at?.toISOString(),
        createdAt: row.created_at.toISOString(),
        resourceName: row.resource_name,
      })),
    };
  },
);

export const updateBookingStatus = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/bookings/:bookingId/status" },
  async ({ merchantId, bookingId, ...body }: UpdateBookingStatusParams & UpdateBookingStatusBody) => {
    const parsed = updateBookingStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const booking = await db.queryRow<{ id: string; status: Booking["status"] }>`
      SELECT id, status
      FROM bookings
      WHERE id = ${bookingId}
        AND merchant_id = ${merchantId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const VALID_TRANSITIONS: Record<Booking["status"], Booking["status"][]> = {
      pending_payment: ["confirmed", "cancelled"],
      confirmed: ["in_progress", "cancelled", "completed"],
      in_progress: ["completed", "no_show"],
      completed: [],
      cancelled: [],
      no_show: [],
    };

    if (!VALID_TRANSITIONS[booking.status].includes(parsed.data.status)) {
      throw APIError.invalidArgument(`Não é possível alterar status de ${booking.status} para ${parsed.data.status}`);
    }

    await db.exec`
      UPDATE bookings
      SET status = ${parsed.data.status}, 
          internal_notes = COALESCE(${parsed.data.internalNotes}, internal_notes),
          updated_at = now()
      WHERE id = ${bookingId}
    `;

    return { ok: true };
  },
);

export const cancelExpiredBookings = api(
  { expose: true, method: "POST", path: "/internal/cancel-expired-bookings" },
  async (): Promise<{ cancelled: number }> => {
    const expiredBookings = await db.queryAll<{ id: string; merchant_id: string }>`
      SELECT id, merchant_id
      FROM bookings
      WHERE status = 'pending_payment'
        AND signal_expires_at < now()
        AND EXISTS (
          SELECT 1 FROM merchants 
          WHERE merchants.id = bookings.merchant_id 
          AND merchants.signal_auto_cancel = TRUE
        )
    `;

    for (const booking of expiredBookings) {
      await db.exec`
        UPDATE bookings
        SET status = 'cancelled', updated_at = now()
        WHERE id = ${booking.id}
      `;

      await db.exec`
        UPDATE payments
        SET status = 'expired'
        WHERE booking_id = ${booking.id}
      `;
    }

    return { cancelled: expiredBookings.length };
  },
);

interface RescheduleBookingParams {
  bookingId: string;
}

interface RescheduleBookingBody {
  newDate: string;
  newStartTime?: string;
  newEndTime?: string;
}

export const rescheduleBooking = api(
  { expose: true, method: "POST", path: "/booking/:bookingId/reschedule" },
  async ({ bookingId, newDate, newStartTime, newEndTime }: RescheduleBookingParams & RescheduleBookingBody) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      resource_id: string;
      status: Booking["status"];
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      people_count: number;
    }>`
      SELECT id, merchant_id, resource_id, status, customer_name, customer_phone, customer_email, people_count
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.status === "cancelled" || booking.status === "completed" || booking.status === "no_show") {
      throw APIError.invalidArgument("Cannot reschedule a cancelled, completed or no-show booking");
    }

    const hasConflict = await checkTimeConflict(booking.resource_id, newDate, newStartTime, newEndTime, bookingId);
    if (hasConflict) {
      throw APIError.alreadyExists("New time slot is not available");
    }

    const hasBlock = await checkBlockConflict(booking.resource_id, newDate, newStartTime, newEndTime);
    if (hasBlock) {
      throw APIError.alreadyExists("New time slot is blocked");
    }

    await db.exec`
      UPDATE bookings
      SET 
        booking_date = ${newDate}::date,
        start_time = ${newStartTime ?? null},
        end_time = ${newEndTime ?? null},
        updated_at = now()
      WHERE id = ${bookingId}
    `;

    const updated = await db.queryRow<{
      id: string;
      resource_id: string;
      merchant_id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string | null;
      end_time: string | null;
      people_count: number;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      notes: string | null;
      internal_notes: string | null;
    }>`
      SELECT id, resource_id, merchant_id, customer_name, customer_phone, customer_email,
             booking_date, start_time, end_time, people_count, status, deposit_amount, total_amount,
             notes, internal_notes
      FROM bookings
      WHERE id = ${bookingId}
    `;

    return {
      booking: {
        id: updated!.id,
        resourceId: updated!.resource_id,
        merchantId: updated!.merchant_id,
        customerName: updated!.customer_name,
        customerPhone: updated!.customer_phone,
        customerEmail: updated!.customer_email ?? undefined,
        bookingDate: updated!.booking_date.toISOString().split('T')[0],
        startTime: updated!.start_time ?? undefined,
        endTime: updated!.end_time ?? undefined,
        peopleCount: updated!.people_count,
        status: updated!.status,
        depositAmount: Number(updated!.deposit_amount),
        totalAmount: Number(updated!.total_amount),
        notes: updated!.notes ?? undefined,
        internalNotes: updated!.internal_notes ?? undefined,
      },
    };
  },
);