import type { Asset, Booking, CreateBookingInput, Merchant, CreateAssetInput, UpdateAssetInput, UpsertMerchantInput, Payment } from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_ENCORE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

export async function getPublicMerchant(slug: string) {
  return request<{ merchant: Merchant; assets: Asset[] }>(`/public/merchant/${slug}`);
}

export async function getMerchantProfile(merchantId: string) {
  return request<{ merchant: Merchant }>(`/merchant/${merchantId}/profile`);
}

export async function upsertMerchantProfile(data: UpsertMerchantInput) {
  return request<{ ok: boolean }>("/merchant/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkAvailability(assetId: string, date: string) {
  return request<{ available: boolean }>(`/booking/availability/${assetId}/${date}`);
}

export async function checkTimeSlotAvailability(assetId: string, date: string, startTime: string) {
  return request<{ available: boolean }>(`/booking/availability/${assetId}/${date}/${startTime}`);
}

export async function createBooking(payload: CreateBookingInput) {
  return request<{
    bookingId: string;
    status: "PENDING_PAYMENT";
    depositAmount: number;
    payment: {
      paymentId: string;
      qrCode: string;
      copyPasteCode: string;
      expiresAt: string;
    };
  }>("/booking", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDashboardSummary(merchantId: string) {
  return request<{
    bookingsToday: number;
    monthRevenue: number;
    pendingBookings: number;
    totalAssets: number;
    activeAssets: number;
  }>(`/merchant/${merchantId}/dashboard`);
}

export async function listMerchantBookings(merchantId: string) {
  return request<{ bookings: Booking[] }>(`/merchant/${merchantId}/bookings`);
}

export async function updateBookingStatus(merchantId: string, bookingId: string, status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED") {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function listMerchantAssets(merchantId: string) {
  return request<{ assets: Asset[] }>(`/merchant/${merchantId}/assets`);
}

export async function getAsset(assetId: string) {
  return request<{ asset: Asset }>(`/asset/${assetId}`);
}

export async function createAsset(data: CreateAssetInput) {
  return request<{ asset: Asset }>("/asset", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAsset(assetId: string, data: UpdateAssetInput) {
  return request<{ asset: Asset }>(`/asset/${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAsset(assetId: string) {
  return request<{ ok: boolean }>(`/asset/${assetId}`, {
    method: "DELETE",
  });
}

export async function listMerchantPayments(merchantId: string) {
  return request<{ payments: Payment[] }>(`/merchant/${merchantId}/payments`);
}

export async function checkPaymentStatus(paymentId: string) {
  return request<{ status: string; bookingId: string }>(`/payment/${paymentId}/status`);
}
