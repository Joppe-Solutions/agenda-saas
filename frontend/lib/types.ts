export type MerchantNiche = "FISHING" | "SPORTS" | "TOURISM" | "SERVICES";
export type PricingType = "FULL_DAY" | "HOURLY";
export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";

export interface Merchant {
  id: string;
  slug: string;
  businessName: string;
  niche: MerchantNiche;
  whatsappNumber: string;
  pixKey: string;
  email?: string;
  mercadoPagoAccessToken?: string;
}

export interface Asset {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  pricingType: PricingType;
  durationMinutes?: number;
  active: boolean;
}

export interface Booking {
  id: string;
  assetId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  peopleCount: number;
  status: BookingStatus;
  depositAmount: number;
  paymentId: string | null;
  qrCode?: string;
  copyPasteCode?: string;
  createdAt: string;
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

export interface CreateBookingInput {
  assetId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime?: string;
  peopleCount: number;
}

export interface CreateAssetInput {
  merchantId: string;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  pricingType: PricingType;
  durationMinutes?: number;
  active?: boolean;
}

export interface UpdateAssetInput {
  name?: string;
  description?: string;
  capacity?: number;
  basePrice?: number;
  pricingType?: PricingType;
  durationMinutes?: number;
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
}
