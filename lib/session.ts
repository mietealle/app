/**
 * Client-side session helpers.
 * After login, we store the user profile in a plain (non-httpOnly) cookie
 * so any client component can read it instantly without an API call.
 */

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'vendor' | 'renter' | 'admin'
  company: string
  phone?: string
  city?: string
  verification_status: 'pending' | 'verified' | 'rejected'
}

const COOKIE_NAME = 'ma_user'
const MAX_AGE = 60 * 60 * 24  // 24 hours

export function saveSession(user: SessionUser) {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

export function getSession(): SessionUser | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
  } catch { return null }
}

export function clearSession() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}
