import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H    = { apikey: SVC, Authorization: `Bearer ${SVC}` }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const filter = role ? `role=eq.${role}` : 'role=neq.admin'
    const r = await fetch(`${BASE}/rest/v1/profiles?${filter}&order=created_at.desc&select=*`, { headers: H })
    const data = await r.json()
    if (!r.ok) return NextResponse.json({ error: data.message ?? JSON.stringify(data) }, { status: r.status })
    return NextResponse.json({ users: data })
  } catch (err: any) {
    console.error('[GET /api/admin/users]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
