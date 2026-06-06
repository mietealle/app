import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H    = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' }

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const r = await fetch(`${BASE}/rest/v1/products?id=eq.${params.id}&select=*&limit=1`, { headers: H })
    const data = await r.json()
    if (!r.ok || !data?.[0]) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const product = data[0]

    // Fetch vendor separately
    const vr = await fetch(`${BASE}/rest/v1/profiles?id=eq.${product.vendor_id}&select=id,name,company,phone,email,city,verification_status&limit=1`, { headers: H })
    const vdata = await vr.json()
    const vendor = vdata?.[0] ?? null

    // Fetch bookings for this product (for calendar)
    const br = await fetch(`${BASE}/rest/v1/bookings?product_id=eq.${params.id}&select=start_date,end_date,status&status=neq.cancelled`, { headers: H })
    const bookings = br.ok ? await br.json() : []

    return NextResponse.json({ product: { ...product, vendor, bookings } })
  } catch (err: any) {
    console.error('[GET /api/products/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const r = await fetch(`${BASE}/rest/v1/products?id=eq.${params.id}`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) return NextResponse.json({ error: data.message }, { status: r.status })
    return NextResponse.json({ product: Array.isArray(data) ? data[0] : data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
