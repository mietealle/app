export type UserRole = 'vendor' | 'renter' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type ProductStatus = 'active' | 'inactive' | 'pending'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company: string
  phone: string
  verificationStatus: VerificationStatus
  createdAt: string
  govtDocType?: string
  govtDocNumber?: string
}

export interface Product {
  id: string
  vendorId: string
  vendorName: string
  title: string
  description: string
  category: string
  pricePerDay: number
  minRentalDays: number
  location: string
  images: string[]
  status: ProductStatus
  available: boolean
  specifications: Record<string, string>
  createdAt: string
}

export interface Booking {
  id: string
  productId: string
  productTitle: string
  renterId: string
  renterName: string
  vendorId: string
  startDate: string
  endDate: string
  totalDays: number
  totalAmount: number
  status: BookingStatus
  createdAt: string
}
