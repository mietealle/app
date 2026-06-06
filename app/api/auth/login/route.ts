import { NextRequest, NextResponse } from 'next/server'

const BASE     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC      = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    // 1. Verify credentials
    const authRes = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const authData = await authRes.json()
    if (!authRes.ok) {
      const msg = authData.error_description ?? authData.msg ?? authData.error ?? 'Invalid credentials'
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    // 2. Fetch profile using service role (bypasses RLS)
    const profileRes = await fetch(
      `${BASE}/rest/v1/profiles?id=eq.${authData.user.id}&select=*&limit=1`,
      { headers: { apikey: SVC, Authorization: `Bearer ${SVC}` } }
    )
    const profiles = await profileRes.json()
    const profile = profiles?.[0]

    if (!profile)
      return NextResponse.json({ error: 'Profile not found. Run the seed script: node scripts/seed.mjs' }, { status: 404 })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (err: any) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
