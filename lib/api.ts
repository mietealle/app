/**
 * Thin client helpers for calling the Next.js API routes.
 * Falls back to mock data when NEXT_PUBLIC_SUPABASE_URL is not set (demo mode).
 */

const isSupabaseConfigured =
  typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0

export const SUPABASE_ENABLED = isSupabaseConfigured

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(payload: {
  name: string; email: string; password: string; role: 'vendor' | 'renter'
  company?: string; phone?: string; address?: string; city?: string; vatId?: string
  docType?: string; docNumber?: string
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function apiGetProducts(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`/api/products${qs}`)
  return res.json()
}

export async function apiCreateProduct(payload: object) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function apiGetBookings() {
  const res = await fetch('/api/bookings')
  return res.json()
}

export async function apiCreateBooking(payload: {
  productId: string; startDate: string; endDate: string
}) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function apiGetUsers(role?: 'vendor' | 'renter') {
  const qs = role ? `?role=${role}` : ''
  const res = await fetch(`/api/admin/users${qs}`)
  return res.json()
}

export async function apiVerifyUser(userId: string, status: 'verified' | 'rejected') {
  const res = await fetch('/api/admin/verify', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, status }),
  })
  return res.json()
}
