export type MerchantNiche = "FISHING" | "SPORTS" | "TOURISM" | "SERVICES";
export type ResourceType = "BOAT" | "SPORTS_COURT" | "CONSULTING_ROOM" | "EVENT_SPACE" | "EQUIPMENT" | "PROFESSIONAL" | "VACATION_RENTAL" | "OTHER";
export type PricingType = "FULL_DAY" | "HOURLY" | "SLOT" | "PER_PERSON";
export type BookingStatus = "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type BlockReason = "maintenance" | "vacation" | "weather" | "other";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "Aguardando Sinal",
  confirmed: "Confirmada",
  in_progress: "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  BOAT: "Barco",
  SPORTS_COURT: "Quadra Esportiva",
  CONSULTING_ROOM: "Consultório/Sala",
  EVENT_SPACE: "Espaço de Eventos",
  EQUIPMENT: "Equipamento",
  PROFESSIONAL: "Profissional",
  VACATION_RENTAL: "Imóvel Temporada",
  OTHER: "Outro",
};

export const RESOURCE_TYPE_ICONS: Record<ResourceType, string> = {
  BOAT: "🚤",
  SPORTS_COURT: "⚽",
  CONSULTING_ROOM: "🏥",
  EVENT_SPACE: "🎉",
  EQUIPMENT: "🎮",
  PROFESSIONAL: "✂️",
  VACATION_RENTAL: "🏠",
  OTHER: "📦",
};

export interface Merchant {
  id: string;
  slug: string;
  businessName: string;
  niche: MerchantNiche;
  whatsappNumber: string;
  pixKey: string;
  email?: string;
  mercadoPagoAccessToken?: string;
  address?: string;
  city?: string;
  signalPercentage: number;
  signalDeadlineMinutes: number;
  signalAutoCancel: boolean;
  cancellationDeadlineHours: number;
  cancellationRefundPercentage: number;
}

export interface Resource {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  resourceType: ResourceType;
  capacity: number;
  basePrice: number;
  pricingType: PricingType;
  durationMinutes?: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  photos: string[];
  terms?: string;
  active: boolean;
}

export interface AvailabilityRule {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface Block {
  id: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  reason: BlockReason;
  notes: string;
  recurring: {
    frequency: "daily" | "weekly" | "monthly";
    until: string;
  } | null;
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
  notes?: string;
}

export interface CustomerTag {
  id: string;
  merchantId: string;
  name: string;
  color: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  merchantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  peopleCount: number;
  status: BookingStatus;
  depositAmount: number;
  totalAmount: number;
  paymentId: string | null;
  qrCode?: string;
  copyPasteCode?: string;
  notes?: string;
  internalNotes?: string;
  signalExpiresAt?: string;
  createdAt?: string;
  resourceName?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  merchantId: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "refunded";
  paymentMethod: "PIX";
  provider: "MERCADO_PAGO" | "STUB";
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
}

export interface ResourceTemplate {
  type: ResourceType;
  name: string;
  icon: string;
  defaultCapacity: number;
  defaultPricingType: PricingType;
  defaultDurationMinutes?: number;
  description: string;
}

export interface DashboardStats {
  bookingsToday: number;
  pendingToday: number;
  monthRevenue: number;
  pendingBookings: number;
  totalResources: number;
  activeResources: number;
}

export interface CreateBookingInput {
  resourceId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  peopleCount: number;
  notes?: string;
}

export interface CreateResourceInput {
  merchantId: string;
  name: string;
  description?: string;
  resourceType: ResourceType;
  capacity: number;
  basePrice: number;
  pricingType: PricingType;
  durationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  photos?: string[];
  terms?: string;
  active?: boolean;
}

export interface UpdateResourceInput {
  name?: string;
  description?: string;
  resourceType?: ResourceType;
  capacity?: number;
  basePrice?: number;
  pricingType?: PricingType;
  durationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  photos?: string[];
  terms?: string;
  active?: boolean;
}

export interface UpsertMerchantInput {
  id: string;
  slug: string;
  businessName: string;
  niche: MerchantNiche;
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

export interface CreateAvailabilityRuleInput {
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
}

export interface CreateBlockInput {
  resourceId: string;
  startTime: string;
  endTime: string;
  reason: BlockReason;
  notes?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    until?: string;
  };
}

export type Asset = Resource;