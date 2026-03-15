// ============================================================
// ENUMS
// ============================================================

export type AdminRole       = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
export type ContentStatus   = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type StaffRole       = 'DOCTOR' | 'BEAUTICIAN' | 'TECHNICIAN' | 'NURSE' | 'RECEPTIONIST'
export type SalaryType      = 'MONTHLY' | 'DAILY' | 'COMMISSION_ONLY' | 'MIXED'
export type Gender          = 'MALE' | 'FEMALE'
export type PatientSource   = 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP' | 'WALK_IN' | 'REFERRAL' | 'OTHER'
export type AppointmentType = 'ONLINE' | 'WALK_IN' | 'PHONE' | 'WHATSAPP' | 'ADMIN'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type PaymentStatus   = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'
export type PaymentMethod   = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE'
export type OfferType       = 'BUNDLE' | 'SEASONAL' | 'FIRST_VISIT' | 'LOYALTY' | 'FLASH'
export type DiscountType    = 'PERCENTAGE' | 'FIXED'
export type RevenueType     = 'APPOINTMENT' | 'PRODUCT_SALE' | 'OTHER'
export type ExpenseCategory = 'SUPPLIES' | 'EQUIPMENT' | 'RENT' | 'UTILITIES' | 'MARKETING' | 'MAINTENANCE' | 'OTHER'
export type SalaryStatus    = 'PENDING' | 'PAID' | 'PARTIALLY_PAID'
export type InventoryType   = 'MEDICAL_SUPPLY' | 'COSMETIC_PRODUCT' | 'EQUIPMENT' | 'CONSUMABLE'
export type TransactionType = 'PURCHASE' | 'USAGE' | 'SALE' | 'ADJUSTMENT' | 'EXPIRED' | 'RETURN'
export type MessageStatus   = 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED'

// ============================================================
// CORE ENTITIES
// ============================================================

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  avatar?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface ClinicSettings {
  id: number
  name: string
  tagline?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  city?: string
  country?: string
  logoUrl?: string
  faviconUrl?: string
  currencySymbol: string
  taxRate: number
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  workingHours?: WorkingHours
  clinicImages?: ClinicImage[]
}

export interface WorkingHours {
  [day: string]: { open: string; close: string; closed: boolean }
}

export interface ClinicImage {
  id: number
  url: string
  caption?: string
  order: number
}

// ============================================================
// FAQ
// ============================================================

export interface FAQ {
  id: number
  question: string
  answer: string
  categoryId?: number
  category?: FAQCategory
  order: number
  isActive: boolean
  createdAt: string
}

export interface FAQCategory {
  id: number
  name: string
  order: number
  faqs?: FAQ[]
}

// ============================================================
// BLOG
// ============================================================

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  status: ContentStatus
  authorId?: number
  author?: StaffMember
  categoryId?: number
  category?: BlogCategory
  tags?: BlogTag[]
  images?: BlogImage[]
  sections?: BlogSection[]
  metaTitle?: string
  metaDesc?: string
  views: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
}

export interface BlogTag {
  id: number
  name: string
}

export interface BlogImage {
  id: number
  postId: number
  url: string
  alt?: string
  caption?: string
  order: number
}

export interface BlogSection {
  id: number
  postId: number
  title?: string
  content: string
  imageUrl?: string
  order: number
}

// ============================================================
// CATEGORIES & SERVICES
// ============================================================

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  iconName?: string
  parentId?: number
  parent?: Category
  children?: Category[]
  services?: Service[]
  order: number
  isActive: boolean
  createdAt: string
}

export interface Service {
  id: number
  name: string
  slug: string
  description?: string
  longDescription?: string
  imageUrl?: string
  categoryId?: number
  category?: Category
  price: number
  icon?: keyof typeof ICON_MAP;
  discountedPrice?: number
  duration?: number
  isActive: boolean
  isFeatured: boolean
  order: number
  createdAt: string
}


// ============================================================
// OFFERS
// ============================================================

export interface Offer {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  type: OfferType
  discountType: DiscountType
  discountValue: number
  originalPrice?: number
  finalPrice: number
  isActive: boolean
  isFeatured: boolean
  validFrom?: string
  validUntil?: string
  maxRedemptions?: number
  redemptionsCount: number
  services?: Service[]
  createdAt: string
}

// ============================================================
// TEAM
// ============================================================

export interface StaffMember {
  id: number
  firstName: string
  lastName: string
  role: StaffRole
  specialization?: string
  bio?: string
  avatarUrl?: string
  phone?: string
  email?: string
  nationalId?: string
  gender?: Gender
  birthDate?: string
  hireDate: string
  terminationDate?: string
  isActive: boolean
  salaryType: SalaryType
  baseSalary: number
  commissionRate?: number
  allowances: number
  deductions: number
  qualifications?: StaffQualification[]
  schedules?: StaffSchedule[]
  createdAt: string
}

export interface StaffQualification {
  id: number
  staffId: number
  title: string
  institute?: string
  year?: number
  fileUrl?: string
}

export interface StaffSchedule {
  id: number
  staffId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isOff: boolean
}

// ============================================================
// PATIENTS
// ============================================================

export interface Patient {
  id: number
  firstName: string
  lastName: string
  phone: string
  email?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  bloodType?: string
  allergies?: string
  medicalNotes?: string
  address?: string
  referredBy?: string
  source: PatientSource
  isActive: boolean
  appointments?: Appointment[]
  medicalHistory?: MedicalRecord[]
  createdAt: string
}

export interface MedicalRecord {
  id: number
  patientId: number
  title: string
  notes?: string
  attachments: string[]
  recordDate: string
}

// ============================================================
// APPOINTMENTS
// ============================================================

export interface Appointment {
  id: number
  appointmentNo: string
  type: AppointmentType
  status: AppointmentStatus
  patientId: number
  patient?: Patient
  staffId?: number
  staff?: StaffMember
  scheduledAt: string
  duration?: number
  notes?: string
  internalNotes?: string
  services?: AppointmentServiceItem[]
  offers?: AppointmentOfferItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paidAt?: string
  sourceNote?: string
  cancelReason?: string
  createdAt: string
}

export interface AppointmentServiceItem {
  id: number
  serviceId: number
  service?: Service
  price: number
  quantity: number
}

export interface AppointmentOfferItem {
  id: number
  offerId: number
  offer?: Offer
  price: number
}

// ============================================================
// FINANCE
// ============================================================

export interface RevenueRecord {
  id: number
  type: RevenueType
  amount: number
  description?: string
  appointmentId?: number
  appointment?: Appointment
  paymentMethod?: PaymentMethod
  reference?: string
  date: string
}

export interface ExpenseRecord {
  id: number
  category: ExpenseCategory
  title: string
  amount: number
  description?: string
  vendor?: string
  receiptUrl?: string
  date: string
  createdAt: string
}

export interface SalaryRecord {
  id: number
  staffId: number
  staff?: StaffMember
  month: number
  year: number
  baseSalary: number
  allowances: number
  deductions: number
  commission: number
  bonus: number
  netSalary: number
  status: SalaryStatus
  paidAt?: string
  notes?: string
}

export interface FinanceSummary {
  totalRevenue: number
  totalExpenses: number
  totalSalaries: number
  netProfit: number
  revenueGrowth: number  // % vs last period
  period: string
}

// ============================================================
// INVENTORY
// ============================================================

export interface InventoryCategory {
  id: number
  name: string
  type: InventoryType
}

export interface InventoryItem {
  id: number
  name: string
  sku?: string
  description?: string
  categoryId?: number
  category?: InventoryCategory
  type: InventoryType
  imageUrl?: string
  quantityInStock: number
  unit: string
  reorderLevel: number
  reorderQty: number
  costPrice?: number
  sellingPrice?: number
  expiryDate?: string
  batchNumber?: string
  manufacturer?: string
  supplier?: string
  isActive: boolean
  createdAt: string
}

export interface InventoryTransaction {
  id: number
  itemId: number
  item?: InventoryItem
  type: TransactionType
  quantity: number
  reason?: string
  reference?: string
  cost?: number
  date: string
}

// ============================================================
// MESSAGES
// ============================================================

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: MessageStatus
  reply?: string
  repliedAt?: string
  createdAt: string
}

// ============================================================
// UI HELPERS
// ============================================================

export interface TableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  monthRevenue: number
  pendingMessages: number
  lowStockItems: number
  expiringItems: number
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface Testimonial {
  id: string | number
  name: string
  review: string
  rating: number
  avatar?: string
}
