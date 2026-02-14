export const merchantNiches = ["FISHING", "SPORTS", "TOURISM", "SERVICES"] as const;
export type MerchantNiche = "FISHING" | "SPORTS" | "TOURISM" | "SERVICES";

export const resourceTypes = [
  "BOAT",
  "SPORTS_COURT",
  "CONSULTING_ROOM",
  "EVENT_SPACE",
  "EQUIPMENT",
  "PROFESSIONAL",
  "VACATION_RENTAL",
  "OTHER",
] as const;
export type ResourceType = "BOAT" | "SPORTS_COURT" | "CONSULTING_ROOM" | "EVENT_SPACE" | "EQUIPMENT" | "PROFESSIONAL" | "VACATION_RENTAL" | "OTHER";

export const pricingTypes = ["FULL_DAY", "HOURLY", "SLOT", "PER_PERSON"] as const;
export type PricingType = "FULL_DAY" | "HOURLY" | "SLOT" | "PER_PERSON";

export const bookingStatuses = [
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type BookingStatus = "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export const blockReasons = ["maintenance", "vacation", "weather", "other"] as const;
export type BlockReason = "maintenance" | "vacation" | "weather" | "other";

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
  notes?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    until: string;
  };
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
  bookingId?: string;
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

export const resourceTemplates: ResourceTemplate[] = [
  {
    type: "BOAT",
    name: "Barco",
    icon: "🚤",
    defaultCapacity: 6,
    defaultPricingType: "FULL_DAY",
    defaultDurationMinutes: 480,
    description: "Barco de pesca, passeio ou turismo",
  },
  {
    type: "SPORTS_COURT",
    name: "Quadra",
    icon: "⚽",
    defaultCapacity: 20,
    defaultPricingType: "HOURLY",
    defaultDurationMinutes: 60,
    description: "Quadra esportiva (futebol, tênis, vôlei, etc.)",
  },
  {
    type: "CONSULTING_ROOM",
    name: "Consultório/Sala",
    icon: "🏥",
    defaultCapacity: 1,
    defaultPricingType: "HOURLY",
    defaultDurationMinutes: 60,
    description: "Sala para consultas, atendimentos ou reuniões",
  },
  {
    type: "EVENT_SPACE",
    name: "Espaço de Eventos",
    icon: "🎉",
    defaultCapacity: 50,
    defaultPricingType: "SLOT",
    defaultDurationMinutes: 240,
    description: "Espaço para festas, eventos ou celebrações",
  },
  {
    type: "EQUIPMENT",
    name: "Equipamento",
    icon: "🎮",
    defaultCapacity: 1,
    defaultPricingType: "HOURLY",
    defaultDurationMinutes: 60,
    description: "Equipamentos, consoles, máquinas ou ferramentas",
  },
  {
    type: "PROFESSIONAL",
    name: "Profissional",
    icon: "✂️",
    defaultCapacity: 1,
    defaultPricingType: "HOURLY",
    defaultDurationMinutes: 30,
    description: "Agenda de profissional (barbeiro, dentista, consultor, etc.)",
  },
  {
    type: "VACATION_RENTAL",
    name: "Imóvel Temporada",
    icon: "🏠",
    defaultCapacity: 4,
    defaultPricingType: "FULL_DAY",
    defaultDurationMinutes: 1440,
    description: "Casa, apartamento ou chalé para aluguel",
  },
  {
    type: "OTHER",
    name: "Outro",
    icon: "📦",
    defaultCapacity: 1,
    defaultPricingType: "HOURLY",
    defaultDurationMinutes: 60,
    description: "Outro tipo de recurso reservável",
  },
];