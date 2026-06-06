/**
 * In-memory session store.
 * Data lives as long as the browser tab is open.
 * Next.js client-side navigation does NOT reload this module,
 * so state persists across all page visits within one session.
 *
 * For production: replace with Supabase calls.
 */

import type { User, Product } from './types'

// ── Registered users (new sign-ups during this session) ─────────────────────
const _users: User[] = []

export function addUser(user: User) {
  _users.push(user)
}

export function getSessionUsers(): User[] {
  return [..._users]
}

// ── New products listed during this session ──────────────────────────────────
const _products: Product[] = []

export function addProduct(product: Product) {
  _products.push(product)
}

export function getSessionProducts(): Product[] {
  return [..._products]
}

// ── Verification status overrides (admin approve/reject) ─────────────────────
// Keyed by user id → new status
const _verificationOverrides: Record<string, 'verified' | 'rejected'> = {}

export function setVerificationStatus(userId: string, status: 'verified' | 'rejected') {
  _verificationOverrides[userId] = status
}

export function getVerificationStatus(userId: string): 'verified' | 'rejected' | null {
  return _verificationOverrides[userId] ?? null
}

export function getVerificationOverrides() {
  return { ..._verificationOverrides }
}

// ── Helper: generate a simple unique id ──────────────────────────────────────
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
