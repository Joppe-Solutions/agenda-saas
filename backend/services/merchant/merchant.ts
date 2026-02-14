import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { upsertMerchantSchema, createResourceSchema, updateResourceSchema, createAvailabilityRuleSchema, createBlockSchema } from "../shared/validators";
import { createPixPayment, verifyPaymentStatus, PaymentProvider } from "./gateway";
import type { Resource, Merchant, Payment, AvailabilityRule, Block, Booking, TimeSlot } from "../shared/types";
import { resourceTemplates } from "../shared/types";

interface GetPublicMerchantParams {
  slug: string;
}

interface UpsertMerchantBody {
  id: string;
  slug: string;
  businessName: string;
  niche: "FISHING" | "SPORTS" | "TOURISM" | "SERVICES";
  whatsappNumber: string;
  pixKey: string;
  email?: string;
  mercadoPagoAccessToken?: string;
  address?: string;
  city?: string;
  signalPercentage?: number;
  signalDeadlineMinutes?: number;
  signalAutoCancel?: boolean;
}

interface DashboardParams {
  merchantId: string;
}

export const getPublicMerchant = api(
  { expose: true, method: "GET", path: "/public/merchant/:slug" },
  async ({ slug }: GetPublicMerchantParams): Promise<{ merchant: Merchant; resources: Resource[] }> => {
    const merchant = await db.queryRow<{
      id: string;
      slug: string;
      business_name: string;
      niche: Merchant["niche"];
      whatsapp_number: string;
      pix_key: string;
      email: string | null;
      signal_percentage: number;
      signal_deadline_minutes: number;
      signal_auto_cancel: boolean;
    }>`
      SELECT id, slug, business_name, niche, whatsapp_number, pix_key, email, 
             signal_percentage, signal_deadline_minutes, signal_auto_cancel
      FROM merchants
      WHERE slug = ${slug}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const resources = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      resource_type: Resource["resourceType"];
      capacity: number;
      base_price: number;
      pricing_type: Resource["pricingType"];
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      photos: string[];
      terms: string | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, resource_type, capacity, base_price, pricing_type, 
             duration_minutes, buffer_before_minutes, buffer_after_minutes, photos, terms, active
      FROM resources
      WHERE merchant_id = ${merchant.id} AND active = TRUE
      ORDER BY name ASC
    `;

    return {
      merchant: {
        id: merchant.id,
        slug: merchant.slug,
        businessName: merchant.business_name,
        niche: merchant.niche,
        whatsappNumber: merchant.whatsapp_number,
        pixKey: merchant.pix_key,
        email: merchant.email ?? undefined,
        signalPercentage: merchant.signal_percentage,
        signalDeadlineMinutes: merchant.signal_deadline_minutes,
        signalAutoCancel: merchant.signal_auto_cancel,
      },
      resources: resources.map((item) => ({
        id: item.id,
        merchantId: item.merchant_id,
        name: item.name,
        description: item.description ?? undefined,
        resourceType: item.resource_type,
        capacity: item.capacity,
        basePrice: Number(item.base_price),
        pricingType: item.pricing_type,
        durationMinutes: item.duration_minutes ?? undefined,
        bufferBeforeMinutes: item.buffer_before_minutes,
        bufferAfterMinutes: item.buffer_after_minutes,
        photos: item.photos ?? [],
        terms: item.terms ?? undefined,
        active: item.active,
      })),
    };
  },
);

export const getMerchantProfile = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/profile" },
  async ({ merchantId }: { merchantId: string }): Promise<{ merchant: Merchant }> => {
    const merchant = await db.queryRow<{
      id: string;
      slug: string;
      business_name: string;
      niche: Merchant["niche"];
      whatsapp_number: string;
      pix_key: string;
      email: string | null;
      mercado_pago_access_token: string | null;
      address: string | null;
      city: string | null;
      signal_percentage: number;
      signal_deadline_minutes: number;
      signal_auto_cancel: boolean;
    }>`
      SELECT id, slug, business_name, niche, whatsapp_number, pix_key, email, 
             mercado_pago_access_token, address, city,
             signal_percentage, signal_deadline_minutes, signal_auto_cancel
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
        niche: merchant.niche,
        whatsappNumber: merchant.whatsapp_number,
        pixKey: merchant.pix_key,
        email: merchant.email ?? undefined,
        mercadoPagoAccessToken: merchant.mercado_pago_access_token ?? undefined,
        address: merchant.address ?? undefined,
        city: merchant.city ?? undefined,
        signalPercentage: merchant.signal_percentage,
        signalDeadlineMinutes: merchant.signal_deadline_minutes,
        signalAutoCancel: merchant.signal_auto_cancel,
      },
    };
  },
);

export const upsertMerchantProfile = api(
  { expose: true, method: "POST", path: "/merchant/profile" },
  async (body: UpsertMerchantBody) => {
    const parsed = upsertMerchantSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    await db.exec`
      INSERT INTO merchants (id, slug, business_name, niche, whatsapp_number, pix_key, email, 
                             mercado_pago_access_token, address, city, signal_percentage, signal_deadline_minutes, signal_auto_cancel)
      VALUES (${parsed.data.id}, ${parsed.data.slug}, ${parsed.data.businessName}, ${parsed.data.niche}, 
              ${parsed.data.whatsappNumber}, ${parsed.data.pixKey}, ${parsed.data.email ?? null}, 
              ${parsed.data.mercadoPagoAccessToken ?? null}, ${parsed.data.address ?? null}, ${parsed.data.city ?? null},
              ${parsed.data.signalPercentage ?? 50}, ${parsed.data.signalDeadlineMinutes ?? 120}, ${parsed.data.signalAutoCancel ?? true})
      ON CONFLICT (id)
      DO UPDATE SET
        slug = EXCLUDED.slug,
        business_name = EXCLUDED.business_name,
        niche = EXCLUDED.niche,
        whatsapp_number = EXCLUDED.whatsapp_number,
        pix_key = EXCLUDED.pix_key,
        email = COALESCE(EXCLUDED.email, merchants.email),
        mercado_pago_access_token = COALESCE(EXCLUDED.mercado_pago_access_token, merchants.mercado_pago_access_token),
        address = COALESCE(EXCLUDED.address, merchants.address),
        city = COALESCE(EXCLUDED.city, merchants.city),
        signal_percentage = COALESCE(EXCLUDED.signal_percentage, merchants.signal_percentage),
        signal_deadline_minutes = COALESCE(EXCLUDED.signal_deadline_minutes, merchants.signal_deadline_minutes),
        signal_auto_cancel = COALESCE(EXCLUDED.signal_auto_cancel, merchants.signal_auto_cancel),
        updated_at = now()
    `;

    return { ok: true };
  },
);

export const updateSignalConfig = api(
  { expose: true, method: "PATCH", path: "/merchant/:merchantId/signal-config" },
  async ({ merchantId, signalPercentage, signalDeadlineMinutes, signalAutoCancel }: { 
    merchantId: string; 
    signalPercentage?: number;
    signalDeadlineMinutes?: number;
    signalAutoCancel?: boolean;
  }) => {
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${merchantId}
    `;

    if (!existing) {
      throw APIError.notFound("Merchant not found");
    }

    await db.exec`
      UPDATE merchants
      SET 
        signal_percentage = COALESCE(${signalPercentage}, signal_percentage),
        signal_deadline_minutes = COALESCE(${signalDeadlineMinutes}, signal_deadline_minutes),
        signal_auto_cancel = COALESCE(${signalAutoCancel}, signal_auto_cancel),
        updated_at = now()
      WHERE id = ${merchantId}
    `;

    return { ok: true };
  },
);

interface ClerkWebhookBody {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: Record<string, unknown>;
  };
}

export const clerkWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/clerk" },
  async (body: ClerkWebhookBody) => {
    const parsed = body;

    if (parsed.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = parsed.data;
      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "Meu Negócio";

      const baseSlug = id.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
      let slug = baseSlug;
      let counter = 1;

      const existing = await db.queryRow<{ slug: string }>`
        SELECT slug FROM merchants WHERE slug = ${slug}
      `;

      while (existing) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        const checkAgain = await db.queryRow<{ slug: string }>`
          SELECT slug FROM merchants WHERE slug = ${slug}
        `;
        if (!checkAgain) break;
      }

      await db.exec`
        INSERT INTO merchants (id, slug, business_name, niche, whatsapp_number, pix_key, email, 
                               signal_percentage, signal_deadline_minutes, signal_auto_cancel)
        VALUES (${id}, ${slug}, ${name}, 'SERVICES', '', '', ${email ?? null}, 50, 120, true)
      `;

      return { ok: true, created: true };
    }

    if (parsed.type === "user.deleted") {
      await db.exec`
        DELETE FROM merchants WHERE id = ${parsed.data.id}
      `;
      return { ok: true, deleted: true };
    }

    return { ok: true };
  },
);

export const getMerchantDashboardSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/dashboard" },
  async ({ merchantId }: DashboardParams) => {
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

    const resourcesCount = await db.queryRow<{ total: number; active: number }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE active = TRUE)::int AS active
      FROM resources
      WHERE merchant_id = ${merchantId}
    `;

    return {
      bookingsToday: today?.bookings_today ?? 0,
      pendingToday: today?.pending_today ?? 0,
      monthRevenue: Number(today?.month_revenue ?? 0),
      pendingBookings: today?.pending_count ?? 0,
      totalResources: resourcesCount?.total ?? 0,
      activeResources: resourcesCount?.active ?? 0,
    };
  },
);

export const getTodaysBookings = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/bookings/today" },
  async ({ merchantId }: { merchantId: string }): Promise<{ bookings: Booking[] }> => {
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
      notes: string | null;
      internal_notes: string | null;
    }>`
      SELECT id, resource_id, merchant_id, customer_id, customer_name, customer_phone, customer_email,
             booking_date, start_time, end_time, people_count, status, deposit_amount, total_amount,
             payment_id, notes, internal_notes
      FROM bookings
      WHERE merchant_id = ${merchantId} AND booking_date = CURRENT_DATE
      ORDER BY start_time ASC NULLS LAST
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
        notes: row.notes ?? undefined,
        internalNotes: row.internal_notes ?? undefined,
      })),
    };
  },
);

// ============ RESOURCE TEMPLATES ============

export const getResourceTemplates = api(
  { expose: true, method: "GET", path: "/resource-templates" },
  async (): Promise<{ templates: typeof resourceTemplates }> => {
    return { templates: resourceTemplates };
  },
);

// ============ RESOURCES ============

interface ListResourcesParams {
  merchantId: string;
}

interface CreateResourceBody {
  merchantId: string;
  name: string;
  description?: string;
  resourceType: Resource["resourceType"];
  capacity: number;
  basePrice: number;
  pricingType: Resource["pricingType"];
  durationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  photos?: string[];
  terms?: string;
  active?: boolean;
}

interface UpdateResourceParams {
  resourceId: string;
}

interface UpdateResourceBody {
  name?: string;
  description?: string;
  resourceType?: Resource["resourceType"];
  capacity?: number;
  basePrice?: number;
  pricingType?: Resource["pricingType"];
  durationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  photos?: string[];
  terms?: string;
  active?: boolean;
}

interface DeleteResourceParams {
  resourceId: string;
}

interface GetResourceParams {
  resourceId: string;
}

export const listMerchantResources = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/resources" },
  async ({ merchantId }: ListResourcesParams): Promise<{ resources: Resource[] }> => {
    const rows = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      resource_type: Resource["resourceType"];
      capacity: number;
      base_price: number;
      pricing_type: Resource["pricingType"];
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      photos: string[];
      terms: string | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, resource_type, capacity, base_price, pricing_type, 
             duration_minutes, buffer_before_minutes, buffer_after_minutes, photos, terms, active
      FROM resources
      WHERE merchant_id = ${merchantId}
      ORDER BY created_at DESC
    `;

    return {
      resources: rows.map((row) => ({
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        description: row.description ?? undefined,
        resourceType: row.resource_type,
        capacity: row.capacity,
        basePrice: Number(row.base_price),
        pricingType: row.pricing_type,
        durationMinutes: row.duration_minutes ?? undefined,
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
        photos: row.photos ?? [],
        terms: row.terms ?? undefined,
        active: row.active,
      })),
    };
  },
);

export const getResource = api(
  { expose: true, method: "GET", path: "/resource/:resourceId" },
  async ({ resourceId }: GetResourceParams): Promise<{ resource: Resource }> => {
    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      resource_type: Resource["resourceType"];
      capacity: number;
      base_price: number;
      pricing_type: Resource["pricingType"];
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      photos: string[];
      terms: string | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, resource_type, capacity, base_price, pricing_type, 
             duration_minutes, buffer_before_minutes, buffer_after_minutes, photos, terms, active
      FROM resources
      WHERE id = ${resourceId}
    `;

    if (!row) {
      throw APIError.notFound("Resource not found");
    }

    return {
      resource: {
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        description: row.description ?? undefined,
        resourceType: row.resource_type,
        capacity: row.capacity,
        basePrice: Number(row.base_price),
        pricingType: row.pricing_type,
        durationMinutes: row.duration_minutes ?? undefined,
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
        photos: row.photos ?? [],
        terms: row.terms ?? undefined,
        active: row.active,
      },
    };
  },
);

export const createResource = api(
  { expose: true, method: "POST", path: "/resource" },
  async (body: CreateResourceBody): Promise<{ resource: Resource }> => {
    const parsed = createResourceSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const merchant = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const resourceId = randomUUID();

    await db.exec`
      INSERT INTO resources (id, merchant_id, name, description, resource_type, capacity, base_price, 
                            pricing_type, duration_minutes, buffer_before_minutes, buffer_after_minutes, 
                            photos, terms, active)
      VALUES (
        ${resourceId},
        ${parsed.data.merchantId},
        ${parsed.data.name},
        ${parsed.data.description ?? null},
        ${parsed.data.resourceType},
        ${parsed.data.capacity},
        ${parsed.data.basePrice},
        ${parsed.data.pricingType},
        ${parsed.data.durationMinutes ?? null},
        ${parsed.data.bufferBeforeMinutes ?? 0},
        ${parsed.data.bufferAfterMinutes ?? 0},
        ${parsed.data.photos ?? []},
        ${parsed.data.terms ?? null},
        ${parsed.data.active ?? true}
      )
    `;

    return {
      resource: {
        id: resourceId,
        merchantId: parsed.data.merchantId,
        name: parsed.data.name,
        description: parsed.data.description,
        resourceType: parsed.data.resourceType,
        capacity: parsed.data.capacity,
        basePrice: parsed.data.basePrice,
        pricingType: parsed.data.pricingType,
        durationMinutes: parsed.data.durationMinutes,
        bufferBeforeMinutes: parsed.data.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: parsed.data.bufferAfterMinutes ?? 0,
        photos: parsed.data.photos ?? [],
        terms: parsed.data.terms,
        active: parsed.data.active ?? true,
      },
    };
  },
);

export const updateResource = api(
  { expose: true, method: "PATCH", path: "/resource/:resourceId" },
  async ({ resourceId, ...body }: UpdateResourceParams & UpdateResourceBody): Promise<{ resource: Resource }> => {
    const parsed = updateResourceSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM resources WHERE id = ${resourceId}
    `;

    if (!existing) {
      throw APIError.notFound("Resource not found");
    }

    await db.exec`
      UPDATE resources
      SET 
        name = COALESCE(${parsed.data.name}, name),
        description = COALESCE(${parsed.data.description}, description),
        resource_type = COALESCE(${parsed.data.resourceType}, resource_type),
        capacity = COALESCE(${parsed.data.capacity}, capacity),
        base_price = COALESCE(${parsed.data.basePrice}, base_price),
        pricing_type = COALESCE(${parsed.data.pricingType}, pricing_type),
        duration_minutes = COALESCE(${parsed.data.durationMinutes}, duration_minutes),
        buffer_before_minutes = COALESCE(${parsed.data.bufferBeforeMinutes}, buffer_before_minutes),
        buffer_after_minutes = COALESCE(${parsed.data.bufferAfterMinutes}, buffer_after_minutes),
        photos = COALESCE(${parsed.data.photos}, photos),
        terms = COALESCE(${parsed.data.terms}, terms),
        active = COALESCE(${parsed.data.active}, active),
        updated_at = now()
      WHERE id = ${resourceId}
    `;

    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      resource_type: Resource["resourceType"];
      capacity: number;
      base_price: number;
      pricing_type: Resource["pricingType"];
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
      photos: string[];
      terms: string | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, resource_type, capacity, base_price, pricing_type, 
             duration_minutes, buffer_before_minutes, buffer_after_minutes, photos, terms, active
      FROM resources
      WHERE id = ${resourceId}
    `;

    return {
      resource: {
        id: row!.id,
        merchantId: row!.merchant_id,
        name: row!.name,
        description: row!.description ?? undefined,
        resourceType: row!.resource_type,
        capacity: row!.capacity,
        basePrice: Number(row!.base_price),
        pricingType: row!.pricing_type,
        durationMinutes: row!.duration_minutes ?? undefined,
        bufferBeforeMinutes: row!.buffer_before_minutes,
        bufferAfterMinutes: row!.buffer_after_minutes,
        photos: row!.photos ?? [],
        terms: row!.terms ?? undefined,
        active: row!.active,
      },
    };
  },
);

export const deleteResource = api(
  { expose: true, method: "DELETE", path: "/resource/:resourceId" },
  async ({ resourceId }: DeleteResourceParams): Promise<{ ok: boolean }> => {
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM resources WHERE id = ${resourceId}
    `;

    if (!existing) {
      throw APIError.notFound("Resource not found");
    }

    await db.exec`
      UPDATE resources SET active = FALSE, updated_at = now() WHERE id = ${resourceId}
    `;

    return { ok: true };
  },
);

// ============ AVAILABILITY RULES ============

interface ListAvailabilityParams {
  resourceId: string;
}

interface CreateAvailabilityBody {
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
}

export const listAvailabilityRules = api(
  { expose: true, method: "GET", path: "/resource/:resourceId/availability" },
  async ({ resourceId }: ListAvailabilityParams): Promise<{ rules: AvailabilityRule[] }> => {
    const rows = await db.queryAll<{
      id: string;
      resource_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes: number;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
    }>`
      SELECT id, resource_id, day_of_week, start_time, end_time, 
             slot_duration_minutes, buffer_before_minutes, buffer_after_minutes
      FROM availability_rules
      WHERE resource_id = ${resourceId}
      ORDER BY day_of_week, start_time
    `;

    return {
      rules: rows.map((row) => ({
        id: row.id,
        resourceId: row.resource_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        slotDurationMinutes: row.slot_duration_minutes,
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
      })),
    };
  },
);

export const createAvailabilityRule = api(
  { expose: true, method: "POST", path: "/availability-rule" },
  async (body: CreateAvailabilityBody): Promise<{ rule: AvailabilityRule }> => {
    const parsed = createAvailabilityRuleSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const ruleId = randomUUID();

    await db.exec`
      INSERT INTO availability_rules (id, resource_id, day_of_week, start_time, end_time, 
                                       slot_duration_minutes, buffer_before_minutes, buffer_after_minutes)
      VALUES (
        ${ruleId},
        ${parsed.data.resourceId},
        ${parsed.data.dayOfWeek},
        ${parsed.data.startTime},
        ${parsed.data.endTime},
        ${parsed.data.slotDurationMinutes ?? 60},
        ${parsed.data.bufferBeforeMinutes ?? 0},
        ${parsed.data.bufferAfterMinutes ?? 0}
      )
      ON CONFLICT (resource_id, day_of_week, start_time)
      DO UPDATE SET
        end_time = EXCLUDED.end_time,
        slot_duration_minutes = EXCLUDED.slot_duration_minutes,
        buffer_before_minutes = EXCLUDED.buffer_before_minutes,
        buffer_after_minutes = EXCLUDED.buffer_after_minutes,
        updated_at = now()
    `;

    return {
      rule: {
        id: ruleId,
        resourceId: parsed.data.resourceId,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        slotDurationMinutes: parsed.data.slotDurationMinutes ?? 60,
        bufferBeforeMinutes: parsed.data.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: parsed.data.bufferAfterMinutes ?? 0,
      },
    };
  },
);

export const deleteAvailabilityRule = api(
  { expose: true, method: "DELETE", path: "/availability-rule/:ruleId" },
  async ({ ruleId }: { ruleId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM availability_rules WHERE id = ${ruleId}
    `;

    return { ok: true };
  },
);

export const setAvailabilityRules = api(
  { expose: true, method: "POST", path: "/resource/:resourceId/availability/set" },
  async ({ resourceId, rules }: { resourceId: string; rules: CreateAvailabilityBody[] }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM availability_rules WHERE resource_id = ${resourceId}
    `;

    for (const rule of rules) {
      const ruleId = randomUUID();
      await db.exec`
        INSERT INTO availability_rules (id, resource_id, day_of_week, start_time, end_time, 
                                         slot_duration_minutes, buffer_before_minutes, buffer_after_minutes)
        VALUES (
          ${ruleId},
          ${resourceId},
          ${rule.dayOfWeek},
          ${rule.startTime},
          ${rule.endTime},
          ${rule.slotDurationMinutes ?? 60},
          ${rule.bufferBeforeMinutes ?? 0},
          ${rule.bufferAfterMinutes ?? 0}
        )
      `;
    }

    return { ok: true };
  },
);

// ============ BLOCKS ============

interface ListBlocksParams {
  resourceId: string;
}

interface CreateBlockBody {
  resourceId: string;
  startTime: string;
  endTime: string;
  reason: Block["reason"];
  notes?: string;
  recurring?: Block["recurring"];
}

export const listBlocks = api(
  { expose: true, method: "GET", path: "/resource/:resourceId/blocks" },
  async ({ resourceId }: ListBlocksParams): Promise<{ blocks: Block[] }> => {
    const rows = await db.queryAll<{
      id: string;
      resource_id: string;
      start_time: Date;
      end_time: Date;
      reason: Block["reason"];
      notes: string | null;
      recurring: Block["recurring"] | null;
    }>`
      SELECT id, resource_id, start_time, end_time, reason, notes, recurring
      FROM blocks
      WHERE resource_id = ${resourceId} AND end_time > now()
      ORDER BY start_time ASC
    `;

    return {
      blocks: rows.map((row) => ({
        id: row.id,
        resourceId: row.resource_id,
        startTime: row.start_time.toISOString(),
        endTime: row.end_time.toISOString(),
        reason: row.reason,
        notes: row.notes ?? undefined,
        recurring: row.recurring ?? undefined,
      })),
    };
  },
);

export const createBlock = api(
  { expose: true, method: "POST", path: "/block" },
  async (body: CreateBlockBody): Promise<{ block: Block }> => {
    const parsed = createBlockSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const blockId = randomUUID();

    await db.exec`
      INSERT INTO blocks (id, resource_id, start_time, end_time, reason, notes, recurring)
      VALUES (
        ${blockId},
        ${parsed.data.resourceId},
        ${parsed.data.startTime},
        ${parsed.data.endTime},
        ${parsed.data.reason},
        ${parsed.data.notes ?? null},
        ${JSON.stringify(parsed.data.recurring) ?? null}
      )
    `;

return {
      block: {
        id: blockId,
        resourceId: parsed.data.resourceId,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
        recurring: parsed.data.recurring,
      },
    };
  },
);

export const deleteBlock = api(
  { expose: true, method: "DELETE", path: "/block/:blockId" },
  async ({ blockId }: { blockId: string }): Promise<{ ok: boolean }> => {
    await db.exec`
      DELETE FROM blocks WHERE id = ${blockId}
    `;

    return { ok: true };
  },
);

// ============ AVAILABILITY CHECK ============

interface GetAvailableSlotsParams {
  resourceId: string;
  date: string;
}

export const getAvailableSlots = api(
  { expose: true, method: "GET", path: "/resource/:resourceId/slots/:date" },
  async ({ resourceId, date }: GetAvailableSlotsParams): Promise<{ slots: TimeSlot[] }> => {
    const resource = await db.queryRow<{
      id: string;
      duration_minutes: number | null;
      buffer_before_minutes: number;
      buffer_after_minutes: number;
    }>`
      SELECT id, duration_minutes, buffer_before_minutes, buffer_after_minutes
      FROM resources
      WHERE id = ${resourceId} AND active = TRUE
    `;

    if (!resource) {
      throw APIError.notFound("Resource not found or inactive");
    }

    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    const rules = await db.queryAll<{
      start_time: string;
      end_time: string;
      slot_duration_minutes: number;
    }>`
      SELECT start_time, end_time, slot_duration_minutes
      FROM availability_rules
      WHERE resource_id = ${resourceId} AND day_of_week = ${dayOfWeek}
    `;

    if (rules.length === 0) {
      return { slots: [] };
    }

    const bookings = await db.queryAll<{
      start_time: string | null;
      end_time: string | null;
    }>`
      SELECT start_time, end_time
      FROM bookings
      WHERE resource_id = ${resourceId} 
        AND booking_date = ${date}
        AND status NOT IN ('cancelled', 'no_show')
    `;

    const blocks = await db.queryAll<{
      start_time: Date;
      end_time: Date;
    }>`
      SELECT start_time, end_time
      FROM blocks
      WHERE resource_id = ${resourceId}
        AND start_time < ${date + "T23:59:59"}::timestamptz
        AND end_time > ${date + "T00:00:00"}::timestamptz
    `;

    const slots: TimeSlot[] = [];

    for (const rule of rules) {
      const slotDuration = rule.slot_duration_minutes;
      const [startH, startM] = rule.start_time.split(":").map(Number);
      const [endH, endM] = rule.end_time.split(":").map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + slotDuration <= endMinutes) {
        const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
        const slotEndMinutes = currentMinutes + slotDuration;
        const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, "0")}:${String(slotEndMinutes % 60).padStart(2, "0")}`;

        const isBlocked = blocks.some((b) => {
          const blockStart = b.start_time.toISOString();
          const blockEnd = b.end_time.toISOString();
          const slotStartISO = `${date}T${slotStart}:00`;
          const slotEndISO = `${date}T${slotEnd}:00`;
          return slotStartISO < blockEnd && slotEndISO > blockStart;
        });

        const isBooked = bookings.some((b) => {
          if (!b.start_time || !b.end_time) return false;
          return b.start_time <= slotStart && b.end_time >= slotEnd;
        });

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: !isBlocked && !isBooked,
        });

        currentMinutes += slotDuration;
      }
    }

    return { slots: slots.sort((a, b) => a.startTime.localeCompare(b.startTime)) };
  },
);

// ============ PAYMENTS ============

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
      resource_id: string;
      booking_date: Date;
      start_time: string | null;
    }>`
      SELECT id, merchant_id, customer_name, customer_phone, customer_email, deposit_amount, resource_id, booking_date, start_time
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
  async (body: PaymentWebhookBody) => {
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
            SET status = 'confirmed', updated_at = now()
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
            SET status = 'cancelled', updated_at = now()
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

// ============ REPORTS ============

export const getReportsSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/reports/summary" },
  async ({ merchantId, period }: { merchantId: string; period?: "day" | "week" | "month" }) => {
    const periodFilter = period ?? "month";

    let stats: {
      total_bookings: number;
      confirmed_bookings: number;
      cancelled_bookings: number;
      no_show_count: number;
      total_revenue: number;
      pending_revenue: number;
      avg_booking_value: number;
    } | null;

    let topResources: {
      resource_id: string;
      resource_name: string;
      booking_count: number;
      revenue: number;
    }[];

    let dailyBreakdown: {
      date: Date;
      bookings: number;
      revenue: number;
    }[];

    if (periodFilter === "day") {
      stats = await db.queryRow<{
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
        WHERE merchant_id = ${merchantId}
          AND booking_date = CURRENT_DATE
      `;

      topResources = await db.queryAll<{
        resource_id: string;
        resource_name: string;
        booking_count: number;
        revenue: number;
      }>`
        SELECT 
          r.id AS resource_id,
          r.name AS resource_name,
          COUNT(b.id)::int AS booking_count,
          COALESCE(SUM(b.total_amount), 0)::numeric AS revenue
        FROM resources r
        LEFT JOIN bookings b ON b.resource_id = r.id 
          AND b.merchant_id = ${merchantId}
          AND b.status IN ('confirmed', 'completed')
          AND b.booking_date = CURRENT_DATE
        WHERE r.merchant_id = ${merchantId}
        GROUP BY r.id, r.name
        ORDER BY booking_count DESC
        LIMIT 5
      `;

      dailyBreakdown = [];
    } else if (periodFilter === "week") {
      stats = await db.queryRow<{
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
        WHERE merchant_id = ${merchantId}
          AND booking_date >= CURRENT_DATE - INTERVAL '7 days'
      `;

      topResources = await db.queryAll<{
        resource_id: string;
        resource_name: string;
        booking_count: number;
        revenue: number;
      }>`
        SELECT 
          r.id AS resource_id,
          r.name AS resource_name,
          COUNT(b.id)::int AS booking_count,
          COALESCE(SUM(b.total_amount), 0)::numeric AS revenue
        FROM resources r
        LEFT JOIN bookings b ON b.resource_id = r.id 
          AND b.merchant_id = ${merchantId}
          AND b.status IN ('confirmed', 'completed')
          AND b.booking_date >= CURRENT_DATE - INTERVAL '7 days'
        WHERE r.merchant_id = ${merchantId}
        GROUP BY r.id, r.name
        ORDER BY booking_count DESC
        LIMIT 5
      `;

      dailyBreakdown = await db.queryAll<{
        date: Date;
        bookings: number;
        revenue: number;
      }>`
        SELECT 
          booking_date AS date,
          COUNT(*)::int AS bookings,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS revenue
        FROM bookings
        WHERE merchant_id = ${merchantId}
          AND booking_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    } else {
      stats = await db.queryRow<{
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
        WHERE merchant_id = ${merchantId}
          AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
      `;

      topResources = await db.queryAll<{
        resource_id: string;
        resource_name: string;
        booking_count: number;
        revenue: number;
      }>`
        SELECT 
          r.id AS resource_id,
          r.name AS resource_name,
          COUNT(b.id)::int AS booking_count,
          COALESCE(SUM(b.total_amount), 0)::numeric AS revenue
        FROM resources r
        LEFT JOIN bookings b ON b.resource_id = r.id 
          AND b.merchant_id = ${merchantId}
          AND b.status IN ('confirmed', 'completed')
          AND DATE_TRUNC('month', b.booking_date) = DATE_TRUNC('month', CURRENT_DATE)
        WHERE r.merchant_id = ${merchantId}
        GROUP BY r.id, r.name
        ORDER BY booking_count DESC
        LIMIT 5
      `;

      dailyBreakdown = await db.queryAll<{
        date: Date;
        bookings: number;
        revenue: number;
      }>`
        SELECT 
          booking_date AS date,
          COUNT(*)::int AS bookings,
          COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS revenue
        FROM bookings
        WHERE merchant_id = ${merchantId}
          AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    }

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
      topResources: topResources.map(r => ({
        resourceId: r.resource_id,
        resourceName: r.resource_name,
        bookingCount: r.booking_count,
        revenue: Number(r.revenue),
      })),
      dailyBreakdown: dailyBreakdown.map(d => ({
        date: d.date.toISOString().split('T')[0],
        bookings: d.bookings,
        revenue: Number(d.revenue),
      })),
    };
  },
);

export const getCustomersList = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/customers" },
  async ({ merchantId, search }: { merchantId: string; search?: string }) => {
    const searchPattern = search ? `%${search}%` : null;

    const rows = await db.queryAll<{
      id: string;
      name: string;
      phone: string;
      email: string | null;
      document: string | null;
      notes: string | null;
      created_at: Date;
      total_bookings: number;
      total_spent: number;
      last_booking_date: Date | null;
    }>`
      SELECT c.id, c.name, c.phone, c.email, c.document, c.notes, c.created_at,
             COUNT(b.id)::int AS total_bookings,
             COALESCE(SUM(b.total_amount), 0)::numeric AS total_spent,
             MAX(b.booking_date) AS last_booking_date
      FROM customers c
      LEFT JOIN bookings b ON b.customer_id = c.id
      WHERE c.merchant_id = ${merchantId}
        AND (${searchPattern}::text IS NULL OR c.name ILIKE ${searchPattern} OR c.phone ILIKE ${searchPattern})
      GROUP BY c.id
      ORDER BY total_bookings DESC, c.created_at DESC
      LIMIT 100
    `;

    return {
      customers: rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email ?? undefined,
        document: row.document ?? undefined,
        notes: row.notes ?? undefined,
        createdAt: row.created_at.toISOString(),
        totalBookings: row.total_bookings,
        totalSpent: Number(row.total_spent),
        lastBookingDate: row.last_booking_date?.toISOString().split('T')[0],
      })),
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
      notes: string | null;
      created_at: Date;
    }>`
      SELECT id, merchant_id, name, phone, email, document, notes, created_at
      FROM customers
      WHERE id = ${customerId}
    `;

    if (!customer) {
      throw APIError.notFound("Customer not found");
    }

    const bookings = await db.queryAll<{
      id: string;
      resource_id: string;
      resource_name: string;
      booking_date: Date;
      start_time: string | null;
      end_time: string | null;
      people_count: number;
      status: string;
      total_amount: number;
      deposit_amount: number;
      created_at: Date;
    }>`
      SELECT b.id, b.resource_id, r.name AS resource_name, b.booking_date, b.start_time, b.end_time,
             b.people_count, b.status, b.total_amount, b.deposit_amount, b.created_at
      FROM bookings b
      LEFT JOIN resources r ON r.id = b.resource_id
      WHERE b.customer_id = ${customerId}
      ORDER BY b.booking_date DESC, b.created_at DESC
      LIMIT 50
    `;

    const stats = await db.queryRow<{
      total_bookings: number;
      total_spent: number;
      no_show_count: number;
    }>`
      SELECT 
        COUNT(*)::int AS total_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'completed')), 0)::numeric AS total_spent,
        COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_show_count
      FROM bookings
      WHERE customer_id = ${customerId}
    `;

    const tags = await db.queryAll<{
      id: string;
      name: string;
      color: string;
    }>`
      SELECT t.id, t.name, t.color
      FROM customer_tags t
      JOIN customer_tag_assignments a ON a.tag_id = t.id
      WHERE a.customer_id = ${customerId}
    `;

    return {
      customer: {
        id: customer.id,
        merchantId: customer.merchant_id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? undefined,
        document: customer.document ?? undefined,
        notes: customer.notes ?? undefined,
        createdAt: customer.created_at.toISOString(),
      },
      stats: {
        totalBookings: stats?.total_bookings ?? 0,
        totalSpent: Number(stats?.total_spent ?? 0),
        noShowCount: stats?.no_show_count ?? 0,
      },
      tags: tags.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
      })),
      bookings: bookings.map(b => ({
        id: b.id,
        resourceId: b.resource_id,
        resourceName: b.resource_name,
        bookingDate: b.booking_date.toISOString().split('T')[0],
        startTime: b.start_time ?? undefined,
        endTime: b.end_time ?? undefined,
        peopleCount: b.people_count,
        status: b.status,
        totalAmount: Number(b.total_amount),
        depositAmount: Number(b.deposit_amount),
        createdAt: b.created_at.toISOString(),
      })),
    };
  },
);

// ============ CUSTOMER TAGS ============

export const listCustomerTags = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/customer-tags" },
  async ({ merchantId }: { merchantId: string }) => {
    const rows = await db.queryAll<{
      id: string;
      name: string;
      color: string;
    }>`
      SELECT id, name, color
      FROM customer_tags
      WHERE merchant_id = ${merchantId}
      ORDER BY name ASC
    `;

    return {
      tags: rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
      })),
    };
  },
);

export const createCustomerTag = api(
  { expose: true, method: "POST", path: "/customer-tag" },
  async ({ merchantId, name, color }: { merchantId: string; name: string; color?: string }) => {
    const tagId = randomUUID();

    await db.exec`
      INSERT INTO customer_tags (id, merchant_id, name, color)
      VALUES (${tagId}, ${merchantId}, ${name}, ${color ?? '#FFB800'})
    `;

    return {
      tag: {
        id: tagId,
        name,
        color: color ?? '#FFB800',
      },
    };
  },
);

export const deleteCustomerTag = api(
  { expose: true, method: "DELETE", path: "/customer-tag/:tagId" },
  async ({ tagId }: { tagId: string }) => {
    await db.exec`
      DELETE FROM customer_tags WHERE id = ${tagId}
    `;
    return { ok: true };
  },
);

export const assignTagToCustomer = api(
  { expose: true, method: "POST", path: "/customer/:customerId/tag/:tagId" },
  async ({ customerId, tagId }: { customerId: string; tagId: string }) => {
    await db.exec`
      INSERT INTO customer_tag_assignments (customer_id, tag_id)
      VALUES (${customerId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;
    return { ok: true };
  },
);

export const removeTagFromCustomer = api(
  { expose: true, method: "DELETE", path: "/customer/:customerId/tag/:tagId" },
  async ({ customerId, tagId }: { customerId: string; tagId: string }) => {
    await db.exec`
      DELETE FROM customer_tag_assignments
      WHERE customer_id = ${customerId} AND tag_id = ${tagId}
    `;
    return { ok: true };
  },
);