import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { z } from "zod";
import { db } from "../../db/db";
import { 
  upsertMerchantSchema, 
  createServiceSchema, 
  updateServiceSchema, 
  createServiceCategorySchema,
  createStaffSchema,
  updateStaffSchema,
  createAvailabilitySchema,
  createBlockSchema 
} from "../shared/validators";
import { createPixPayment, verifyPaymentStatus, PaymentProvider } from "./gateway";
import type { Service, ServiceCategory, StaffMember, StaffAvailability, StaffBlock, Merchant, Payment, Booking, TimeSlot, Customer, CustomerTag } from "../shared/types";
import { serviceTemplates } from "../shared/types";

// ============ PUBLIC ENDPOINTS ============

export const getPublicMerchant = api(
  { expose: true, method: "GET", path: "/public/merchant/:slug" },
  async ({ slug }: { slug: string }) => {
    const merchant = await db.queryRow<{
      id: string;
      slug: string;
      business_name: string;
      business_category: Merchant["businessCategory"];
      whatsapp_number: string;
      pix_key: string;
      email: string | null;
      logo: string | null;
      primary_color: string | null;
      address: string | null;
      city: string | null;
      require_deposit: boolean;
      deposit_percentage: number;
      allow_online_payment: boolean;
    }>`
      SELECT id, slug, business_name, business_category, whatsapp_number, pix_key, email,
             logo, primary_color, address, city, require_deposit, deposit_percentage, allow_online_payment
      FROM merchants
      WHERE slug = ${slug}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const services = await db.queryAll<{
      id: string;
      merchant_id: string;
      category_id: string | null;
      name: string;
      description: string | null;
      duration_minutes: number;
      price: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      photos: string[];
      active: boolean;
      require_deposit: boolean;
      deposit_amount: number | null;
      deposit_percentage: number | null;
      allow_staff_selection: boolean;
      "order": number;
    }>`
      SELECT id, merchant_id, category_id, name, description, duration_minutes, price,
             buffer_before_minutes, buffer_after_minutes, photos, active, require_deposit,
             deposit_amount, deposit_percentage, allow_staff_selection, "order"
      FROM services
      WHERE merchant_id = ${merchant.id} AND active = TRUE
      ORDER BY "order" ASC, name ASC
    `;

    const staff = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      email: string | null;
      phone: string | null;
      photo: string | null;
      bio: string | null;
      active: boolean;
      commission_percentage: number | null;
    }>`
      SELECT id, merchant_id, name, email, phone, photo, bio, active, commission_percentage
      FROM staff_members
      WHERE merchant_id = ${merchant.id} AND active = TRUE
      ORDER BY name ASC
    `;

    const staffServices = await db.queryAll<{
      staff_id: string;
      service_id: string;
    }>`
      SELECT ss.staff_id, ss.service_id
      FROM staff_services ss
      JOIN staff_members sm ON sm.id = ss.staff_id
      WHERE sm.merchant_id = ${merchant.id}
    `;

    const categories = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      icon: string | null;
      color: string | null;
      "order": number;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, icon, color, "order", active
      FROM service_categories
      WHERE merchant_id = ${merchant.id} AND active = TRUE
      ORDER BY "order" ASC
    `;

    const staffWithServices = staff.map(s => ({
      id: s.id,
      merchantId: s.merchant_id,
      name: s.name,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
      photo: s.photo ?? undefined,
      bio: s.bio ?? undefined,
      active: s.active,
      commissionPercentage: s.commission_percentage ?? undefined,
      services: staffServices.filter(ss => ss.staff_id === s.id).map(ss => ss.service_id),
    }));

    return {
      merchant: {
        id: merchant.id,
        slug: merchant.slug,
        businessName: merchant.business_name,
        businessCategory: merchant.business_category,
        whatsappNumber: merchant.whatsapp_number,
        pixKey: merchant.pix_key,
        email: merchant.email ?? undefined,
        logo: merchant.logo ?? undefined,
        primaryColor: merchant.primary_color ?? undefined,
        address: merchant.address ?? undefined,
        city: merchant.city ?? undefined,
        requireDeposit: merchant.require_deposit,
        depositPercentage: merchant.deposit_percentage,
        allowOnlinePayment: merchant.allow_online_payment,
      },
      services: services.map(s => ({
        id: s.id,
        merchantId: s.merchant_id,
        categoryId: s.category_id ?? undefined,
        name: s.name,
        description: s.description ?? undefined,
        durationMinutes: s.duration_minutes,
        price: Number(s.price),
        bufferBeforeMinutes: s.buffer_before_minutes,
        bufferAfterMinutes: s.buffer_after_minutes,
        photos: s.photos ?? [],
        active: s.active,
        requireDeposit: s.require_deposit,
        depositAmount: s.deposit_amount ? Number(s.deposit_amount) : undefined,
        depositPercentage: s.deposit_percentage ?? undefined,
        allowStaffSelection: s.allow_staff_selection,
        order: s.order,
      })),
      staff: staffWithServices,
      categories: categories.map(c => ({
        id: c.id,
        merchantId: c.merchant_id,
        name: c.name,
        icon: c.icon ?? undefined,
        color: c.color ?? undefined,
        order: c.order,
        active: c.active,
      })),
    };
  },
);

// ============ MERCHANT PROFILE ============

export const getMerchantProfile = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/profile" },
  async ({ merchantId }: { merchantId: string }): Promise<{ merchant: Merchant }> => {
    const merchant = await db.queryRow<{
      id: string;
      slug: string;
      business_name: string;
      business_category: Merchant["businessCategory"];
      whatsapp_number: string;
      pix_key: string;
      email: string | null;
      mercado_pago_access_token: string | null;
      address: string | null;
      city: string | null;
      logo: string | null;
      primary_color: string | null;
      require_deposit: boolean;
      deposit_percentage: number;
      deposit_deadline_minutes: number;
      auto_confirm_on_payment: boolean;
      allow_online_payment: boolean;
      cancellation_deadline_hours: number;
      cancellation_refund_percentage: number;
      enable_reminders: boolean;
      reminder_hours_before: number;
      enable_loyalty: boolean;
      points_per_real: number;
    }>`
      SELECT id, slug, business_name, business_category, whatsapp_number, pix_key, email,
             mercado_pago_access_token, address, city, logo, primary_color,
             require_deposit, deposit_percentage, deposit_deadline_minutes, auto_confirm_on_payment,
             allow_online_payment, cancellation_deadline_hours, cancellation_refund_percentage,
             enable_reminders, reminder_hours_before, enable_loyalty, points_per_real
      FROM merchants
      WHERE id = ${merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    return {
      merchant: {
        id: merchant.id,
        slug: merchant.slug,
        businessName: merchant.business_name,
        businessCategory: merchant.business_category,
        whatsappNumber: merchant.whatsapp_number,
        pixKey: merchant.pix_key,
        email: merchant.email ?? undefined,
        mercadoPagoAccessToken: merchant.mercado_pago_access_token ?? undefined,
        address: merchant.address ?? undefined,
        city: merchant.city ?? undefined,
        logo: merchant.logo ?? undefined,
        primaryColor: merchant.primary_color ?? undefined,
        requireDeposit: merchant.require_deposit,
        depositPercentage: merchant.deposit_percentage,
        depositDeadlineMinutes: merchant.deposit_deadline_minutes,
        autoConfirmOnPayment: merchant.auto_confirm_on_payment,
        allowOnlinePayment: merchant.allow_online_payment,
        cancellationDeadlineHours: merchant.cancellation_deadline_hours,
        cancellationRefundPercentage: merchant.cancellation_refund_percentage,
        enableReminders: merchant.enable_reminders,
        reminderHoursBefore: merchant.reminder_hours_before,
        enableLoyalty: merchant.enable_loyalty,
        pointsPerReal: merchant.points_per_real,
      },
    };
  },
);

export const upsertMerchantProfile = api(
  { expose: true, method: "POST", path: "/merchant/profile" },
  async (body: z.infer<typeof upsertMerchantSchema>) => {
    const parsed = upsertMerchantSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    await db.exec`
      INSERT INTO merchants (id, slug, business_name, business_category, whatsapp_number, pix_key, email,
                             mercado_pago_access_token, address, city, logo, primary_color,
                             require_deposit, deposit_percentage, deposit_deadline_minutes, auto_confirm_on_payment,
                             allow_online_payment, cancellation_deadline_hours, cancellation_refund_percentage,
                             enable_reminders, reminder_hours_before, enable_loyalty, points_per_real)
      VALUES (${parsed.data.id}, ${parsed.data.slug}, ${parsed.data.businessName}, ${parsed.data.businessCategory}, 
              ${parsed.data.whatsappNumber}, ${parsed.data.pixKey}, ${parsed.data.email ?? null}, 
              ${parsed.data.mercadoPagoAccessToken ?? null}, ${parsed.data.address ?? null}, ${parsed.data.city ?? null},
              ${parsed.data.logo ?? null}, ${parsed.data.primaryColor ?? null},
              ${parsed.data.requireDeposit ?? true}, ${parsed.data.depositPercentage ?? 50}, 
              ${parsed.data.depositDeadlineMinutes ?? 120}, ${parsed.data.autoConfirmOnPayment ?? true},
              ${parsed.data.allowOnlinePayment ?? true}, ${parsed.data.cancellationDeadlineHours ?? 24}, 
              ${parsed.data.cancellationRefundPercentage ?? 0},
              ${parsed.data.enableReminders ?? true}, ${parsed.data.reminderHoursBefore ?? 24},
              ${parsed.data.enableLoyalty ?? false}, ${parsed.data.pointsPerReal ?? 1})
      ON CONFLICT (id)
      DO UPDATE SET
        slug = EXCLUDED.slug,
        business_name = EXCLUDED.business_name,
        business_category = EXCLUDED.business_category,
        whatsapp_number = EXCLUDED.whatsapp_number,
        pix_key = EXCLUDED.pix_key,
        email = COALESCE(EXCLUDED.email, merchants.email),
        mercado_pago_access_token = COALESCE(EXCLUDED.mercado_pago_access_token, merchants.mercado_pago_access_token),
        address = COALESCE(EXCLUDED.address, merchants.address),
        city = COALESCE(EXCLUDED.city, merchants.city),
        logo = COALESCE(EXCLUDED.logo, merchants.logo),
        primary_color = COALESCE(EXCLUDED.primary_color, merchants.primary_color),
        require_deposit = COALESCE(EXCLUDED.require_deposit, merchants.require_deposit),
        deposit_percentage = COALESCE(EXCLUDED.deposit_percentage, merchants.deposit_percentage),
        deposit_deadline_minutes = COALESCE(EXCLUDED.deposit_deadline_minutes, merchants.deposit_deadline_minutes),
        auto_confirm_on_payment = COALESCE(EXCLUDED.auto_confirm_on_payment, merchants.auto_confirm_on_payment),
        allow_online_payment = COALESCE(EXCLUDED.allow_online_payment, merchants.allow_online_payment),
        cancellation_deadline_hours = COALESCE(EXCLUDED.cancellation_deadline_hours, merchants.cancellation_deadline_hours),
        cancellation_refund_percentage = COALESCE(EXCLUDED.cancellation_refund_percentage, merchants.cancellation_refund_percentage),
        enable_reminders = COALESCE(EXCLUDED.enable_reminders, merchants.enable_reminders),
        reminder_hours_before = COALESCE(EXCLUDED.reminder_hours_before, merchants.reminder_hours_before),
        enable_loyalty = COALESCE(EXCLUDED.enable_loyalty, merchants.enable_loyalty),
        points_per_real = COALESCE(EXCLUDED.points_per_real, merchants.points_per_real),
        updated_at = now()
    `;

    return { ok: true };
  },
);

export const updateMerchantSettings = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/settings" },
  async ({ merchantId, ...body }: { merchantId: string } & Record<string, unknown>) => {
    const merchant = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const fieldMappings: Record<string, string> = {
      requireDeposit: "require_deposit",
      depositPercentage: "deposit_percentage",
      depositDeadlineMinutes: "deposit_deadline_minutes",
      autoConfirmOnPayment: "auto_confirm_on_payment",
      allowOnlinePayment: "allow_online_payment",
      enableReminders: "enable_reminders",
      reminderHoursBefore: "reminder_hours_before",
      enableLoyalty: "enable_loyalty",
      pointsPerReal: "points_per_real",
      cancellationDeadlineHours: "cancellation_deadline_hours",
      cancellationRefundPercentage: "cancellation_refund_percentage",
    };

    for (const [key, dbField] of Object.entries(fieldMappings)) {
      if (body[key] !== undefined) {
        updates.push(`${dbField} = $${paramCount}`);
        values.push(body[key]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return { ok: true };
    }

    updates.push(`updated_at = now()`);
    values.push(merchantId);

    await db.exec`
      UPDATE merchants SET ${updates.join(", ")} WHERE id = ${merchantId}
    `;

    return { ok: true };
  },
);

export const updateCancellationPolicy = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/cancellation-policy" },
  async ({ merchantId, deadlineHours, refundPercentage }: { 
    merchantId: string; 
    deadlineHours: number; 
    refundPercentage: number;
  }) => {
    const merchant = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    await db.exec`
      UPDATE merchants
      SET 
        cancellation_deadline_hours = ${deadlineHours},
        cancellation_refund_percentage = ${refundPercentage},
        updated_at = now()
      WHERE id = ${merchantId}
    `;

    return { ok: true };
  },
);

// ============ CLERK WEBHOOK ============

interface ClerkWebhookBody {
  type: string;
  data: {
    id: string;
    name?: string;
    slug?: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: Record<string, unknown>;
    created_by?: string;
  };
}

export const clerkWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/clerk" },
  async (body: ClerkWebhookBody) => {
    const parsed = body;

    if (parsed.type === "organization.created") {
      const { id, name, slug, created_by } = parsed.data;
      const orgName = name || "Meu Negócio";

      const baseSlug = (slug || id).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
      let finalSlug = baseSlug;
      let counter = 1;

      const existing = await db.queryRow<{ slug: string }>`
        SELECT slug FROM merchants WHERE slug = ${finalSlug}
      `;

      while (existing) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
        const checkAgain = await db.queryRow<{ slug: string }>`
          SELECT slug FROM merchants WHERE slug = ${finalSlug}
        `;
        if (!checkAgain) break;
      }

      await db.exec`
        INSERT INTO merchants (id, slug, business_name, business_category, whatsapp_number, pix_key, email,
                               require_deposit, deposit_percentage, deposit_deadline_minutes, auto_confirm_on_payment,
                               allow_online_payment, cancellation_deadline_hours, cancellation_refund_percentage,
                               enable_reminders, reminder_hours_before, enable_loyalty, points_per_real)
        VALUES (${id}, ${finalSlug}, ${orgName}, 'SERVICES', '', '', null, true, 50, 120, true, true, 24, 0, true, 24, false, 1)
      `;

      const categoryId = randomUUID();
      await db.exec`
        INSERT INTO service_categories (id, merchant_id, name, "order", active)
        VALUES (${categoryId}, ${id}, 'Serviços', 0, true)
      `;

      const staffId = randomUUID();
      await db.exec`
        INSERT INTO staff_members (id, merchant_id, name, active)
        VALUES (${staffId}, ${id}, 'Profissional', true)
      `;

      for (let dow = 1; dow <= 5; dow++) {
        await db.exec`
          INSERT INTO staff_availability (id, staff_id, day_of_week, start_time, end_time)
          VALUES (${randomUUID()}, ${staffId}, ${dow}, '09:00', '18:00')
        `;
      }

      return { ok: true, created: true, orgId: id };
    }

    if (parsed.type === "organization.updated") {
      const { id, name, slug } = parsed.data;
      
      if (name) {
        await db.exec`
          UPDATE merchants 
          SET business_name = ${name}, updated_at = now()
          WHERE id = ${id}
        `;
      }

      return { ok: true, updated: true };
    }

    if (parsed.type === "organization.deleted") {
      await db.exec`
        DELETE FROM merchants WHERE id = ${parsed.data.id}
      `;
      return { ok: true, deleted: true };
    }

    if (parsed.type === "user.deleted") {
      return { ok: true };
    }

    return { ok: true };
  },
);

// ============ DASHBOARD ============

export const getMerchantDashboardSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/dashboard" },
  async ({ merchantId }: { merchantId: string }) => {
    const today = await db.queryRow<{ 
      bookings_today: number; 
      pending_today: number;
      month_revenue: number; 
      pending_count: number 
    }>`
      SELECT
        COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE AND status IN ('confirmed', 'in_progress'))::int AS bookings_today,
        COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE AND status = 'pending_payment')::int AS pending_today,
        COALESCE(SUM(deposit_amount) FILTER (
          WHERE status IN ('confirmed', 'completed')
            AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
        ), 0)::numeric AS month_revenue,
        COUNT(*) FILTER (WHERE status = 'pending_payment')::int AS pending_count
      FROM bookings
      WHERE merchant_id = ${merchantId}
    `;

    const servicesCount = await db.queryRow<{ total: number; active: number }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE active = TRUE)::int AS active
      FROM services
      WHERE merchant_id = ${merchantId}
    `;

    const staffCount = await db.queryRow<{ total: number; active: number }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE active = TRUE)::int AS active
      FROM staff_members
      WHERE merchant_id = ${merchantId}
    `;

    const customersCount = await db.queryRow<{ total: number; new_month: number }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::int AS new_month
      FROM customers
      WHERE merchant_id = ${merchantId}
    `;

    return {
      bookingsToday: today?.bookings_today ?? 0,
      pendingToday: today?.pending_today ?? 0,
      monthRevenue: Number(today?.month_revenue ?? 0),
      pendingPayments: today?.pending_count ?? 0,
      totalServices: servicesCount?.total ?? 0,
      activeServices: servicesCount?.active ?? 0,
      totalStaff: staffCount?.total ?? 0,
      activeStaff: staffCount?.active ?? 0,
      totalCustomers: customersCount?.total ?? 0,
      newCustomersMonth: customersCount?.new_month ?? 0,
    };
  },
);

export const getTodaysBookings = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/bookings/today" },
  async ({ merchantId }: { merchantId: string }): Promise<{ bookings: Booking[] }> => {
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
      notes: string | null;
      internal_notes: string | null;
      service_name: string;
      staff_name: string | null;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount,
             b.payment_id, b.notes, b.internal_notes, s.name as service_name, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.merchant_id = ${merchantId} AND b.booking_date = CURRENT_DATE
      ORDER BY b.start_time ASC
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
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
        serviceName: row.service_name,
        staffName: row.staff_name ?? undefined,
        loyaltyPointsEarned: 0,
      })),
    };
  },
);

// ============ SERVICES ============

export const listMerchantServices = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/services" },
  async ({ merchantId }: { merchantId: string }): Promise<{ services: Service[] }> => {
    const rows = await db.queryAll<{
      id: string;
      merchant_id: string;
      category_id: string | null;
      name: string;
      description: string | null;
      duration_minutes: number;
      price: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      max_concurrent_bookings: number;
      photos: string[];
      active: boolean;
      require_deposit: boolean;
      deposit_amount: number | null;
      deposit_percentage: number | null;
      allow_staff_selection: boolean;
      "order": number;
    }>`
      SELECT id, merchant_id, category_id, name, description, duration_minutes, price,
             buffer_before_minutes, buffer_after_minutes, max_concurrent_bookings, photos, active,
             require_deposit, deposit_amount, deposit_percentage, allow_staff_selection, "order"
      FROM services
      WHERE merchant_id = ${merchantId}
      ORDER BY "order" ASC, name ASC
    `;

    return {
      services: rows.map((row) => ({
        id: row.id,
        merchantId: row.merchant_id,
        categoryId: row.category_id ?? undefined,
        name: row.name,
        description: row.description ?? undefined,
        durationMinutes: row.duration_minutes,
        price: Number(row.price),
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
        maxConcurrentBookings: row.max_concurrent_bookings,
        photos: row.photos ?? [],
        active: row.active,
        requireDeposit: row.require_deposit,
        depositAmount: row.deposit_amount ? Number(row.deposit_amount) : undefined,
        depositPercentage: row.deposit_percentage ?? undefined,
        allowStaffSelection: row.allow_staff_selection,
        order: row.order,
      })),
    };
  },
);

export const getService = api(
  { expose: true, method: "GET", path: "/service/:serviceId" },
  async ({ serviceId }: { serviceId: string }): Promise<{ service: Service }> => {
    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      category_id: string | null;
      name: string;
      description: string | null;
      duration_minutes: number;
      price: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      max_concurrent_bookings: number;
      photos: string[];
      active: boolean;
      require_deposit: boolean;
      deposit_amount: number | null;
      deposit_percentage: number | null;
      allow_staff_selection: boolean;
      "order": number;
    }>`
      SELECT id, merchant_id, category_id, name, description, duration_minutes, price,
             buffer_before_minutes, buffer_after_minutes, max_concurrent_bookings, photos, active,
             require_deposit, deposit_amount, deposit_percentage, allow_staff_selection, "order"
      FROM services
      WHERE id = ${serviceId}
    `;

    if (!row) {
      throw APIError.notFound("Service not found");
    }

    return {
      service: {
        id: row.id,
        merchantId: row.merchant_id,
        categoryId: row.category_id ?? undefined,
        name: row.name,
        description: row.description ?? undefined,
        durationMinutes: row.duration_minutes,
        price: Number(row.price),
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
        maxConcurrentBookings: row.max_concurrent_bookings,
        photos: row.photos ?? [],
        active: row.active,
        requireDeposit: row.require_deposit,
        depositAmount: row.deposit_amount ? Number(row.deposit_amount) : undefined,
        depositPercentage: row.deposit_percentage ?? undefined,
        allowStaffSelection: row.allow_staff_selection,
        order: row.order,
      },
    };
  },
);

export const createService = api(
  { expose: true, method: "POST", path: "/service" },
  async (body: z.infer<typeof createServiceSchema>): Promise<{ service: Service }> => {
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const merchant = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const serviceId = randomUUID();

    await db.exec`
      INSERT INTO services (id, merchant_id, category_id, name, description, duration_minutes, price,
                           buffer_before_minutes, buffer_after_minutes, max_concurrent_bookings, photos, active,
                           require_deposit, deposit_amount, deposit_percentage, allow_staff_selection, "order")
      VALUES (
        ${serviceId},
        ${parsed.data.merchantId},
        ${parsed.data.categoryId ?? null},
        ${parsed.data.name},
        ${parsed.data.description ?? null},
        ${parsed.data.durationMinutes},
        ${parsed.data.price},
        ${parsed.data.bufferBeforeMinutes ?? 0},
        ${parsed.data.bufferAfterMinutes ?? 0},
        ${parsed.data.maxConcurrentBookings ?? 1},
        ${parsed.data.photos ?? []},
        ${parsed.data.active ?? true},
        ${parsed.data.requireDeposit ?? true},
        ${parsed.data.depositAmount ?? null},
        ${parsed.data.depositPercentage ?? null},
        ${parsed.data.allowStaffSelection ?? true},
        0
      )
    `;

    return {
      service: {
        id: serviceId,
        merchantId: parsed.data.merchantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        durationMinutes: parsed.data.durationMinutes,
        price: parsed.data.price,
        bufferBeforeMinutes: parsed.data.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: parsed.data.bufferAfterMinutes ?? 0,
        maxConcurrentBookings: parsed.data.maxConcurrentBookings ?? 1,
        photos: parsed.data.photos ?? [],
        active: parsed.data.active ?? true,
        requireDeposit: parsed.data.requireDeposit ?? true,
        depositAmount: parsed.data.depositAmount,
        depositPercentage: parsed.data.depositPercentage,
        allowStaffSelection: parsed.data.allowStaffSelection ?? true,
        order: 0,
      },
    };
  },
);

export const updateService = api(
  { expose: true, method: "PATCH", path: "/service/:serviceId" },
  async ({ serviceId, ...body }: { serviceId: string } & z.infer<typeof updateServiceSchema>): Promise<{ service: Service }> => {
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM services WHERE id = ${serviceId}
    `;

    if (!existing) {
      throw APIError.notFound("Service not found");
    }

    await db.exec`
      UPDATE services
      SET 
        category_id = COALESCE(${parsed.data.categoryId}, category_id),
        name = COALESCE(${parsed.data.name}, name),
        description = COALESCE(${parsed.data.description}, description),
        duration_minutes = COALESCE(${parsed.data.durationMinutes}, duration_minutes),
        price = COALESCE(${parsed.data.price}, price),
        buffer_before_minutes = COALESCE(${parsed.data.bufferBeforeMinutes}, buffer_before_minutes),
        buffer_after_minutes = COALESCE(${parsed.data.bufferAfterMinutes}, buffer_after_minutes),
        max_concurrent_bookings = COALESCE(${parsed.data.maxConcurrentBookings}, max_concurrent_bookings),
        photos = COALESCE(${parsed.data.photos}, photos),
        active = COALESCE(${parsed.data.active}, active),
        require_deposit = COALESCE(${parsed.data.requireDeposit}, require_deposit),
        deposit_amount = COALESCE(${parsed.data.depositAmount}, deposit_amount),
        deposit_percentage = COALESCE(${parsed.data.depositPercentage}, deposit_percentage),
        allow_staff_selection = COALESCE(${parsed.data.allowStaffSelection}, allow_staff_selection),
        updated_at = now()
      WHERE id = ${serviceId}
    `;

    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      category_id: string | null;
      name: string;
      description: string | null;
      duration_minutes: number;
      price: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      max_concurrent_bookings: number;
      photos: string[];
      active: boolean;
      require_deposit: boolean;
      deposit_amount: number | null;
      deposit_percentage: number | null;
      allow_staff_selection: boolean;
      "order": number;
    }>`
      SELECT id, merchant_id, category_id, name, description, duration_minutes, price,
             buffer_before_minutes, buffer_after_minutes, max_concurrent_bookings, photos, active,
             require_deposit, deposit_amount, deposit_percentage, allow_staff_selection, "order"
      FROM services
      WHERE id = ${serviceId}
    `;

    return {
      service: {
        id: row!.id,
        merchantId: row!.merchant_id,
        categoryId: row!.category_id ?? undefined,
        name: row!.name,
        description: row!.description ?? undefined,
        durationMinutes: row!.duration_minutes,
        price: Number(row!.price),
        bufferBeforeMinutes: row!.buffer_before_minutes,
        bufferAfterMinutes: row!.buffer_after_minutes,
        maxConcurrentBookings: row!.max_concurrent_bookings,
        photos: row!.photos ?? [],
        active: row!.active,
        requireDeposit: row!.require_deposit,
        depositAmount: row!.deposit_amount ? Number(row!.deposit_amount) : undefined,
        depositPercentage: row!.deposit_percentage ?? undefined,
        allowStaffSelection: row!.allow_staff_selection,
        order: row!.order,
      },
    };
  },
);

export const deleteService = api(
  { expose: true, method: "DELETE", path: "/service/:serviceId" },
  async ({ serviceId }: { serviceId: string }): Promise<{ ok: boolean }> => {
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM services WHERE id = ${serviceId}
    `;

    if (!existing) {
      throw APIError.notFound("Service not found");
    }

    await db.exec`
      UPDATE services SET active = FALSE, updated_at = now() WHERE id = ${serviceId}
    `;

    return { ok: true };
  },
);

// ============ SERVICE CATEGORIES ============

export const listServiceCategories = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/categories" },
  async ({ merchantId }: { merchantId: string }): Promise<{ categories: ServiceCategory[] }> => {
    const rows = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      icon: string | null;
      color: string | null;
      "order": number;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, icon, color, "order", active
      FROM service_categories
      WHERE merchant_id = ${merchantId}
      ORDER BY "order" ASC
    `;

    return {
      categories: rows.map((row) => ({
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        icon: row.icon ?? undefined,
        color: row.color ?? undefined,
        order: row.order,
        active: row.active,
      })),
    };
  },
);

export const createServiceCategory = api(
  { expose: true, method: "POST", path: "/service-category" },
  async (body: z.infer<typeof createServiceCategorySchema>): Promise<{ category: ServiceCategory }> => {
    const parsed = createServiceCategorySchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const categoryId = randomUUID();

    const maxOrder = await db.queryRow<{ max: number }>`
      SELECT COALESCE(MAX("order"), -1)::int AS max FROM service_categories WHERE merchant_id = ${parsed.data.merchantId}
    `;

    const order = (maxOrder?.max ?? -1) + 1;

    await db.exec`
      INSERT INTO service_categories (id, merchant_id, name, icon, color, "order", active)
      VALUES (${categoryId}, ${parsed.data.merchantId}, ${parsed.data.name}, ${parsed.data.icon ?? null}, ${parsed.data.color ?? null}, ${order}, true)
    `;

    return {
      category: {
        id: categoryId,
        merchantId: parsed.data.merchantId,
        name: parsed.data.name,
        icon: parsed.data.icon,
        color: parsed.data.color,
        order,
        active: true,
      },
    };
  },
);

export const deleteServiceCategory = api(
  { expose: true, method: "DELETE", path: "/service-category/:categoryId" },
  async ({ categoryId }: { categoryId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM service_categories WHERE id = ${categoryId}
    `;
    return { ok: true };
  },
);

// ============ STAFF MEMBERS ============

export const listMerchantStaff = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/staff" },
  async ({ merchantId }: { merchantId: string }): Promise<{ staff: StaffMember[] }> => {
    const rows = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      email: string | null;
      phone: string | null;
      photo: string | null;
      bio: string | null;
      active: boolean;
      commission_percentage: number | null;
    }>`
      SELECT id, merchant_id, name, email, phone, photo, bio, active, commission_percentage
      FROM staff_members
      WHERE merchant_id = ${merchantId}
      ORDER BY name ASC
    `;

    const staffServices = await db.queryAll<{
      staff_id: string;
      service_id: string;
    }>`
      SELECT ss.staff_id, ss.service_id
      FROM staff_services ss
      JOIN staff_members sm ON sm.id = ss.staff_id
      WHERE sm.merchant_id = ${merchantId}
    `;

    return {
      staff: rows.map((row) => ({
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        photo: row.photo ?? undefined,
        bio: row.bio ?? undefined,
        active: row.active,
        commissionPercentage: row.commission_percentage ?? undefined,
        services: staffServices.filter(ss => ss.staff_id === row.id).map(ss => ss.service_id),
      })),
    };
  },
);

export const getStaffMember = api(
  { expose: true, method: "GET", path: "/staff/:staffId" },
  async ({ staffId }: { staffId: string }): Promise<{ staff: StaffMember }> => {
    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      email: string | null;
      phone: string | null;
      photo: string | null;
      bio: string | null;
      active: boolean;
      commission_percentage: number | null;
    }>`
      SELECT id, merchant_id, name, email, phone, photo, bio, active, commission_percentage
      FROM staff_members
      WHERE id = ${staffId}
    `;

    if (!row) {
      throw APIError.notFound("Staff member not found");
    }

    const staffServices = await db.queryAll<{ service_id: string }>`
      SELECT service_id FROM staff_services WHERE staff_id = ${staffId}
    `;

    return {
      staff: {
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        photo: row.photo ?? undefined,
        bio: row.bio ?? undefined,
        active: row.active,
        commissionPercentage: row.commission_percentage ?? undefined,
        services: staffServices.map(ss => ss.service_id),
      },
    };
  },
);

export const createStaffMember = api(
  { expose: true, method: "POST", path: "/staff" },
  async (body: z.infer<typeof createStaffSchema>): Promise<{ staff: StaffMember }> => {
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const staffId = randomUUID();

    await db.exec`
      INSERT INTO staff_members (id, merchant_id, name, email, phone, photo, bio, active, commission_percentage)
      VALUES (
        ${staffId},
        ${parsed.data.merchantId},
        ${parsed.data.name},
        ${parsed.data.email ?? null},
        ${parsed.data.phone ?? null},
        ${parsed.data.photo ?? null},
        ${parsed.data.bio ?? null},
        true,
        ${parsed.data.commissionPercentage ?? null}
      )
    `;

    for (const serviceId of parsed.data.services) {
      await db.exec`
        INSERT INTO staff_services (staff_id, service_id)
        VALUES (${staffId}, ${serviceId})
      `;
    }

    for (let dow = 1; dow <= 5; dow++) {
      await db.exec`
        INSERT INTO staff_availability (id, staff_id, day_of_week, start_time, end_time)
        VALUES (${randomUUID()}, ${staffId}, ${dow}, '09:00', '18:00')
      `;
    }

    return {
      staff: {
        id: staffId,
        merchantId: parsed.data.merchantId,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        photo: parsed.data.photo,
        bio: parsed.data.bio,
        active: true,
        commissionPercentage: parsed.data.commissionPercentage,
        services: parsed.data.services,
      },
    };
  },
);

export const updateStaffMember = api(
  { expose: true, method: "PATCH", path: "/staff/:staffId" },
  async ({ staffId, ...body }: { staffId: string } & z.infer<typeof updateStaffSchema>): Promise<{ staff: StaffMember }> => {
    const parsed = updateStaffSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const existing = await db.queryRow<{ id: string; merchant_id: string }>`
      SELECT id, merchant_id FROM staff_members WHERE id = ${staffId}
    `;

    if (!existing) {
      throw APIError.notFound("Staff member not found");
    }

    await db.exec`
      UPDATE staff_members
      SET 
        name = COALESCE(${parsed.data.name}, name),
        email = COALESCE(${parsed.data.email}, email),
        phone = COALESCE(${parsed.data.phone}, phone),
        photo = COALESCE(${parsed.data.photo}, photo),
        bio = COALESCE(${parsed.data.bio}, bio),
        active = COALESCE(${parsed.data.active}, active),
        commission_percentage = COALESCE(${parsed.data.commissionPercentage}, commission_percentage),
        updated_at = now()
      WHERE id = ${staffId}
    `;

    if (parsed.data.services !== undefined) {
      await db.exec`
        DELETE FROM staff_services WHERE staff_id = ${staffId}
      `;
      for (const serviceId of parsed.data.services) {
        await db.exec`
          INSERT INTO staff_services (staff_id, service_id)
          VALUES (${staffId}, ${serviceId})
        `;
      }
    }

    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      email: string | null;
      phone: string | null;
      photo: string | null;
      bio: string | null;
      active: boolean;
      commission_percentage: number | null;
    }>`
      SELECT id, merchant_id, name, email, phone, photo, bio, active, commission_percentage
      FROM staff_members
      WHERE id = ${staffId}
    `;

    const staffServices = await db.queryAll<{ service_id: string }>`
      SELECT service_id FROM staff_services WHERE staff_id = ${staffId}
    `;

    return {
      staff: {
        id: row!.id,
        merchantId: row!.merchant_id,
        name: row!.name,
        email: row!.email ?? undefined,
        phone: row!.phone ?? undefined,
        photo: row!.photo ?? undefined,
        bio: row!.bio ?? undefined,
        active: row!.active,
        commissionPercentage: row!.commission_percentage ?? undefined,
        services: staffServices.map(ss => ss.service_id),
      },
    };
  },
);

export const deleteStaffMember = api(
  { expose: true, method: "DELETE", path: "/staff/:staffId" },
  async ({ staffId }: { staffId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      UPDATE staff_members SET active = FALSE, updated_at = now() WHERE id = ${staffId}
    `;
    return { ok: true };
  },
);

// ============ STAFF AVAILABILITY ============

export const listStaffAvailability = api(
  { expose: true, method: "GET", path: "/staff/:staffId/availability" },
  async ({ staffId }: { staffId: string }): Promise<{ availability: StaffAvailability[] }> => {
    const rows = await db.queryAll<{
      id: string;
      staff_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      break_start: string | null;
      break_end: string | null;
    }>`
      SELECT id, staff_id, day_of_week, start_time, end_time, break_start, break_end
      FROM staff_availability
      WHERE staff_id = ${staffId}
      ORDER BY day_of_week, start_time
    `;

    return {
      availability: rows.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        breakStart: row.break_start ?? undefined,
        breakEnd: row.break_end ?? undefined,
      })),
    };
  },
);

export const setStaffAvailability = api(
  { expose: true, method: "POST", path: "/staff/:staffId/availability/set" },
  async ({ staffId, availability }: { staffId: string; availability: z.infer<typeof createAvailabilitySchema>[] }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM staff_availability WHERE staff_id = ${staffId}
    `;

    for (const rule of availability) {
      await db.exec`
        INSERT INTO staff_availability (id, staff_id, day_of_week, start_time, end_time, break_start, break_end)
        VALUES (
          ${randomUUID()},
          ${staffId},
          ${rule.dayOfWeek},
          ${rule.startTime},
          ${rule.endTime},
          ${rule.breakStart ?? null},
          ${rule.breakEnd ?? null}
        )
      `;
    }

    return { ok: true };
  },
);

// ============ STAFF BLOCKS ============

export const listStaffBlocks = api(
  { expose: true, method: "GET", path: "/staff/:staffId/blocks" },
  async ({ staffId }: { staffId: string }): Promise<{ blocks: StaffBlock[] }> => {
    const rows = await db.queryAll<{
      id: string;
      staff_id: string;
      start_time: Date;
      end_time: Date;
      reason: StaffBlock["reason"];
      notes: string | null;
    }>`
      SELECT id, staff_id, start_time, end_time, reason, notes
      FROM staff_blocks
      WHERE staff_id = ${staffId} AND end_time > now()
      ORDER BY start_time ASC
    `;

    return {
      blocks: rows.map((row) => ({
        id: row.id,
        staffId: row.staff_id,
        startTime: row.start_time.toISOString(),
        endTime: row.end_time.toISOString(),
        reason: row.reason,
        notes: row.notes ?? undefined,
      })),
    };
  },
);

export const createStaffBlock = api(
  { expose: true, method: "POST", path: "/staff-block" },
  async (body: z.infer<typeof createBlockSchema>): Promise<{ block: StaffBlock }> => {
    const parsed = createBlockSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const blockId = randomUUID();

    await db.exec`
      INSERT INTO staff_blocks (id, staff_id, start_time, end_time, reason, notes)
      VALUES (
        ${blockId},
        ${parsed.data.staffId},
        ${parsed.data.startTime}::timestamptz,
        ${parsed.data.endTime}::timestamptz,
        ${parsed.data.reason},
        ${parsed.data.notes ?? null}
      )
    `;

    return {
      block: {
        id: blockId,
        staffId: parsed.data.staffId,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
      },
    };
  },
);

export const deleteStaffBlock = api(
  { expose: true, method: "DELETE", path: "/staff-block/:blockId" },
  async ({ blockId }: { blockId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM staff_blocks WHERE id = ${blockId}
    `;
    return { ok: true };
  },
);

// ============ AVAILABLE SLOTS ============

export const getAvailableSlots = api(
  { expose: true, method: "GET", path: "/service/:serviceId/slots/:date" },
  async ({ serviceId, date, staffId }: { serviceId: string; date: string; staffId?: string }): Promise<{ slots: TimeSlot[] }> => {
    const service = await db.queryRow<{
      id: string;
      duration_minutes: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      merchant_id: string;
    }>`
      SELECT id, duration_minutes, buffer_before_minutes, buffer_after_minutes, merchant_id
      FROM services
      WHERE id = ${serviceId} AND active = TRUE
    `;

    if (!service) {
      throw APIError.notFound("Service not found or inactive");
    }

    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    let eligibleStaff: { id: string; name: string }[] = [];

    if (staffId) {
      const staff = await db.queryRow<{ id: string; name: string }>`
        SELECT id, name FROM staff_members WHERE id = ${staffId} AND active = TRUE
      `;
      if (staff) {
        eligibleStaff = [staff];
      }
    } else {
      const staffRows = await db.queryAll<{ id: string; name: string }>`
        SELECT sm.id, sm.name
        FROM staff_members sm
        JOIN staff_services ss ON ss.staff_id = sm.id
        WHERE ss.service_id = ${serviceId} AND sm.active = TRUE
      `;
      eligibleStaff = staffRows;
    }

    if (eligibleStaff.length === 0) {
      const defaultStaff = await db.queryAll<{ id: string; name: string }>`
        SELECT id, name FROM staff_members 
        WHERE merchant_id = ${service.merchant_id} AND active = TRUE
      `;
      eligibleStaff = defaultStaff;
    }

    const slots: TimeSlot[] = [];
    const slotDuration = service.duration_minutes;

    for (const staff of eligibleStaff) {
      const availability = await db.queryAll<{
        start_time: string;
        end_time: string;
        break_start: string | null;
        break_end: string | null;
      }>`
        SELECT start_time, end_time, break_start, break_end
        FROM staff_availability
        WHERE staff_id = ${staff.id} AND day_of_week = ${dayOfWeek}
      `;

      if (availability.length === 0) continue;

      const bookings = await db.queryAll<{
        start_time: string;
        end_time: string;
      }>`
        SELECT start_time, end_time
        FROM bookings
        WHERE staff_id = ${staff.id}
          AND booking_date = ${date}::date
          AND status NOT IN ('cancelled', 'no_show')
      `;

      const blocks = await db.queryAll<{
        start_time: Date;
        end_time: Date;
      }>`
        SELECT start_time, end_time
        FROM staff_blocks
        WHERE staff_id = ${staff.id}
          AND start_time < ${date}::date + INTERVAL '1 day'
          AND end_time > ${date}::date
      `;

      for (const rule of availability) {
        const [startH, startM] = rule.start_time.split(":").map(Number);
        const [endH, endM] = rule.end_time.split(":").map(Number);
        const breakStart = rule.break_start ? rule.break_start.split(":").map(Number) : null;
        const breakEnd = rule.break_end ? rule.break_end.split(":").map(Number) : null;

        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + slotDuration <= endMinutes) {
          const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
          const slotEndMinutes = currentMinutes + slotDuration;
          const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, "0")}:${String(slotEndMinutes % 60).padStart(2, "0")}`;

          const slotStartMinutes = currentMinutes;
          const slotEndMinutesVal = slotEndMinutes;

          let isBreak = false;
          if (breakStart && breakEnd) {
            const breakStartMinutes = breakStart[0] * 60 + breakStart[1];
            const breakEndMinutes = breakEnd[0] * 60 + breakEnd[1];
            isBreak = slotStartMinutes < breakEndMinutes && slotEndMinutesVal > breakStartMinutes;
          }

          const isBooked = bookings.some((b) => {
            const bookedStart = b.start_time.split(":").map(Number);
            const bookedEnd = b.end_time.split(":").map(Number);
            const bookedStartMinutes = bookedStart[0] * 60 + bookedStart[1];
            const bookedEndMinutes = bookedEnd[0] * 60 + bookedEnd[1];
            return slotStartMinutes < bookedEndMinutes && slotEndMinutesVal > bookedStartMinutes;
          });

          const isBlocked = blocks.some((b) => {
            const blockStart = b.start_time;
            const blockEnd = b.end_time;
            const slotStartISO = new Date(`${date}T${slotStart}:00`);
            const slotEndISO = new Date(`${date}T${slotEnd}:00`);
            return slotStartISO < blockEnd && slotEndISO > blockStart;
          });

          if (!isBreak && !isBooked && !isBlocked) {
            slots.push({
              startTime: slotStart,
              endTime: slotEnd,
              available: true,
              staffId: staff.id,
              staffName: staff.name,
            });
          }

          currentMinutes += 15;
        }
      }
    }

    const mergedSlots = slots.reduce((acc, slot) => {
      const existing = acc.find(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
      if (!existing) {
        acc.push(slot);
      }
      return acc;
    }, [] as TimeSlot[]);

    return { slots: mergedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)) };
  },
);

export const getStaffAvailableSlots = api(
  { expose: true, method: "GET", path: "/staff/:staffId/slots/:serviceId/:date" },
  async ({ staffId, serviceId, date }: { staffId: string; serviceId: string; date: string }): Promise<{ slots: TimeSlot[] }> => {
    return getAvailableSlots({ serviceId, date, staffId });
  },
);

export const getStaffSchedule = api(
  { expose: true, method: "GET", path: "/staff/:staffId/schedule" },
  async ({ staffId, fromDate, toDate }: { staffId: string; fromDate: string; toDate: string }): Promise<{ bookings: Booking[]; blocks: StaffBlock[] }> => {
    const bookingRows = await db.queryAll<{
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
      service_name: string;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount, b.notes,
             s.name as service_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.staff_id = ${staffId}
        AND b.booking_date >= ${fromDate}::date
        AND b.booking_date <= ${toDate}::date
        AND b.status NOT IN ('cancelled', 'no_show')
      ORDER BY b.booking_date, b.start_time
    `;

    const blockRows = await db.queryAll<{
      id: string;
      staff_id: string;
      start_time: Date;
      end_time: Date;
      reason: StaffBlock["reason"];
      notes: string | null;
    }>`
      SELECT id, staff_id, start_time, end_time, reason, notes
      FROM staff_blocks
      WHERE staff_id = ${staffId}
        AND start_time >= ${fromDate}::date
        AND end_time <= ${toDate}::date + INTERVAL '1 day'
      ORDER BY start_time
    `;

    return {
      bookings: bookingRows.map(row => ({
        id: row.id,
        serviceId: row.service_id,
        staffId: row.staff_id ?? undefined,
        merchantId: row.merchant_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email ?? undefined,
        bookingDate: row.booking_date.toISOString().split('T')[0],
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        depositAmount: Number(row.deposit_amount),
        totalAmount: Number(row.total_amount),
        notes: row.notes ?? undefined,
        serviceName: row.service_name,
        loyaltyPointsEarned: 0,
        paymentId: null,
      })),
      blocks: blockRows.map(row => ({
        id: row.id,
        staffId: row.staff_id,
        startTime: row.start_time.toISOString(),
        endTime: row.end_time.toISOString(),
        reason: row.reason,
        notes: row.notes ?? undefined,
      })),
    };
  },
);

// ============ PAYMENTS ============

export const listMerchantPayments = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/payments" },
  async ({ merchantId }: { merchantId: string }): Promise<{ payments: Payment[] }> => {
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
      paid_at: Date | null;
      created_at: Date;
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
        paidAt: row.paid_at?.toISOString(),
        createdAt: row.created_at.toISOString(),
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

export const paymentWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/payment" },
  async (body: { type?: string; action?: string; data?: { id: string } }) => {
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      return { ok: true, processed: false, reason: "no_payment_id" };
    }

    if (body.type !== "payment" && body.action !== "payment.updated") {
      return { ok: true, processed: false, reason: "ignored_type" };
    }

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
      WHERE provider_payment_id = ${paymentId}
    `;

    if (!payment) {
      return { ok: true, processed: false, reason: "payment_not_found" };
    }

    if (payment.status === "approved") {
      return { ok: true, processed: false, reason: "already_approved" };
    }

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
        SET status = 'approved', paid_at = now(), updated_at = now()
        WHERE id = ${payment.id}
      `;

      await db.exec`
        UPDATE bookings
        SET status = 'confirmed', updated_at = now()
        WHERE id = ${payment.booking_id} AND status = 'pending_payment'
      `;

      const booking = await db.queryRow<{
        customer_id: string | null;
        total_amount: number | null;
        merchant_id: string;
      }>`
        SELECT customer_id, total_amount, merchant_id FROM bookings WHERE id = ${payment.booking_id}
      `;

      if (booking?.customer_id && booking.total_amount) {
        await db.exec`
          UPDATE customers
          SET total_spent = COALESCE(total_spent, 0) + ${booking.total_amount},
              total_bookings = COALESCE(total_bookings, 0) + 1,
              last_visit = CURRENT_DATE,
              updated_at = now()
          WHERE id = ${booking.customer_id}
        `;
      }

      return { ok: true, processed: true, action: "approved" };
    } else if (status === "rejected" || status === "cancelled") {
      await db.exec`
        UPDATE payments
        SET status = 'rejected', updated_at = now()
        WHERE id = ${payment.id}
      `;

      await db.exec`
        UPDATE bookings
        SET status = 'cancelled', updated_at = now()
        WHERE id = ${payment.booking_id} AND status = 'pending_payment'
      `;

      return { ok: true, processed: true, action: "rejected" };
    } else if (status === "expired") {
      await db.exec`
        UPDATE payments
        SET status = 'expired', updated_at = now()
        WHERE id = ${payment.id}
      `;

      return { ok: true, processed: true, action: "expired" };
    }

    return { ok: true, processed: false, reason: "status_unchanged" };
  },
);

// ============ REPORTS ============

export const getReportsSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/reports/summary" },
  async ({ merchantId, period }: { merchantId: string; period?: "day" | "week" | "month" }) => {
    const periodFilter = period ?? "month";

    let dateFilter: string;
    if (periodFilter === "day") {
      dateFilter = "booking_date = CURRENT_DATE";
    } else if (periodFilter === "week") {
      dateFilter = "booking_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else {
      dateFilter = "DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)";
    }

    const stats = await db.queryRow<{
      total_bookings: number;
      confirmed_bookings: number;
      cancelled_bookings: number;
      no_show_count: number;
      total_revenue: number;
      pending_revenue: number;
      avg_booking_value: number;
    }>`
      SELECT
        COUNT(*)::int AS total_bookings,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'in_progress', 'completed'))::int AS confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_show_count,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS total_revenue,
        COALESCE(SUM(deposit_amount) FILTER (WHERE status = 'pending_payment'), 0)::numeric AS pending_revenue,
        COALESCE(AVG(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS avg_booking_value
      FROM bookings
      WHERE merchant_id = ${merchantId} AND ${dateFilter}
    `;

    const topServices = await db.queryAll<{
      service_id: string;
      service_name: string;
      booking_count: number;
      revenue: number;
    }>`
      SELECT 
        s.id AS service_id,
        s.name AS service_name,
        COUNT(b.id)::int AS booking_count,
        COALESCE(SUM(b.total_amount), 0)::numeric AS revenue
      FROM services s
      LEFT JOIN bookings b ON b.service_id = s.id 
        AND b.merchant_id = ${merchantId}
        AND b.status IN ('confirmed', 'completed')
        AND ${dateFilter}
      WHERE s.merchant_id = ${merchantId}
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
      LIMIT 5
    `;

    const topStaff = await db.queryAll<{
      staff_id: string;
      staff_name: string;
      booking_count: number;
      revenue: number;
      commission: number;
    }>`
      SELECT 
        sm.id AS staff_id,
        sm.name AS staff_name,
        COUNT(b.id)::int AS booking_count,
        COALESCE(SUM(b.total_amount), 0)::numeric AS revenue,
        COALESCE(SUM(b.total_amount * COALESCE(sm.commission_percentage, 0) / 100), 0)::numeric AS commission
      FROM staff_members sm
      LEFT JOIN bookings b ON b.staff_id = sm.id 
        AND b.merchant_id = ${merchantId}
        AND b.status IN ('confirmed', 'completed')
        AND ${dateFilter}
      WHERE sm.merchant_id = ${merchantId}
      GROUP BY sm.id, sm.name
      ORDER BY booking_count DESC
      LIMIT 5
    `;

    const dailyBreakdown = await db.queryAll<{
      date: Date;
      bookings: number;
      revenue: number;
    }>`
      SELECT 
        booking_date AS date,
        COUNT(*)::int AS bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS revenue
      FROM bookings
      WHERE merchant_id = ${merchantId} AND ${dateFilter}
      GROUP BY booking_date
      ORDER BY booking_date ASC
    `;

    return {
      period: periodFilter,
      totalBookings: stats?.total_bookings ?? 0,
      confirmedBookings: stats?.confirmed_bookings ?? 0,
      cancelledBookings: stats?.cancelled_bookings ?? 0,
      noShowCount: stats?.no_show_count ?? 0,
      totalRevenue: Number(stats?.total_revenue ?? 0),
      pendingRevenue: Number(stats?.pending_revenue ?? 0),
      avgBookingValue: Number(stats?.avg_booking_value ?? 0),
      noShowRate: stats?.total_bookings 
        ? Math.round((stats.no_show_count / stats.total_bookings) * 100) 
        : 0,
      topServices: topServices.map(s => ({
        serviceId: s.service_id,
        serviceName: s.service_name,
        bookingCount: s.booking_count,
        revenue: Number(s.revenue),
      })),
      topStaff: topStaff.map(s => ({
        staffId: s.staff_id,
        staffName: s.staff_name,
        bookingCount: s.booking_count,
        revenue: Number(s.revenue),
        commission: Number(s.commission),
      })),
      dailyBreakdown: dailyBreakdown.map(d => ({
        date: d.date.toISOString().split('T')[0],
        bookings: d.bookings,
        revenue: Number(d.revenue),
      })),
    };
  },
);

// ============ CUSTOMERS ============

export const getCustomersList = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/customers" },
  async ({ merchantId, search, limit, offset }: { merchantId: string; search?: string; limit?: number; offset?: number }) => {
    const searchPattern = search ? `%${search}%` : null;
    const pageSize = Math.min(limit ?? 50, 100);
    const pageOffset = offset ?? 0;

    const countRow = await db.queryRow<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM customers c
      WHERE c.merchant_id = ${merchantId}
        AND (${searchPattern}::text IS NULL OR c.name ILIKE ${searchPattern} OR c.phone ILIKE ${searchPattern})
    `;

    const rows = await db.queryAll<{
      id: string;
      name: string;
      phone: string;
      email: string | null;
      total_bookings: number;
      total_spent: number;
      last_visit: Date | null;
    }>`
      SELECT 
        c.id, c.name, c.phone, c.email,
        COALESCE(c.total_bookings, 0) AS total_bookings,
        COALESCE(c.total_spent, 0) AS total_spent,
        c.last_visit
      FROM customers c
      WHERE c.merchant_id = ${merchantId}
        AND (${searchPattern}::text IS NULL OR c.name ILIKE ${searchPattern} OR c.phone ILIKE ${searchPattern})
      ORDER BY c.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${pageOffset}
    `;

    return {
      customers: rows.map((row) => ({
        id: row.id,
        merchantId,
        name: row.name,
        phone: row.phone,
        email: row.email ?? undefined,
        totalBookings: row.total_bookings,
        totalSpent: Number(row.total_spent),
        lastVisit: row.last_visit?.toISOString().split('T')[0],
      })),
      total: countRow?.total ?? 0,
      hasMore: (countRow?.total ?? 0) > pageOffset + pageSize,
    };
  },
);

export const getCustomerHistory = api(
  { expose: true, method: "GET", path: "/customer/:customerId/history" },
  async ({ customerId }: { customerId: string }) => {
    const customer = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      phone: string;
      email: string | null;
      document: string | null;
      birth_date: Date | null;
      notes: string | null;
      loyalty_points: number;
      total_bookings: number;
      total_spent: number;
      last_visit: Date | null;
    }>`
      SELECT id, merchant_id, name, phone, email, document, birth_date, notes, loyalty_points, total_bookings, total_spent, last_visit
      FROM customers
      WHERE id = ${customerId}
    `;

    if (!customer) {
      throw APIError.notFound("Customer not found");
    }

    const noShowCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM bookings
      WHERE customer_id = ${customerId} AND status = 'no_show'
    `;

    const bookings = await db.queryAll<{
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
      service_name: string;
      staff_name: string | null;
    }>`
      SELECT b.id, b.service_id, b.staff_id, b.merchant_id, b.customer_name, b.customer_phone, b.customer_email,
             b.booking_date, b.start_time, b.end_time, b.status, b.deposit_amount, b.total_amount, b.notes,
             s.name as service_name, sm.name as staff_name
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN staff_members sm ON sm.id = b.staff_id
      WHERE b.customer_id = ${customerId}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT 50
    `;

    const tags = await db.queryAll<{
      id: string;
      name: string;
      color: string;
    }>`
      SELECT t.id, t.name, t.color
      FROM customer_tags t
      JOIN customer_tag_assignments cta ON cta.tag_id = t.id
      WHERE cta.customer_id = ${customerId}
    `;

    return {
      customer: {
        id: customer.id,
        merchantId: customer.merchant_id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? undefined,
        document: customer.document ?? undefined,
        birthDate: customer.birth_date?.toISOString().split('T')[0],
        notes: customer.notes ?? undefined,
        loyaltyPoints: customer.loyalty_points,
        totalBookings: customer.total_bookings,
        totalSpent: Number(customer.total_spent),
        lastVisit: customer.last_visit?.toISOString().split('T')[0],
      },
      stats: {
        totalBookings: customer.total_bookings,
        totalSpent: Number(customer.total_spent),
        noShowCount: noShowCount?.count ?? 0,
      },
      tags: tags.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        merchantId: customer.merchant_id,
      })),
      bookings: bookings.map(b => ({
        id: b.id,
        serviceId: b.service_id,
        staffId: b.staff_id ?? undefined,
        merchantId: b.merchant_id,
        customerName: b.customer_name,
        customerPhone: b.customer_phone,
        customerEmail: b.customer_email ?? undefined,
        bookingDate: b.booking_date.toISOString().split('T')[0],
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status,
        depositAmount: Number(b.deposit_amount),
        totalAmount: Number(b.total_amount),
        notes: b.notes ?? undefined,
        serviceName: b.service_name,
        staffName: b.staff_name ?? undefined,
        loyaltyPointsEarned: 0,
        paymentId: null,
      })),
    };
  },
);

// ============ CUSTOMER TAGS ============

export const listCustomerTags = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/customer-tags" },
  async ({ merchantId }: { merchantId: string }): Promise<{ tags: CustomerTag[] }> => {
    const rows = await db.queryAll<{
      id: string;
      name: string;
      color: string;
    }>`
      SELECT id, name, color
      FROM customer_tags
      WHERE merchant_id = ${merchantId}
      ORDER BY name
    `;

    return {
      tags: rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        merchantId,
      })),
    };
  },
);

export const createCustomerTag = api(
  { expose: true, method: "POST", path: "/customer-tag" },
  async ({ merchantId, name, color }: { merchantId: string; name: string; color: string }): Promise<{ tag: CustomerTag }> => {
    const tagId = randomUUID();
    const tagColor = color || "#FFB800";

    await db.exec`
      INSERT INTO customer_tags (id, merchant_id, name, color)
      VALUES (${tagId}, ${merchantId}, ${name}, ${tagColor})
    `;

    return {
      tag: {
        id: tagId,
        name,
        color: tagColor,
        merchantId,
      },
    };
  },
);

export const deleteCustomerTag = api(
  { expose: true, method: "DELETE", path: "/customer-tag/:tagId" },
  async ({ tagId }: { tagId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM customer_tag_assignments WHERE tag_id = ${tagId}
    `;
    await db.exec`
      DELETE FROM customer_tags WHERE id = ${tagId}
    `;
    return { ok: true };
  },
);

export const assignTagToCustomer = api(
  { expose: true, method: "POST", path: "/customer/:customerId/tags" },
  async ({ customerId, tagId }: { customerId: string; tagId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      INSERT INTO customer_tag_assignments (customer_id, tag_id)
      VALUES (${customerId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;
    return { ok: true };
  },
);

export const removeTagFromCustomer = api(
  { expose: true, method: "DELETE", path: "/customer/:customerId/tags/:tagId" },
  async ({ customerId, tagId }: { customerId: string; tagId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM customer_tag_assignments 
      WHERE customer_id = ${customerId} AND tag_id = ${tagId}
    `;
    return { ok: true };
  },
);

export const getServiceTemplates = api(
  { expose: true, method: "GET", path: "/service-templates" },
  async (): Promise<{ templates: typeof serviceTemplates }> => {
    return { templates: serviceTemplates };
  },
);