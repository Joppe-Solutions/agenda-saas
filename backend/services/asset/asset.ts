import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";
import { createAssetSchema, updateAssetSchema } from "../shared/validators";
import type { Asset } from "../shared/types";

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

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (parsed.data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(parsed.data.name);
    }
    if (parsed.data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(parsed.data.description);
    }
    if (parsed.data.capacity !== undefined) {
      updates.push(`capacity = $${paramIndex++}`);
      values.push(parsed.data.capacity);
    }
    if (parsed.data.basePrice !== undefined) {
      updates.push(`base_price = $${paramIndex++}`);
      values.push(parsed.data.basePrice);
    }
    if (parsed.data.pricingType !== undefined) {
      updates.push(`pricing_type = $${paramIndex++}`);
      values.push(parsed.data.pricingType);
    }
    if (parsed.data.durationMinutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      values.push(parsed.data.durationMinutes);
    }
    if (parsed.data.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(parsed.data.active);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = now()`);
    values.push(assetId);

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
