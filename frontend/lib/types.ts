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
}

export interface Asset {
  id: string;
  merchantId: string;
  name: string;
  capacity: number;
  basePrice: number;
  pricingType: PricingType;
  active: boolean;
}

export interface Booking {
  id: string;
  assetId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  peopleCount: number;
  status: BookingStatus;
  depositAmount: number;
  paymentId: string | null;
  createdAt: string;
}

export interface CreateBookingInput {
  assetId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  peopleCount: number;
}
