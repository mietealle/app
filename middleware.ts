/**
 * Middleware — kept minimal intentionally.
 *
 * Auth in Mietealle is handled entirely client-side via the ma_user cookie
 * (lib/session.ts). We do NOT use Supabase SSR session refresh here because:
 *  1. It makes an outbound HTTP call on every request → causes Edge timeout on Vercel
 *  2. Our API routes use the service-role key directly, not SSR sessions
 *  3. Session cookie is managed by the browser, not Next.js server cookies
 *
 * This file must exist for Next.js but does nothing except pass requests through.
 */
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Only run on actual app routes — skip static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
