import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H    = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' }

async function supaGet(path: string) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message ?? data.hint ?? JSON.stringify(data))
  return Array.isArray(data) ? data : [data]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category  = searchParams.get('category')
    const location  = searchParams.get('location')
    const available = searchParams.get('available')
    const vendorId  = searchParams.get('vendor_id')

    // Build filters — URL-encode values to prevent & in category breaking the query
    const filters: string[] = ['status=eq.active']
    if (category)           filters.push(`category=eq.${encodeURIComponent(category)}`)
    if (location)           filters.push(`location=ilike.${encodeURIComponent(`*${location}*`)}`)
    if (available === 'true') filters.push('available=eq.true')
    if (vendorId)           filters.push(`vendor_id=eq.${vendorId}`)

    const qs = filters.join('&')
    const products = await supaGet(`products?${qs}&order=created_at.desc&select=*`)

    if (products.length === 0) return NextResponse.json({ products: [] })

    // Fetch vendor profiles separately (avoids FK join issues)
    const vendorIds = Array.from(new Set(products.map((p: any) => p.vendor_id).filter(Boolean)))
    const vendorsRaw = vendorIds.length > 0
      ? await supaGet(`profiles?id=in.(${vendorIds.join(',')})&select=id,name,company,verification_status,phone,email`)
      : []
    const vendorMap = Object.fromEntries(vendorsRaw.map((v: any) => [v.id, v]))

    const enriched = products.map((p: any) => ({ ...p, vendor: vendorMap[p.vendor_id] ?? null }))
    return NextResponse.json({ products: enriched })
  } catch (err: any) {
    console.error('[GET /api/products]', err.message)
    return NextResponse.json({ error: err.message, products: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { vendorId, title, description, category, pricePerDay, minRentalDays, location, specifications, images } = body
    if (!vendorId || !title || !pricePerDay)
      return NextResponse.json({ error: 'vendorId, title, pricePerDay required' }, { status: 400 })

    const r = await fetch(`${BASE}/rest/v1/products`, {
      method: 'POST',
      headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify({
        vendor_id: vendorId, title, description: description ?? null,
        category: category ?? null, price_per_day: Number(pricePerDay),
        min_rental_days: Number(minRentalDays ?? 1), location: location ?? null,
        specifications: specifications ?? {}, images: images ?? [],
        status: 'active',   // auto-approve on publish
        available: true,
      }),
    })
    const data = await r.json()
    if (!r.ok) return NextResponse.json({ error: data.message }, { status: r.status })
    return NextResponse.json({ product: Array.isArray(data) ? data[0] : data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
