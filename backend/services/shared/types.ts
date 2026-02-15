export const businessCategories = ["BEAUTY", "HEALTH", "WELLNESS", "EDUCATION", "SERVICES", "PET"] as const;
export type BusinessCategory = "BEAUTY" | "HEALTH" | "WELLNESS" | "EDUCATION" | "SERVICES" | "PET";

export const bookingStatuses = [
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type BookingStatus = "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export const paymentStatuses = ["pending", "approved", "rejected", "refunded", "expired"] as const;
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "expired";

export const paymentMethods = ["PIX", "CREDIT_CARD", "CASH"] as const;
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "CASH";

export const paymentProviders = ["MERCADO_PAGO", "STUB"] as const;
export type PaymentProvider = "MERCADO_PAGO" | "STUB";

export const blockReasons = ["day_off", "vacation", "holiday", "other"] as const;
export type BlockReason = "day_off" | "vacation" | "holiday" | "other";

export interface Merchant {
  id: string;
  slug: string;
  businessName: string;
  businessCategory: BusinessCategory;
  whatsappNumber: string;
  pixKey: string;
  email?: string;
  mercadoPagoAccessToken?: string;
  address?: string;
  city?: string;
  logo?: string;
  primaryColor?: string;
  requireDeposit: boolean;
  depositPercentage: number;
  depositDeadlineMinutes: number;
  autoConfirmOnPayment: boolean;
  allowOnlinePayment: boolean;
  cancellationDeadlineHours: number;
  cancellationRefundPercentage: number;
  enableReminders: boolean;
  reminderHoursBefore: number;
  enableLoyalty: boolean;
  pointsPerReal: number;
}

export interface ServiceCategory {
  id: string;
  merchantId: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
  active: boolean;
}

export interface Service {
  id: string;
  merchantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  maxConcurrentBookings: number;
  photos: string[];
  active: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  allowStaffSelection: boolean;
  order: number;
}

export interface StaffMember {
  id: string;
  merchantId: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  active: boolean;
  commissionPercentage?: number;
  services: string[];
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface StaffBlock {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  reason: BlockReason;
  notes?: string;
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
  birthDate?: string;
  notes?: string;
  loyaltyPoints: number;
  totalBookings: number;
  totalSpent: number;
  lastVisit?: string;
}

export interface CustomerTag {
  id: string;
  merchantId: string;
  name: string;
  color: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  staffId?: string;
  merchantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  depositAmount: number;
  totalAmount: number;
  paymentId: string | null;
  paymentMethod?: PaymentMethod;
  qrCode?: string;
  copyPasteCode?: string;
  notes?: string;
  internalNotes?: string;
  depositExpiresAt?: string;
  reminderSentAt?: string;
  loyaltyPointsEarned: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  merchantId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  providerPaymentId: string;
  qrCode?: string;
  copyPasteCode?: string;
  paidAt?: string;
  createdAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export interface ServiceTemplate {
  category: BusinessCategory;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
}

export const serviceTemplates: ServiceTemplate[] = [
  { category: "BEAUTY", name: "Corte de Cabelo", durationMinutes: 30, price: 50, description: "Corte masculino ou feminino" },
  { category: "BEAUTY", name: "Barba", durationMinutes: 20, price: 30, description: "Aparar e modelar barba" },
  { category: "BEAUTY", name: "Manicure", durationMinutes: 45, price: 40, description: "Unhas das mãos" },
  { category: "BEAUTY", name: "Pedicure", durationMinutes: 50, price: 45, description: "Unhas dos pés" },
  { category: "BEAUTY", name: "Sobrancelha", durationMinutes: 20, price: 25, description: "Design de sobrancelha" },
  { category: "HEALTH", name: "Consulta", durationMinutes: 30, price: 150, description: "Consulta médica" },
  { category: "HEALTH", name: "Retorno", durationMinutes: 15, price: 80, description: "Consulta de retorno" },
  { category: "HEALTH", name: "Exame", durationMinutes: 30, price: 100, description: "Exame clínico" },
  { category: "WELLNESS", name: "Massagem Relaxante", durationMinutes: 60, price: 120, description: "Massagem corporal relaxante" },
  { category: "WELLNESS", name: "Aula de Yoga", durationMinutes: 60, price: 50, description: "Aula em grupo" },
  { category: "WELLNESS", name: "Acupuntura", durationMinutes: 45, price: 150, description: "Sessão de acupuntura" },
  { category: "EDUCATION", name: "Aula Particular", durationMinutes: 60, price: 80, description: "Aula individual" },
  { category: "EDUCATION", name: "Tutoria", durationMinutes: 60, price: 100, description: "Reforço escolar" },
  { category: "SERVICES", name: "Consulta Geral", durationMinutes: 30, price: 100, description: "Atendimento geral" },
  { category: "PET", name: "Banho e Tosa", durationMinutes: 60, price: 70, description: "Banho e tosa completa" },
  { category: "PET", name: "Consulta Veterinária", durationMinutes: 30, price: 120, description: "Consulta clínica" },
];