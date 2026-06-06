import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H    = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' }

export async function PATCH(req: NextRequest) {
  try {
    const { userId, status, commissionRate } = await req.json()
    if (!userId || !['verified', 'rejected'].includes(status))
      return NextResponse.json({ error: 'userId and status (verified|rejected) required' }, { status: 400 })

    const patch: Record<string, any> = { verification_status: status }
    if (commissionRate !== undefined) patch.commission_rate = Number(commissionRate)

    const r = await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    })
    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: text }, { status: r.status })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
