import type { 
  Resource, Booking, CreateBookingInput, Merchant, CreateResourceInput, 
  UpdateResourceInput, UpsertMerchantInput, Payment, TimeSlot, AvailabilityRule,
  CreateAvailabilityRuleInput, Block, CreateBlockInput, ResourceTemplate,
  DashboardStats, BookingStatus, Customer, CustomerTag
} from "@/lib/types";

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
  return request<{ merchant: Merchant; resources: Resource[] }>(`/public/merchant/${slug}`);
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

export async function updateSignalConfig(
  merchantId: string, 
  data: { signalPercentage?: number; signalDeadlineMinutes?: number; signalAutoCancel?: boolean }
) {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/signal-config`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCancellationPolicy(
  merchantId: string, 
  data: { deadlineHours?: number; refundPercentage?: number }
) {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/cancellation-policy`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getDashboardSummary(merchantId: string): Promise<DashboardStats> {
  return request<DashboardStats>(`/merchant/${merchantId}/dashboard`);
}

export async function getTodaysBookings(merchantId: string) {
  return request<{ bookings: Booking[] }>(`/merchant/${merchantId}/bookings/today`);
}

export async function getResourceTemplates() {
  return request<{ templates: ResourceTemplate[] }>("/resource-templates");
}

export async function listMerchantResources(merchantId: string) {
  return request<{ resources: Resource[] }>(`/merchant/${merchantId}/resources`);
}

export async function getResource(resourceId: string) {
  return request<{ resource: Resource }>(`/resource/${resourceId}`);
}

export async function createResource(data: CreateResourceInput) {
  return request<{ resource: Resource }>("/resource", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateResource(resourceId: string, data: UpdateResourceInput) {
  return request<{ resource: Resource }>(`/resource/${resourceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteResource(resourceId: string) {
  return request<{ ok: boolean }>(`/resource/${resourceId}`, {
    method: "DELETE",
  });
}

export async function listAvailabilityRules(resourceId: string) {
  return request<{ rules: AvailabilityRule[] }>(`/resource/${resourceId}/availability`);
}

export async function createAvailabilityRule(data: CreateAvailabilityRuleInput) {
  return request<{ rule: AvailabilityRule }>("/availability-rule", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAvailabilityRule(ruleId: string) {
  return request<{ ok: boolean }>(`/availability-rule/${ruleId}`, {
    method: "DELETE",
  });
}

export async function setAvailabilityRules(resourceId: string, rules: Omit<CreateAvailabilityRuleInput, 'resourceId'>[]) {
  return request<{ ok: boolean }>(`/resource/${resourceId}/availability/set`, {
    method: "POST",
    body: JSON.stringify({ rules }),
  });
}

export async function listBlocks(resourceId: string) {
  return request<{ blocks: Block[] }>(`/resource/${resourceId}/blocks`);
}

export async function createBlock(data: CreateBlockInput) {
  return request<{ block: Block }>("/block", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteBlock(blockId: string) {
  return request<{ ok: boolean }>(`/block/${blockId}`, {
    method: "DELETE",
  });
}

export async function getAvailableSlots(resourceId: string, date: string) {
  return request<{ slots: TimeSlot[] }>(`/resource/${resourceId}/slots/${date}`);
}

export async function checkAvailability(resourceId: string, date: string) {
  return request<{ available: boolean }>(`/booking/availability/${resourceId}/${date}`);
}

export async function checkTimeSlotAvailability(resourceId: string, date: string, startTime: string, endTime: string) {
  return request<{ available: boolean }>(`/booking/availability/${resourceId}/${date}/${startTime}/${endTime}`);
}

export async function createBooking(payload: CreateBookingInput) {
  return request<{
    bookingId: string;
    status: "pending_payment";
    depositAmount: number;
    totalAmount: number;
    signalExpiresAt: string;
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

export async function getBooking(bookingId: string) {
  return request<{ booking: Booking }>(`/booking/${bookingId}`);
}

export async function listMerchantBookings(
  merchantId: string, 
  filters?: { status?: BookingStatus; fromDate?: string; toDate?: string }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.fromDate) params.set("fromDate", filters.fromDate);
  if (filters?.toDate) params.set("toDate", filters.toDate);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<{ bookings: Booking[] }>(`/merchant/${merchantId}/bookings${query}`);
}

export async function updateBookingStatus(
  merchantId: string, 
  bookingId: string, 
  status: BookingStatus,
  internalNotes?: string
) {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, internalNotes }),
  });
}

export async function listMerchantPayments(merchantId: string) {
  return request<{ payments: Payment[] }>(`/merchant/${merchantId}/payments`);
}

export async function checkPaymentStatus(paymentId: string) {
  return request<{ status: string; bookingId: string }>(`/payment/${paymentId}/status`);
}

export async function getReportsSummary(merchantId: string, period?: "day" | "week" | "month") {
  const query = period ? `?period=${period}` : "";
  return request<{
    period: string;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    noShowCount: number;
    totalRevenue: number;
    pendingRevenue: number;
    avgBookingValue: number;
    noShowRate: number;
    topResources: Array<{
      resourceId: string;
      resourceName: string;
      bookingCount: number;
      revenue: number;
    }>;
    dailyBreakdown: Array<{
      date: string;
      bookings: number;
      revenue: number;
    }>;
  }>(`/merchant/${merchantId}/reports/summary${query}`);
}

export async function getCustomersList(merchantId: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<{
    customers: Array<{
      id: string;
      name: string;
      phone: string;
      email?: string;
      document?: string;
      notes?: string;
      createdAt: string;
      totalBookings: number;
      totalSpent: number;
      lastBookingDate?: string;
    }>;
  }>(`/merchant/${merchantId}/customers${query}`);
}

export async function getCustomerHistory(customerId: string) {
  return request<{
    customer: Customer;
    stats: {
      totalBookings: number;
      totalSpent: number;
      noShowCount: number;
    };
    tags: CustomerTag[];
    bookings: Booking[];
  }>(`/customer/${customerId}/history`);
}

export async function rescheduleBooking(
  bookingId: string,
  data: { newDate: string; newStartTime?: string; newEndTime?: string }
) {
  return request<{ booking: Booking }>(`/booking/${bookingId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function retryBookingPayment(bookingId: string) {
  return request<{
    ok: boolean;
    payment: {
      paymentId: string;
      qrCode: string;
      copyPasteCode: string;
      expiresAt: string;
    };
  }>(`/booking/${bookingId}/retry-payment`, {
    method: "POST",
  });
}

export async function getBookingReceipt(bookingId: string) {
  return request<{
    booking: {
      id: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      bookingDate: string;
      startTime?: string;
      endTime?: string;
      peopleCount: number;
      status: string;
      depositAmount: number;
      totalAmount: number;
      createdAt: string;
    };
    merchant: {
      businessName: string;
      slug: string;
      whatsappNumber: string;
      email?: string;
      address?: string;
      city?: string;
      pixKey: string;
    };
    resource: {
      name: string;
      type: string;
    };
    payment?: {
      id: string;
      amount: number;
      status: string;
      paidAt?: string;
    };
  }>(`/booking/${bookingId}/receipt`);
}

export async function listCustomerTags(merchantId: string) {
  return request<{ tags: CustomerTag[] }>(`/merchant/${merchantId}/customer-tags`);
}

export async function createCustomerTag(merchantId: string, name: string, color?: string) {
  return request<{ tag: CustomerTag }>("/customer-tag", {
    method: "POST",
    body: JSON.stringify({ merchantId, name, color }),
  });
}

export async function deleteCustomerTag(tagId: string) {
  return request<{ ok: boolean }>(`/customer-tag/${tagId}`, {
    method: "DELETE",
  });
}

export async function assignTagToCustomer(customerId: string, tagId: string) {
  return request<{ ok: boolean }>(`/customer/${customerId}/tag/${tagId}`, {
    method: "POST",
  });
}

export async function removeTagFromCustomer(customerId: string, tagId: string) {
  return request<{ ok: boolean }>(`/customer/${customerId}/tag/${tagId}`, {
    method: "DELETE",
  });
}

export { Resource as Asset };
export { CreateResourceInput as CreateAssetInput };
export { UpdateResourceInput as UpdateAssetInput };
export { listMerchantResources as listMerchantAssets };
export { getResource as getAsset };
export { createResource as createAsset };
export { updateResource as updateAsset };
export { deleteResource as deleteAsset };