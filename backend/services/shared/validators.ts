import { z } from "zod";
import { bookingStatuses, merchantNiches, pricingTypes, resourceTypes, blockReasons } from "./types";

export const upsertMerchantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  businessName: z.string().min(2).max(120),
  niche: z.enum(merchantNiches),
  whatsappNumber: z.string().min(8).max(30),
  pixKey: z.string().min(4).max(180),
  email: z.string().email().optional(),
  mercadoPagoAccessToken: z.string().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  signalPercentage: z.number().int().min(0).max(100).optional(),
  signalDeadlineMinutes: z.number().int().min(5).max(10080).optional(),
  signalAutoCancel: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  resourceId: z.string().uuid(),
  merchantId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(30),
  customerEmail: z.string().email().optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  peopleCount: z.number().int().min(1).max(100),
  notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(bookingStatuses),
  internalNotes: z.string().max(500).optional(),
});

export const createResourceSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  resourceType: z.enum(resourceTypes),
  capacity: z.number().int().min(1).max(1000),
  basePrice: z.number().min(0).max(1000000),
  pricingType: z.enum(pricingTypes),
  durationMinutes: z.number().int().min(15).max(1440).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(480).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(480).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  terms: z.string().max(2000).optional(),
  active: z.boolean().default(true),
});

export const updateResourceSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).optional(),
  resourceType: z.enum(resourceTypes).optional(),
  capacity: z.number().int().min(1).max(1000).optional(),
  basePrice: z.number().min(0).max(1000000).optional(),
  pricingType: z.enum(pricingTypes).optional(),
  durationMinutes: z.number().int().min(15).max(1440).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(480).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(480).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  terms: z.string().max(2000).optional(),
  active: z.boolean().optional(),
});

export const createAvailabilityRuleSchema = z.object({
  resourceId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().min(15).max(480).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(480).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(480).optional(),
});

export const createBlockSchema = z.object({
  resourceId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.enum(blockReasons),
  notes: z.string().max(500).optional(),
  recurring: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    until: z.string().datetime().optional(),
  }).optional(),
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

export const createCustomerSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional(),
  document: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
});

export const createCustomerTagSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});