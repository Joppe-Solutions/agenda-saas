import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { upsertMerchantSchema, clerkWebhookSchema, createAssetSchema, updateAssetSchema } from "../shared/validators";
import { createPixPayment, verifyPaymentStatus, PaymentProvider } from "./gateway";
import type { Asset, Merchant, Payment } from "../shared/types";

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
}

interface DashboardParams {
  merchantId: string;
}

export const getPublicMerchant = api(
  { expose: true, method: "GET", path: "/public/merchant/:slug" },
  async ({ slug }: GetPublicMerchantParams): Promise<{ merchant: Merchant; assets: Asset[] }> => {
    const merchant = await db.queryRow<{
      id: string;
      slug: string;
      business_name: string;
      niche: Merchant["niche"];
      whatsapp_number: string;
      pix_key: string;
      email: string | null;
    }>`
      SELECT id, slug, business_name, niche, whatsapp_number, pix_key, email
      FROM merchants
      WHERE slug = ${slug}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const assets = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      capacity: number;
      base_price: number;
      pricing_type: Asset["pricingType"];
      duration_minutes: number | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, capacity, base_price, pricing_type, duration_minutes, active
      FROM assets
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
      },
      assets: assets.map((item) => ({
        id: item.id,
        merchantId: item.merchant_id,
        name: item.name,
        description: item.description ?? undefined,
        capacity: item.capacity,
        basePrice: Number(item.base_price),
        pricingType: item.pricing_type,
        durationMinutes: item.duration_minutes ?? undefined,
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
    }>`
      SELECT id, slug, business_name, niche, whatsapp_number, pix_key, email, mercado_pago_access_token
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
      INSERT INTO merchants (id, slug, business_name, niche, whatsapp_number, pix_key, email, mercado_pago_access_token)
      VALUES (${parsed.data.id}, ${parsed.data.slug}, ${parsed.data.businessName}, ${parsed.data.niche}, ${parsed.data.whatsappNumber}, ${parsed.data.pixKey}, ${parsed.data.email ?? null}, ${parsed.data.mercadoPagoAccessToken ?? null})
      ON CONFLICT (id)
      DO UPDATE SET
        slug = EXCLUDED.slug,
        business_name = EXCLUDED.business_name,
        niche = EXCLUDED.niche,
        whatsapp_number = EXCLUDED.whatsapp_number,
        pix_key = EXCLUDED.pix_key,
        email = COALESCE(EXCLUDED.email, merchants.email),
        mercado_pago_access_token = COALESCE(EXCLUDED.mercado_pago_access_token, merchants.mercado_pago_access_token),
        updated_at = now()
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
    const parsed = clerkWebhookSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid webhook body", parsed.error);
    }

    if (parsed.data.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = parsed.data.data;
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
        INSERT INTO merchants (id, slug, business_name, niche, whatsapp_number, pix_key, email)
        VALUES (${id}, ${slug}, ${name}, 'SERVICES', '', '', ${email ?? null})
      `;

      return { ok: true, created: true };
    }

    if (parsed.data.type === "user.deleted") {
      await db.exec`
        DELETE FROM merchants WHERE id = ${parsed.data.data.id}
      `;
      return { ok: true, deleted: true };
    }

    return { ok: true };
  },
);

export const getMerchantDashboardSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/dashboard" },
  async ({ merchantId }: DashboardParams) => {
    const today = await db.queryRow<{ bookings_today: number; month_revenue: number; pending_count: number }>`
      SELECT
        COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE AND status = 'CONFIRMED')::int AS bookings_today,
        COALESCE(SUM(deposit_amount) FILTER (
          WHERE status = 'CONFIRMED'
            AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
        ), 0)::numeric AS month_revenue,
        COUNT(*) FILTER (WHERE status = 'PENDING_PAYMENT')::int AS pending_count
      FROM bookings
      WHERE merchant_id = ${merchantId}
    `;

    const assetsCount = await db.queryRow<{ total: number; active: number }>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE active = TRUE)::int AS active
      FROM assets
      WHERE merchant_id = ${merchantId}
    `;

    return {
      bookingsToday: today?.bookings_today ?? 0,
      monthRevenue: Number(today?.month_revenue ?? 0),
      pendingBookings: today?.pending_count ?? 0,
      totalAssets: assetsCount?.total ?? 0,
      activeAssets: assetsCount?.active ?? 0,
    };
  },
);

// ============ ASSETS ============

interface ListAssetsParams {
  merchantId: string;
}

interface CreateAssetBody {
  merchantId: string;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  pricingType: "FULL_DAY" | "HOURLY";
  durationMinutes?: number;
  active?: boolean;
}

interface UpdateAssetParams {
  assetId: string;
}

interface UpdateAssetBody {
  name?: string;
  description?: string;
  capacity?: number;
  basePrice?: number;
  pricingType?: "FULL_DAY" | "HOURLY";
  durationMinutes?: number;
  active?: boolean;
}

interface DeleteAssetParams {
  assetId: string;
}

interface GetAssetParams {
  assetId: string;
}

export const listMerchantAssets = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/assets" },
  async ({ merchantId }: ListAssetsParams): Promise<{ assets: Asset[] }> => {
    const rows = await db.queryAll<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      capacity: number;
      base_price: number;
      pricing_type: Asset["pricingType"];
      duration_minutes: number | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, capacity, base_price, pricing_type, duration_minutes, active
      FROM assets
      WHERE merchant_id = ${merchantId}
      ORDER BY created_at DESC
    `;

    return {
      assets: rows.map((row) => ({
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        description: row.description ?? undefined,
        capacity: row.capacity,
        basePrice: Number(row.base_price),
        pricingType: row.pricing_type,
        durationMinutes: row.duration_minutes ?? undefined,
        active: row.active,
      })),
    };
  },
);

export const getAsset = api(
  { expose: true, method: "GET", path: "/asset/:assetId" },
  async ({ assetId }: GetAssetParams): Promise<{ asset: Asset }> => {
    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      capacity: number;
      base_price: number;
      pricing_type: Asset["pricingType"];
      duration_minutes: number | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, capacity, base_price, pricing_type, duration_minutes, active
      FROM assets
      WHERE id = ${assetId}
    `;

    if (!row) {
      throw APIError.notFound("Asset not found");
    }

    return {
      asset: {
        id: row.id,
        merchantId: row.merchant_id,
        name: row.name,
        description: row.description ?? undefined,
        capacity: row.capacity,
        basePrice: Number(row.base_price),
        pricingType: row.pricing_type,
        durationMinutes: row.duration_minutes ?? undefined,
        active: row.active,
      },
    };
  },
);

export const createAsset = api(
  { expose: true, method: "POST", path: "/asset" },
  async (body: CreateAssetBody): Promise<{ asset: Asset }> => {
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const merchant = await db.queryRow<{ id: string }>`
      SELECT id FROM merchants WHERE id = ${parsed.data.merchantId}
    `;

    if (!merchant) {
      throw APIError.notFound("Merchant not found");
    }

    const assetId = randomUUID();

    await db.exec`
      INSERT INTO assets (id, merchant_id, name, description, capacity, base_price, pricing_type, duration_minutes, active)
      VALUES (
        ${assetId},
        ${parsed.data.merchantId},
        ${parsed.data.name},
        ${parsed.data.description ?? null},
        ${parsed.data.capacity},
        ${parsed.data.basePrice},
        ${parsed.data.pricingType},
        ${parsed.data.durationMinutes ?? null},
        ${parsed.data.active ?? true}
      )
    `;

    return {
      asset: {
        id: assetId,
        merchantId: parsed.data.merchantId,
        name: parsed.data.name,
        description: parsed.data.description,
        capacity: parsed.data.capacity,
        basePrice: parsed.data.basePrice,
        pricingType: parsed.data.pricingType,
        durationMinutes: parsed.data.durationMinutes,
        active: parsed.data.active ?? true,
      },
    };
  },
);

export const updateAsset = api(
  { expose: true, method: "PATCH", path: "/asset/:assetId" },
  async ({ assetId, ...body }: UpdateAssetParams & UpdateAssetBody): Promise<{ asset: Asset }> => {
    const parsed = updateAssetSchema.safeParse(body);
    if (!parsed.success) {
      throw APIError.invalidArgument("Invalid request body", parsed.error);
    }

    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM assets WHERE id = ${assetId}
    `;

    if (!existing) {
      throw APIError.notFound("Asset not found");
    }

    await db.exec`
      UPDATE assets
      SET 
        name = COALESCE(${parsed.data.name}, name),
        description = COALESCE(${parsed.data.description}, description),
        capacity = COALESCE(${parsed.data.capacity}, capacity),
        base_price = COALESCE(${parsed.data.basePrice}, base_price),
        pricing_type = COALESCE(${parsed.data.pricingType}, pricing_type),
        duration_minutes = COALESCE(${parsed.data.durationMinutes}, duration_minutes),
        active = COALESCE(${parsed.data.active}, active),
        updated_at = now()
      WHERE id = ${assetId}
    `;

    const row = await db.queryRow<{
      id: string;
      merchant_id: string;
      name: string;
      description: string | null;
      capacity: number;
      base_price: number;
      pricing_type: Asset["pricingType"];
      duration_minutes: number | null;
      active: boolean;
    }>`
      SELECT id, merchant_id, name, description, capacity, base_price, pricing_type, duration_minutes, active
      FROM assets
      WHERE id = ${assetId}
    `;

    return {
      asset: {
        id: row!.id,
        merchantId: row!.merchant_id,
        name: row!.name,
        description: row!.description ?? undefined,
        capacity: row!.capacity,
        basePrice: Number(row!.base_price),
        pricingType: row!.pricing_type,
        durationMinutes: row!.duration_minutes ?? undefined,
        active: row!.active,
      },
    };
  },
);

export const deleteAsset = api(
  { expose: true, method: "DELETE", path: "/asset/:assetId" },
  async ({ assetId }: DeleteAssetParams): Promise<{ ok: boolean }> => {
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM assets WHERE id = ${assetId}
    `;

    if (!existing) {
      throw APIError.notFound("Asset not found");
    }

    await db.exec`
      UPDATE assets SET active = FALSE, updated_at = now() WHERE id = ${assetId}
    `;

    return { ok: true };
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
