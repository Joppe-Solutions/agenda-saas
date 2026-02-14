import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { upsertMerchantSchema, clerkWebhookSchema } from "../shared/validators";
import type { Asset, Merchant } from "../shared/types";

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

export const clerkWebhook = api(
  { expose: true, method: "POST", path: "/webhooks/clerk" },
  async (body: unknown) => {
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
