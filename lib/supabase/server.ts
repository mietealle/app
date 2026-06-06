/**
 * Server-side Supabase client.
 * Used in API routes and Server Components.
 * Reads the session from cookies automatically.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()           { return cookieStore.getAll() },
        setAll(toSet)      { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    },
  )
}

/**
 * Admin client with service-role key — bypasses RLS.
 * Use ONLY in server-side API routes for admin operations.
 */
export function createAdminClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll()           { return cookieStore.getAll() },
        setAll(toSet)      { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
      auth: { persistSession: false },
    },
  )
}
