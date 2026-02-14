import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { upsertMerchantSchema } from "../shared/validators";
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
    }>`
      SELECT id, slug, business_name, niche, whatsapp_number, pix_key
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
      capacity: number;
      base_price: number;
      pricing_type: Asset["pricingType"];
      active: boolean;
    }>`
      SELECT id, merchant_id, name, capacity, base_price, pricing_type, active
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
      },
      assets: assets.map((item) => ({
        id: item.id,
        merchantId: item.merchant_id,
        name: item.name,
        capacity: item.capacity,
        basePrice: item.base_price,
        pricingType: item.pricing_type,
        active: item.active,
      })),
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
      INSERT INTO merchants (id, slug, business_name, niche, whatsapp_number, pix_key)
      VALUES (${parsed.data.id}, ${parsed.data.slug}, ${parsed.data.businessName}, ${parsed.data.niche}, ${parsed.data.whatsappNumber}, ${parsed.data.pixKey})
      ON CONFLICT (id)
      DO UPDATE SET
        slug = EXCLUDED.slug,
        business_name = EXCLUDED.business_name,
        niche = EXCLUDED.niche,
        whatsapp_number = EXCLUDED.whatsapp_number,
        pix_key = EXCLUDED.pix_key,
        updated_at = now()
    `;

    return { ok: true };
  },
);

export const getMerchantDashboardSummary = api(
  { expose: true, method: "GET", path: "/merchant/:merchantId/dashboard" },
  async ({ merchantId }: DashboardParams) => {
    const today = await db.queryRow<{ bookings_today: number; month_revenue: number }>`
      SELECT
        COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE AND status = 'CONFIRMED')::int AS bookings_today,
        COALESCE(SUM(deposit_amount) FILTER (
          WHERE status = 'CONFIRMED'
            AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
        ), 0)::numeric AS month_revenue
      FROM bookings
      WHERE merchant_id = ${merchantId}
    `;

    return {
      bookingsToday: today?.bookings_today ?? 0,
      monthRevenue: Number(today?.month_revenue ?? 0),
    };
  },
);
