// Client Types
export type ClientType = "investor" | "buyer" | "tenant"
export type ClientStatus = "active" | "pending" | "inactive"

export interface Client {
  id: string
  userId?: string
  name: string
  email: string
  phone: string
  type: ClientType
  status: ClientStatus
  apartmentId?: string
  createdAt: Date
  updatedAt: Date
}

// Apartment Types
export type ApartmentStatus = "available" | "reserved" | "sold" | "maintenance"

export interface Apartment {
  id: string
  buildingId: string
  number: string
  floor: number
  type: string
  size: number
  price: number
  status: ApartmentStatus
  features?: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

// Building Types
export type BuildingStatus = "active" | "construction" | "planned"

export interface Building {
  id: string
  name: string
  address: string
  floors: number
  units: number
  status: BuildingStatus
  amenities?: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

// Payment Types
export type PaymentStatus = "paid" | "pending" | "overdue"
export type PaymentMethod = "bank_transfer" | "cash" | "check" | "credit_card"
export type Currency = "USD" | "PKR"

export interface Payment {
  id: string
  clientId: string
  apartmentId: string
  amount: number
  currency: Currency
  status: PaymentStatus
  method: PaymentMethod
  reference?: string
  description?: string
  dueDate: Date
  paidDate?: Date
  createdAt: Date
  updatedAt: Date
}

// User Types
export type UserRole = "admin" | "manager" | "staff" | "client"
export type UserStatus = "active" | "inactive"

export interface User {
  id: string
  uid: string
  name: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  permissions?: string[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Lead Types
export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted"
export type LeadSource = "website" | "referral" | "social_media" | "property_portal" | "walk_in" | "other"

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  interest: string
  source: LeadSource
  status: LeadStatus
  assignedTo?: string
  notes?: string
  lastContact?: Date
  createdAt: Date
  updatedAt: Date
}

// Ad Banner Type
export interface AdBanner {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Settings Type
export interface SystemSettings {
  id: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  defaultCurrency: Currency
  language: string
  timezone: string
  dateFormat: string
  logoUrl?: string
  updatedAt: Date
}

// Document Types
export type DocumentType = "identity" | "contract" | "payment" | "other"

export interface Document {
  id: string
  clientId: string
  title: string
  type: DocumentType
  fileUrl: string
  filePath?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

// Maintenance Request Types
export type MaintenanceStatus = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled"
export type MaintenancePriority = "low" | "medium" | "high" | "emergency"

export interface MaintenanceRequest {
  id: string
  clientId: string
  apartmentId: string
  title: string
  description: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  assignedTo?: string
  scheduledDate?: Date
  completedDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Notification Types
export type NotificationType = "payment" | "maintenance" | "document" | "system"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

// Transaction Types
export type TransactionType = "income" | "expense"
export type AccountType = "construction" | "finance"

export interface Transaction {
  id: string
  accountType: AccountType
  type: TransactionType
  amount: number
  currency: Currency
  category: string
  description: string
  reference?: string
  createdAt: Date
}
