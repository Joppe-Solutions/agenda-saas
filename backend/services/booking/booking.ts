import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { z } from "zod";
import { db } from "../../db/db";
import { createBookingSchema, updateBookingStatusSchema } from "../shared/validators";
import { createPixPayment, PaymentProvider } from "../merchant/gateway";
import type { Booking } from "../shared/types";

interface CreateBookingBody {
  serviceId: string;
  staffId?: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
}

interface MerchantBookingsParams {
  merchantId: string;
  status?: Booking["status"];
  fromDate?: string;
  toDate?: string;
  staffId?: string;
  limit?: number;
  offset?: number;
}

async function checkTimeConflict(
  serviceId: string,
  staffId: string | undefined,
  bookingDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  if (staffId) {
    const conflict = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings
      WHERE staff_id = ${staffId}
        AND booking_date = ${bookingDate}::date
        AND status NOT IN ('cancelled', 'no_show')
        AND id != ${excludeBookingId ?? null}
        AND start_time < ${endTime}
        AND end_time > ${startTime}
      FOR UPDATE OF bookings
    `;
    return (conflict?.total ?? 0) > 0;
  }

  const service = await db.queryRow<{ max_concurrent_bookings: number }>`
    SELECT max_concurrent_bookings FROM services WHERE id = ${serviceId}
  `;

  const maxConcurrent = service?.max_concurrent_bookings ?? 1;

  const overlapCount = await db.queryRow<{ count: number }>`
    SELECT COUNT(*)::int AS count
    FROM bookings
    WHERE service_id = ${serviceId}
      AND booking_date = ${bookingDate}::date
      AND status NOT IN ('cancelled', 'no_show')
      AND id != ${excludeBookingId ?? null}
      AND start_time < ${endTime}
      AND end_time > ${startTime}
    FOR UPDATE OF bookings
  `;

  return (overlapCount?.count ?? 0) >= maxConcurrent;
}

async function acquireBookingLock(
  staffId: string | undefined,
  serviceId: string,
  bookingDate: string
): Promise<void> {
  const lockKey = staffId 
    ? `${staffId}:${bookingDate}`
    : `${serviceId}:${bookingDate}`;
  
  const lockHash = lockKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  await db.queryRow<{ locked: boolean }>`
    SELECT pg_advisory_xact_lock(${lockHash}) AS locked
  `;
}

async function checkStaffBlock(
  staffId: string | undefined,
  bookingDate: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  if (!staffId) return false;

  const block = await db.queryRow<{ total: number }>`
    SELECT COUNT(*)::int AS total
    FROM staff_blocks
    WHERE staff_id = ${staffId}
      AND start_time < (${bookingDate}::date || ' ' || ${endTime} || ':00')::timestamptz
      AND end_time > (${bookingDate}::date || ' ' || ${startTime} || ':00')::timestamptz
  `;

  return (block?.total ?? 0) > 0;
}

export const createBooking = api(
  { expose: true, method: "POST", path: "/booking" },
  async (body: CreateBookingBody) => {
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const service = await db.queryRow<{
      duration_minutes: number;
      price: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      require_deposit: boolean;
      deposit_amount: number | null;
      deposit_percentage: number | null;
    }>`
      SELECT duration_minutes, price, buffer_before_minutes, buffer_after_minutes,
             require_deposit, deposit_amount, deposit_percentage
      FROM services
      WHERE id = ${parsed.data.serviceId}
        AND merchant_id = ${parsed.data.merchantId}
        AND active = TRUE
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    if (parsed.data.staffId) {
      const staff = await db.queryRow<{ id: string }>`
        SELECT sm.id FROM staff_members sm
        JOIN staff_services ss ON ss.staff_id = sm.id
        WHERE sm.id = ${parsed.data.staffId}
          AND sm.merchant_id = ${parsed.data.merchantId}
          AND sm.active = TRUE
          AND ss.service_id = ${parsed.data.serviceId}
      `;

      if (!staff) {
        throw APIError.notFound("Staff member not found or not assigned to this service");
      }
    }

    const merchant = await db.queryRow<{
      deposit_percentage: number;
      deposit_deadline_minutes: number;
      require_deposit: boolean;
      mercado_pago_access_token: string | null;
      allow_online_payment: boolean;
      enable_loyalty: boolean;
      points_per_real: number;
    }>`
      SELECT deposit_percentage, deposit_deadline_minutes, require_deposit, 
             mercado_pago_access_token, allow_online_payment, enable_loyalty, points_per_real
      FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    await acquireBookingLock(parsed.data.staffId, parsed.data.serviceId, parsed.data.bookingDate);

    const [startH, startM] = parsed.data.startTime.split(":").map(Number);
    const totalDuration = service.duration_minutes + service.buffer_before_minutes + service.buffer_after_minutes;
    const endMinutes = startH * 60 + startM + service.duration_minutes;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const bufferStartMinutes = startH * 60 + startM - service.buffer_before_minutes;
    const bufferEndMinutes = endMinutes + service.buffer_after_minutes;
    const bufferStartTime = `${String(Math.floor(bufferStartMinutes / 60)).padStart(2, "0")}:${String(Math.abs(bufferStartMinutes) % 60).padStart(2, "0")}`;
    const bufferEndTime = `${String(Math.floor(bufferEndMinutes / 60)).padStart(2, "0")}:${String(bufferEndMinutes % 60).padStart(2, "0")}`;

    const hasConflict = await checkTimeConflict(
      parsed.data.serviceId, 
      parsed.data.staffId, 
      parsed.data.bookingDate, 
      bufferStartTime,
      bufferEndTime
    );
    if (hasConflict) {
      throw APIError.alreadyExists("Horário já reservado");
    }

    const hasBlock = await checkStaffBlock(
      parsed.data.staffId, 
      parsed.data.bookingDate, 
      bufferStartTime,
      bufferEndTime
    );
    if (hasBlock) {
      throw APIError.alreadyExists("Profissional indisponível neste horário");
    }

    const minAdvanceMinutes = 30;
    const now = new Date();
    const bookingDateTime = new Date(`${parsed.data.bookingDate}T${parsed.data.startTime}:00`);
    if (bookingDateTime.getTime() - now.getTime() < minAdvanceMinutes * 60 * 1000) {
      throw APIError.invalidArgument(`Mínimo ${minAdvanceMinutes} minutos de antecedência`);
    }

    const bookingId = randomUUID();
    const totalAmount = Number(service.price);
    
    let depositAmount = 0;
    if (service.deposit_amount) {
      depositAmount = Number(service.deposit_amount);
    } else if (service.deposit_percentage) {
      depositAmount = Number((totalAmount * service.deposit_percentage / 100).toFixed(2));
    } else if (merchant.require_deposit) {
      depositAmount = Number((totalAmount * merchant.deposit_percentage / 100).toFixed(2));
    }

    const depositExpiresAt = new Date(now.getTime() + merchant.deposit_deadline_minutes * 60 * 1000);

    let loyaltyPointsEarned = 0;
    if (merchant.enable_loyalty && merchant.points_per_real > 0 && totalAmount > 0) {
      loyaltyPointsEarned = Math.floor(totalAmount * merchant.points_per_real);
    }

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

    const initialStatus = depositAmount > 0 && merchant.allow_online_payment ? "pending_payment" : "confirmed";

    await db.exec`
      INSERT INTO bookings (
        id, service_id, staff_id, merchant_id, customer_id, customer_name, customer_phone, customer_email,
        booking_date, start_time, end_time, status, deposit_amount, total_amount,
        notes, deposit_expires_at, loyalty_points_earned
      ) VALUES (
        ${bookingId}, ${parsed.data.serviceId}, ${parsed.data.staffId ?? null}, ${parsed.data.merchantId}, ${customerId}, 
        ${parsed.data.customerName}, ${parsed.data.customerPhone}, ${parsed.data.customerEmail ?? null},
        ${parsed.data.bookingDate}::date, ${parsed.data.startTime}, ${endTime}, 
        ${initialStatus}, ${depositAmount}, ${totalAmount},
        ${parsed.data.notes ?? null}, ${depositExpiresAt.toISOString()}, ${loyaltyPointsEarned}
      )
    `;

    if (initialStatus === "confirmed") {
      return {
        bookingId,
        status: "confirmed" as const,
        depositAmount: 0,
        totalAmount,
        depositExpiresAt: undefined,
        payment: undefined,
      };
    }

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
      depositExpiresAt: depositExpiresAt.toISOString(),
      payment,
    };
  },
);

export const getBooking = api(
  { expose: true, method: "GET", path: "/booking/:bookingId" },
  async ({ bookingId }: { bookingId: string }): Promise<{ booking: Booking }> => {
    const row = await db.queryRow<{
      id: string;
      service_id: string;
      staff_id: string | null;
      merchant_id: string;
      customer_id: string | null;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string;
      end_time: string;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      payment_id: string | null;
      payment_method: string | null;
      qr_code: string | null;
      copy_paste_code: string | null;
      notes: string | null;
      internal_notes: string | null;
      deposit_expires_at: Date | null;
      loyalty_points_earned: number;
      created_at: Date;
      service_name: string;
      staff_name: string | null;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount,
             b.payment_id, b.payment_method, b.qr_code, b.copy_paste_code, b.notes, b.internal_notes, 
             b.deposit_expires_at, b.loyalty_points_earned, b.created_at,
             s.name as service_name, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.id = ${bookingId}
    `;

    if (!row) {
      throw APIError.notFound("Booking not found");
    }

    return {
      booking: {
        id: row.id,
        serviceId: row.service_id,
        staffId: row.staff_id ?? undefined,
        merchantId: row.merchant_id,
        customerId: row.customer_id ?? undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date.toISOString().split('T')[0],
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        totalAmount: Number(row.total_amount),
        paymentId: row.payment_id,
        paymentMethod: row.payment_method as Booking["paymentMethod"] ?? undefined,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
        depositExpiresAt: row.deposit_expires_at?.toISOString(),
        loyaltyPointsEarned: row.loyalty_points_earned,
      },
    };
  },
);

export const listMerchantBookings = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/bookings" },
  async ({ merchantId, status, fromDate, toDate, staffId, limit, offset }: MerchantBookingsParams) => {
    const pageSize = Math.min(limit ?? 50, 100);
    const pageOffset = offset ?? 0;

    const countRow = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM bookings b
      WHERE b.merchant_id = ${merchantId}
        AND (${status}::text IS NULL OR b.status = ${status})
        AND (${fromDate}::text IS NULL OR b.booking_date >= ${fromDate}::date)
        AND (${toDate}::text IS NULL OR b.booking_date <= ${toDate}::date)
        AND (${staffId}::uuid IS NULL OR b.staff_id = ${staffId})
    `;

    const rows = await db.queryAll<{
      id: string;
      service_id: string;
      staff_id: string | null;
      merchant_id: string;
      customer_id: string | null;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string;
      end_time: string;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      payment_id: string | null;
      qr_code: string | null;
      copy_paste_code: string | null;
      notes: string | null;
      internal_notes: string | null;
      deposit_expires_at: Date | null;
      created_at: Date;
      service_name: string;
      staff_name: string | null;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount,
             b.payment_id, b.qr_code, b.copy_paste_code, b.notes, b.internal_notes, b.deposit_expires_at, b.created_at,
             s.name as service_name, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.merchant_id = ${merchantId}
        AND (${status}::text IS NULL OR b.status = ${status})
        AND (${fromDate}::text IS NULL OR b.booking_date >= ${fromDate}::date)
        AND (${toDate}::text IS NULL OR b.booking_date <= ${toDate}::date)
        AND (${staffId}::uuid IS NULL OR b.staff_id = ${staffId})
      ORDER BY b.booking_date DESC, b.start_time ASC, b.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${pageOffset}
    `;

    return {
      bookings: rows.map((row) => ({
        id: row.id,
        serviceId: row.service_id,
        staffId: row.staff_id ?? undefined,
        merchantId: row.merchant_id,
        customerId: row.customer_id ?? undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date.toISOString().split('T')[0],
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        totalAmount: Number(row.total_amount),
        paymentId: row.payment_id,
        qrCode: row.qr_code ?? undefined,
        copyPasteCode: row.copy_paste_code ?? undefined,
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
        depositExpiresAt: row.deposit_expires_at?.toISOString(),
        createdAt: row.created_at.toISOString(),
        serviceName: row.service_name,
        staffName: row.staff_name ?? undefined,
        loyaltyPointsEarned: 0,
      })),
      total: countRow?.total ?? 0,
      hasMore: (countRow?.total ?? 0) > pageOffset + pageSize,
    };
  },
);

export const updateBookingStatus = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/bookings/:bookingId/status" },
  async ({ merchantId, bookingId, ...body }: { merchantId: string; bookingId: string } & z.infer<typeof updateBookingStatusSchema>) => {
    const parsed = updateBookingStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const booking = await db.queryRow<{ 
      id: string; 
      status: Booking["status"];
      booking_date: Date;
      start_time: string;
      deposit_amount: number;
    }>`
      SELECT id, status, booking_date, start_time, deposit_amount
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

    let cancellationInfo: { withinDeadline: boolean; refundAmount: number } | undefined;

    if (parsed.data.status === "cancelled") {
      const merchant = await db.queryRow<{
        cancellation_deadline_hours: number;
        cancellation_refund_percentage: number;
      }>`
        SELECT cancellation_deadline_hours, cancellation_refund_percentage
        FROM merchants WHERE id = ${merchantId}
      `;

      const deadlineHours = merchant?.cancellation_deadline_hours ?? 24;
      const refundPercentage = merchant?.cancellation_refund_percentage ?? 0;

      const bookingDateTime = new Date(`${booking.booking_date.toISOString().split('T')[0]}T${booking.start_time}:00`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      const withinDeadline = hoursUntilBooking >= deadlineHours;
      const refundAmount = withinDeadline 
        ? Number((booking.deposit_amount * refundPercentage / 100).toFixed(2))
        : 0;

      cancellationInfo = { withinDeadline, refundAmount };
    }

    await db.exec`
      UPDATE bookings
      SET status = ${parsed.data.status}, 
          internal_notes = COALESCE(${parsed.data.internalNotes}, internal_notes),
          updated_at = now()
      WHERE id = ${bookingId}
    `;

    return { ok: true, cancellationInfo };
  },
);

export const cancelExpiredBookings = api(
  { expose: true, method: "POST", path: "/internal/cancel-expired-bookings" },
  async (): Promise<{ cancelled: number }> => {
    const expiredBookings = await db.queryAll<{ id: string; merchant_id: string }>`
      SELECT id, merchant_id
      FROM bookings
      WHERE status = 'pending_payment'
        AND deposit_expires_at < now()
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

export const rescheduleBooking = api(
  { expose: true, method: "POST", path: "/booking/:bookingId/reschedule" },
  async ({ bookingId, newDate, newStartTime, staffId }: { 
    bookingId: string; 
    newDate: string; 
    newStartTime?: string;
    staffId?: string;
  }) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      service_id: string;
      staff_id: string | null;
      status: Booking["status"];
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
    }>`
      SELECT id, merchant_id, service_id, staff_id, status, customer_name, customer_phone, customer_email
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.status === "cancelled" || booking.status === "completed" || booking.status === "no_show") {
      throw APIError.invalidArgument("Cannot reschedule a cancelled, completed or no-show booking");
    }

    const service = await db.queryRow<{ duration_minutes: number }>`
      SELECT duration_minutes FROM services WHERE id = ${booking.service_id}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    const startTime = newStartTime || "09:00";
    const [startH, startM] = startTime.split(":").map(Number);
    const endMinutes = startH * 60 + startM + service.duration_minutes;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const effectiveStaffId = staffId || booking.staff_id || undefined;

    const hasConflict = await checkTimeConflict(
      booking.service_id, 
      effectiveStaffId, 
      newDate, 
      startTime, 
      endTime, 
      bookingId
    );
    if (hasConflict) {
      throw APIError.alreadyExists("New time slot is not available");
    }

    const hasBlock = await checkStaffBlock(effectiveStaffId, newDate, startTime, endTime);
    if (hasBlock) {
      throw APIError.alreadyExists("Staff member is blocked at this time");
    }

    await db.exec`
      UPDATE bookings
      SET 
        booking_date = ${newDate}::date,
        start_time = ${startTime},
        end_time = ${endTime},
        staff_id = ${effectiveStaffId ?? null},
        updated_at = now()
      WHERE id = ${bookingId}
    `;

    const updated = await db.queryRow<{
      id: string;
      service_id: string;
      staff_id: string | null;
      merchant_id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string;
      end_time: string;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      notes: string | null;
      internal_notes: string | null;
      service_name: string;
      staff_name: string | null;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount,
             b.notes, b.internal_notes, s.name as service_name, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.id = ${bookingId}
    `;

    return {
      booking: {
        id: updated!.id,
        serviceId: updated!.service_id,
        staffId: updated!.staff_id ?? undefined,
        merchantId: updated!.merchant_id,
        customerName: updated!.customer_name,
        customerPhone: updated!.customer_phone,
        customerEmail: updated!.customer_email ?? undefined,
        bookingDate: updated!.booking_date.toISOString().split('T')[0],
        startTime: updated!.start_time,
        endTime: updated!.end_time,
        status: updated!.status,
        depositAmount: Number(updated!.deposit_amount),
        totalAmount: Number(updated!.total_amount),
        notes: updated!.notes ?? undefined,
        internalNotes: updated!.internal_notes ?? undefined,
        serviceName: updated!.service_name,
        staffName: updated!.staff_name ?? undefined,
        loyaltyPointsEarned: 0,
        paymentId: null,
      },
    };
  },
);

export const retryBookingPayment = api(
  { expose: true, method: "POST", path: "/booking/:bookingId/retry-payment" },
  async ({ bookingId }: { bookingId: string }) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      service_id: string;
      status: Booking["status"];
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      deposit_amount: number;
      total_amount: number;
      payment_id: string | null;
    }>`
      SELECT id, merchant_id, service_id, status, customer_name, customer_phone, customer_email, 
             deposit_amount, total_amount, payment_id
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.status !== "pending_payment" && booking.status !== "cancelled") {
      throw APIError.invalidArgument("Só é possível reenviar cobrança para agendamentos aguardando pagamento ou cancelados");
    }

    const merchant = await db.queryRow<{
      deposit_deadline_minutes: number;
      mercado_pago_access_token: string | null;
    }>`
      SELECT deposit_deadline_minutes, mercado_pago_access_token
      FROM merchants WHERE id = ${booking.merchant_id}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const now = new Date();
    const depositExpiresAt = new Date(now.getTime() + merchant.deposit_deadline_minutes * 60 * 1000);

    const provider: PaymentProvider = merchant.mercado_pago_access_token ? "MERCADO_PAGO" : "STUB";

    const payment = await createPixPayment(
      {
        bookingId,
        amount: booking.deposit_amount,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email ?? undefined,
        customerPhone: booking.customer_phone,
      },
      provider,
      merchant.mercado_pago_access_token ?? undefined,
    );

    await db.exec`
      INSERT INTO payments (id, booking_id, merchant_id, amount, status, payment_method, provider, provider_payment_id, qr_code, copy_paste_code)
      VALUES (
        ${randomUUID()},
        ${bookingId},
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
      SET 
        status = 'pending_payment',
        payment_id = ${payment.paymentId}, 
        qr_code = ${payment.qrCode}, 
        copy_paste_code = ${payment.copyPasteCode},
        deposit_expires_at = ${depositExpiresAt.toISOString()},
        updated_at = now()
      WHERE id = ${bookingId}
    `;

    return {
      ok: true,
      payment: {
        paymentId: payment.paymentId,
        qrCode: payment.qrCode,
        copyPasteCode: payment.copyPasteCode,
        expiresAt: depositExpiresAt.toISOString(),
      },
    };
  },
);

export const getBookingReceipt = api(
  { expose: true, method: "GET", path: "/booking/:bookingId/receipt" },
  async ({ bookingId }: { bookingId: string }) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      service_id: string;
      staff_id: string | null;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string;
      end_time: string;
      status: Booking["status"];
      deposit_amount: number;
      total_amount: number;
      created_at: Date;
      service_name: string;
      staff_name: string | null;
      duration_minutes: number;
    }>`
      SELECT b.id, b.merchant_id, b.service_id, b.staff_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount, b.created_at,
             s.name as service_name, s.duration_minutes, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.id = ${bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const merchant = await db.queryRow<{
      business_name: string;
      slug: string;
      whatsapp_number: string;
      email: string | null;
      address: string | null;
      city: string | null;
      pix_key: string;
    }>`
      SELECT business_name, slug, whatsapp_number, email, address, city, pix_key
      FROM merchants WHERE id = ${booking.merchant_id}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const payment = await db.queryRow<{
      id: string;
      amount: number;
      status: string;
      paid_at: Date | null;
    }>`
      SELECT id, amount, status, paid_at
      FROM payments
      WHERE booking_id = ${bookingId} AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return {
      booking: {
        id: booking.id,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        customerEmail: booking.customer_email ?? undefined,
        bookingDate: booking.booking_date.toISOString().split('T')[0],
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        depositAmount: Number(booking.deposit_amount),
        totalAmount: Number(booking.total_amount),
        createdAt: booking.created_at.toISOString(),
        serviceName: booking.service_name,
        staffName: booking.staff_name ?? undefined,
      },
      merchant: {
        businessName: merchant.business_name,
        slug: merchant.slug,
        whatsappNumber: merchant.whatsapp_number,
        email: merchant.email ?? undefined,
        address: merchant.address ?? undefined,
        city: merchant.city ?? undefined,
        pixKey: merchant.pix_key,
      },
      service: {
        name: booking.service_name,
        durationMinutes: booking.duration_minutes,
      },
      payment: payment ? {
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paid_at?.toISOString(),
      } : undefined,
    };
  },
);

export const cancelBookingByCustomer = api(
  { expose: true, method: "POST", path: "/booking/:bookingId/cancel-by-customer" },
  async ({ bookingId, customerPhone }: { bookingId: string; customerPhone: string }) => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      status: Booking["status"];
      customer_phone: string;
      booking_date: Date;
      start_time: string;
      deposit_amount: number;
    }>`
      SELECT id, merchant_id, status, customer_phone, booking_date, start_time, deposit_amount
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.customer_phone.replace(/\D/g, "") !== customerPhone.replace(/\D/g, "")) {
      throw APIError.permissionDenied("Phone number does not match");
    }

    if (booking.status === "cancelled" || booking.status === "completed" || booking.status === "no_show") {
      throw APIError.invalidArgument("Cannot cancel this booking");
    }

    const merchant = await db.queryRow<{
      cancellation_deadline_hours: number;
      cancellation_refund_percentage: number;
    }>`
      SELECT cancellation_deadline_hours, cancellation_refund_percentage
      FROM merchants WHERE id = ${booking.merchant_id}
    `;

    const bookingDateTime = new Date(`${booking.booking_date.toISOString().split('T')[0]}T${booking.start_time}:00`);
    const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilBooking < (merchant?.cancellation_deadline_hours ?? 24)) {
      throw APIError.invalidArgument(`Cancellation deadline passed. Minimum ${(merchant?.cancellation_deadline_hours ?? 24)} hours before appointment.`);
    }

    await db.exec`
      UPDATE bookings
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${bookingId}
    `;

    return {
      ok: true,
      refundPercentage: merchant?.cancellation_refund_percentage ?? 0,
      refundAmount: Number(booking.deposit_amount) * (merchant?.cancellation_refund_percentage ?? 0) / 100,
    };
  },
);