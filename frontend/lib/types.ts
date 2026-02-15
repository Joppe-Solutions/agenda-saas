export type BusinessCategory = 
  | "BEAUTY"      // Salões, barbearias, estética
  | "HEALTH"      // Clínicas, consultórios
  | "WELLNESS"    // Yoga, pilates, spas
  | "EDUCATION"   // Aulas particulares
  | "SERVICES"    // Outros serviços
  | "PET";        // Pet shops, veterinários

export type BookingStatus = "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "CASH";
export type PaymentProvider = "MERCADO_PAGO" | "STUB";

export type BlockReason = "day_off" | "vacation" | "holiday" | "other";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "Aguardando Pagamento",
  confirmed: "Confirmado",
  in_progress: "Em Atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
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

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  BEAUTY: "Beleza e Estética",
  HEALTH: "Saúde",
  WELLNESS: "Bem-estar",
  EDUCATION: "Educação",
  SERVICES: "Serviços Gerais",
  PET: "Pet",
};

export const BUSINESS_CATEGORY_ICONS: Record<BusinessCategory, string> = {
  BEAUTY: "💇",
  HEALTH: "🏥",
  WELLNESS: "🧘",
  EDUCATION: "📚",
  SERVICES: "🔧",
  PET: "🐾",
};

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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
  staffMembers?: StaffMember[];
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
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
  createdAt: string;
  serviceName?: string;
  staffName?: string;
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

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export interface DashboardStats {
  bookingsToday: number;
  pendingToday: number;
  monthRevenue: number;
  pendingPayments: number;
  totalServices: number;
  activeServices: number;
  totalStaff: number;
  activeStaff: number;
  totalCustomers: number;
  newCustomersMonth: number;
}

export interface CreateServiceInput {
  merchantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  maxConcurrentBookings?: number;
  photos?: string[];
  active?: boolean;
  requireDeposit?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  allowStaffSelection?: boolean;
}

export interface UpdateServiceInput {
  categoryId?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  maxConcurrentBookings?: number;
  photos?: string[];
  active?: boolean;
  requireDeposit?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  allowStaffSelection?: boolean;
}

export interface CreateStaffInput {
  merchantId: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  commissionPercentage?: number;
  services: string[];
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  active?: boolean;
  commissionPercentage?: number;
  services?: string[];
}

export interface CreateAvailabilityInput {
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface CreateBlockInput {
  staffId: string;
  startTime: string;
  endTime: string;
  reason: BlockReason;
  notes?: string;
}

export interface CreateBookingInput {
  serviceId: string;
  staffId?: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
}

export interface UpsertMerchantInput {
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
  requireDeposit?: boolean;
  depositPercentage?: number;
  depositDeadlineMinutes?: number;
  autoConfirmOnPayment?: boolean;
  allowOnlinePayment?: boolean;
  cancellationDeadlineHours?: number;
  cancellationRefundPercentage?: number;
  enableReminders?: boolean;
  reminderHoursBefore?: number;
  enableLoyalty?: boolean;
  pointsPerReal?: number;
}

export interface ServiceTemplate {
  category: BusinessCategory;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
}

export interface PublicMerchantData {
  merchant: Merchant;
  services: Service[];
  staff: StaffMember[];
  categories: ServiceCategory[];
}