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
  asset_id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  people_count: number;
  status: BookingStatus;
  deposit_amount: number;
  payment_id: string | null;
}

export interface CreateBookingInput {
  assetId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  peopleCount: number;
}
