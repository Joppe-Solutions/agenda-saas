import { z } from "zod";
import { bookingStatuses, businessCategories, blockReasons } from "./types";

export const upsertMerchantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  businessName: z.string().min(2).max(120),
  businessCategory: z.enum(businessCategories),
  whatsappNumber: z.string().min(8).max(30),
  pixKey: z.string().min(4).max(180),
  email: z.string().email().optional(),
  mercadoPagoAccessToken: z.string().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  requireDeposit: z.boolean().optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
  depositDeadlineMinutes: z.number().int().min(5).max(10080).optional(),
  autoConfirmOnPayment: z.boolean().optional(),
  allowOnlinePayment: z.boolean().optional(),
  cancellationDeadlineHours: z.number().int().min(0).max(720).optional(),
  cancellationRefundPercentage: z.number().int().min(0).max(100).optional(),
  enableReminders: z.boolean().optional(),
  reminderHoursBefore: z.number().int().min(1).max(168).optional(),
  enableLoyalty: z.boolean().optional(),
  pointsPerReal: z.number().int().min(1).max(100).optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  merchantId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(30),
  customerEmail: z.string().email().optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(bookingStatuses),
  internalNotes: z.string().max(500).optional(),
});

export const createServiceSchema = z.object({
  merchantId: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(1440),
  price: z.number().min(0).max(1000000),
  bufferBeforeMinutes: z.number().int().min(0).max(480).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(480).optional(),
  maxConcurrentBookings: z.number().int().min(1).max(100).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  active: z.boolean().default(true),
  requireDeposit: z.boolean().optional(),
  depositAmount: z.number().min(0).max(1000000).optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
  allowStaffSelection: z.boolean().optional(),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(1440).optional(),
  price: z.number().min(0).max(1000000).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(480).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(480).optional(),
  maxConcurrentBookings: z.number().int().min(1).max(100).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  active: z.boolean().optional(),
  requireDeposit: z.boolean().optional(),
  depositAmount: z.number().min(0).max(1000000).optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
  allowStaffSelection: z.boolean().optional(),
});

export const createServiceCategorySchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const createStaffSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(30).optional(),
  photo: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  commissionPercentage: z.number().min(0).max(100).optional(),
  services: z.array(z.string().uuid()).default([]),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(30).optional(),
  photo: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  active: z.boolean().optional(),
  commissionPercentage: z.number().min(0).max(100).optional(),
  services: z.array(z.string().uuid()).optional(),
});

export const createAvailabilitySchema = z.object({
  staffId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const createBlockSchema = z.object({
  staffId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.enum(blockReasons),
  notes: z.string().max(500).optional(),
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
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
});

export const createCustomerTagSchema = z.object({
  merchantId: z.string().min(1),
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});