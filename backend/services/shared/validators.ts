import { z } from "zod";
import { bookingStatuses, merchantNiches, pricingTypes } from "./types";

export const upsertMerchantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  businessName: z.string().min(2).max(120),
  niche: z.enum(merchantNiches),
  whatsappNumber: z.string().min(8).max(30),
  pixKey: z.string().min(4).max(180),
  email: z.string().email().optional(),
  mercadoPagoAccessToken: z.string().optional(),
});

export const createBookingSchema = z.object({
  assetId: z.string().uuid(),
  merchantId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(30),
  customerEmail: z.string().email().optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  peopleCount: z.number().int().min(1).max(100),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(bookingStatuses),
});

export const createAssetSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  capacity: z.number().int().min(1).max(1000),
  basePrice: z.number().min(0).max(1000000),
  pricingType: z.enum(pricingTypes),
  durationMinutes: z.number().int().min(15).max(1440).optional(),
  active: z.boolean().default(true),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  capacity: z.number().int().min(1).max(1000).optional(),
  basePrice: z.number().min(0).max(1000000).optional(),
  pricingType: z.enum(pricingTypes).optional(),
  durationMinutes: z.number().int().min(15).max(1440).optional(),
  active: z.boolean().optional(),
});

export const clerkWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string(),
      id: z.string(),
    })).optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    public_metadata: z.record(z.unknown()).optional(),
  }),
});
