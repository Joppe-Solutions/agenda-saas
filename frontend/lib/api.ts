import type { 
  Service, Booking, CreateBookingInput, Merchant, CreateServiceInput, 
  UpdateServiceInput, UpsertMerchantInput, Payment, TimeSlot,
  StaffMember, CreateStaffInput, UpdateStaffInput,
  StaffAvailability, CreateAvailabilityInput,
  StaffBlock, CreateBlockInput,
  ServiceCategory, DashboardStats, BookingStatus, Customer, CustomerTag,
  PublicMerchantData
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

export async function getPublicMerchant(slug: string): Promise<PublicMerchantData> {
  return request<PublicMerchantData>(`/public/merchant/${slug}`);
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

export async function getDashboardSummary(merchantId: string): Promise<DashboardStats> {
  return request<DashboardStats>(`/merchant/${merchantId}/dashboard`);
}

export async function getTodaysBookings(merchantId: string) {
  return request<{ bookings: Booking[] }>(`/merchant/${merchantId}/bookings/today`);
}

export async function listMerchantServices(merchantId: string) {
  return request<{ services: Service[] }>(`/merchant/${merchantId}/services`);
}

export async function getService(serviceId: string) {
  return request<{ service: Service }>(`/service/${serviceId}`);
}

export async function createService(data: CreateServiceInput) {
  return request<{ service: Service }>("/service", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateService(serviceId: string, data: UpdateServiceInput) {
  return request<{ service: Service }>(`/service/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteService(serviceId: string) {
  return request<{ ok: boolean }>(`/service/${serviceId}`, {
    method: "DELETE",
  });
}

export async function listServiceCategories(merchantId: string) {
  return request<{ categories: ServiceCategory[] }>(`/merchant/${merchantId}/categories`);
}

export async function createServiceCategory(merchantId: string, name: string, icon?: string, color?: string) {
  return request<{ category: ServiceCategory }>("/service-category", {
    method: "POST",
    body: JSON.stringify({ merchantId, name, icon, color }),
  });
}

export async function deleteServiceCategory(categoryId: string) {
  return request<{ ok: boolean }>(`/service-category/${categoryId}`, {
    method: "DELETE",
  });
}

export async function listMerchantStaff(merchantId: string) {
  return request<{ staff: StaffMember[] }>(`/merchant/${merchantId}/staff`);
}

export async function getStaffMember(staffId: string) {
  return request<{ staff: StaffMember }>(`/staff/${staffId}`);
}

export async function createStaffMember(data: CreateStaffInput) {
  return request<{ staff: StaffMember }>("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStaffMember(staffId: string, data: UpdateStaffInput) {
  return request<{ staff: StaffMember }>(`/staff/${staffId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStaffMember(staffId: string) {
  return request<{ ok: boolean }>(`/staff/${staffId}`, {
    method: "DELETE",
  });
}

export async function listStaffAvailability(staffId: string) {
  return request<{ availability: StaffAvailability[] }>(`/staff/${staffId}/availability`);
}

export async function setStaffAvailability(staffId: string, availability: CreateAvailabilityInput[]) {
  return request<{ ok: boolean }>(`/staff/${staffId}/availability/set`, {
    method: "POST",
    body: JSON.stringify({ availability }),
  });
}

export async function listStaffBlocks(staffId: string) {
  return request<{ blocks: StaffBlock[] }>(`/staff/${staffId}/blocks`);
}

export async function createStaffBlock(data: CreateBlockInput) {
  return request<{ block: StaffBlock }>("/staff-block", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteStaffBlock(blockId: string) {
  return request<{ ok: boolean }>(`/staff-block/${blockId}`, {
    method: "DELETE",
  });
}

export async function getAvailableSlots(serviceId: string, date: string, staffId?: string) {
  const query = staffId ? `?staffId=${staffId}` : "";
  return request<{ slots: TimeSlot[] }>(`/service/${serviceId}/slots/${date}${query}`);
}

export async function getStaffAvailableSlots(staffId: string, serviceId: string, date: string) {
  return request<{ slots: TimeSlot[] }>(`/staff/${staffId}/slots/${serviceId}/${date}`);
}

export async function createBooking(payload: CreateBookingInput) {
  return request<{
    bookingId: string;
    status: "pending_payment" | "confirmed";
    depositAmount: number;
    totalAmount: number;
    depositExpiresAt?: string;
    payment?: {
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
  filters?: { status?: BookingStatus; fromDate?: string; toDate?: string; staffId?: string }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.fromDate) params.set("fromDate", filters.fromDate);
  if (filters?.toDate) params.set("toDate", filters.toDate);
  if (filters?.staffId) params.set("staffId", filters.staffId);
  
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
    topServices: Array<{
      serviceId: string;
      serviceName: string;
      bookingCount: number;
      revenue: number;
    }>;
    topStaff: Array<{
      staffId: string;
      staffName: string;
      bookingCount: number;
      revenue: number;
      commission: number;
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
    customers: Customer[];
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
  data: { newDate: string; newStartTime?: string; staffId?: string }
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
      startTime: string;
      endTime: string;
      status: string;
      depositAmount: number;
      totalAmount: number;
      createdAt: string;
      serviceName: string;
      staffName?: string;
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
    service: {
      name: string;
      durationMinutes: number;
    };
    payment?: {
      id: string;
      amount: number;
      status: string;
      paidAt?: string;
    };
  }>(`/booking/${bookingId}/receipt`);
}

export async function updateMerchantSettings(
  merchantId: string,
  data: {
    requireDeposit?: boolean;
    depositPercentage?: number;
    depositDeadlineMinutes?: number;
    autoConfirmOnPayment?: boolean;
    allowOnlinePayment?: boolean;
    enableReminders?: boolean;
    reminderHoursBefore?: number;
    enableLoyalty?: boolean;
    pointsPerReal?: number;
    cancellationDeadlineHours?: number;
    cancellationRefundPercentage?: number;
  }
) {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getStaffSchedule(staffId: string, fromDate: string, toDate: string) {
  return request<{
    bookings: Booking[];
    blocks: StaffBlock[];
  }>(`/staff/${staffId}/schedule?fromDate=${fromDate}&toDate=${toDate}`);
}

export async function updateCancellationPolicy(
  merchantId: string,
  data: { deadlineHours: number; refundPercentage: number }
) {
  return request<{ ok: boolean }>(`/merchant/${merchantId}/cancellation-policy`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function listCustomerTags(merchantId: string) {
  return request<{ tags: Array<{ id: string; name: string; color: string; merchantId: string }> }>(
    `/merchant/${merchantId}/customer-tags`
  );
}

export async function createCustomerTag(merchantId: string, name: string, color: string) {
  return request<{ tag: { id: string; name: string; color: string; merchantId: string } }>("/customer-tag", {
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
  return request<{ ok: boolean }>(`/customer/${customerId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tagId }),
  });
}

export async function removeTagFromCustomer(customerId: string, tagId: string) {
  return request<{ ok: boolean }>(`/customer/${customerId}/tags/${tagId}`, {
    method: "DELETE",
  });
}