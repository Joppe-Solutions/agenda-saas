import { z } from "zod";
import { bookingStatuses, merchantNiches } from "./types";

export const upsertMerchantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(3).max(80),
  businessName: z.string().min(2).max(120),
  niche: z.enum(merchantNiches),
  whatsappNumber: z.string().min(8).max(30),
  pixKey: z.string().min(4).max(180),
});

export const createBookingSchema = z.object({
  assetId: z.string().uuid(),
  merchantId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(30),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  peopleCount: z.number().int().min(1).max(100),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(bookingStatuses),
});
