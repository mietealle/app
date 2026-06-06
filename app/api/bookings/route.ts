import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H    = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' }

async function supaGet(path: string) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message ?? JSON.stringify(data))
  return Array.isArray(data) ? data : [data]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const renterId  = searchParams.get('renter_id')
    const vendorId  = searchParams.get('vendor_id')
    const productId = searchParams.get('product_id')

    const filters: string[] = []
    if (renterId)  filters.push(`renter_id=eq.${renterId}`)
    if (vendorId)  filters.push(`vendor_id=eq.${vendorId}`)
    if (productId) filters.push(`product_id=eq.${productId}`)
    const qs = filters.length ? filters.join('&') + '&' : ''

    const bookings = await supaGet(`bookings?${qs}order=created_at.desc&select=*`)
    if (bookings.length === 0) return NextResponse.json({ bookings: [] })

    // Separate fetches for related data — use Array.from for ES5 compatibility
    const productIds    = Array.from(new Set(bookings.map((b: any) => b.product_id).filter(Boolean)))
    const renterIds     = Array.from(new Set(bookings.map((b: any) => b.renter_id).filter(Boolean)))
    const vendorIds     = Array.from(new Set(bookings.map((b: any) => b.vendor_id).filter(Boolean)))
    const allProfileIds = Array.from(new Set([...renterIds, ...vendorIds]))

    const [products, profiles] = await Promise.all([
      productIds.length > 0
        ? supaGet(`products?id=in.(${productIds.join(',')})&select=id,title,images,price_per_day`)
        : Promise.resolve([]),
      allProfileIds.length > 0
        ? supaGet(`profiles?id=in.(${allProfileIds.join(',')})&select=id,name,company,email,phone`)
        : Promise.resolve([]),
    ])

    const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]))
    const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))

    const enriched = bookings.map((b: any) => ({
      ...b,
      product: productMap[b.product_id] ?? null,
      renter:  profileMap[b.renter_id]  ?? null,
      vendor:  profileMap[b.vendor_id]  ?? null,
    }))

    return NextResponse.json({ bookings: enriched })
  } catch (err: any) {
    console.error('[GET /api/bookings]', err.message)
    return NextResponse.json({ error: err.message, bookings: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, renterId, startDate, endDate, transportOption, transportCost, insuranceSelected, insuranceCost, deliveryAddress } = await req.json()
    if (!productId || !renterId || !startDate || !endDate)
      return NextResponse.json({ error: 'productId, renterId, startDate, endDate required' }, { status: 400 })

    const products = await supaGet(`products?id=eq.${productId}&select=vendor_id,price_per_day,available&limit=1`)
    const product = products[0]
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const totalDays = Math.max(1, Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
    ))
    const totalAmount = totalDays * Number(product.price_per_day)

    // Core booking fields (always work with base schema)
    const corePayload = {
      product_id: productId, renter_id: renterId, vendor_id: product.vendor_id,
      start_date: startDate, end_date: endDate,
      total_days: totalDays, total_amount: totalAmount, status: 'pending',
    }

    // Try with extended fields first (schema-v2)
    const tCost = transportOption === 'vendor' ? Number(transportCost ?? 0) : 0
    const iCost = insuranceSelected ? Number(insuranceCost ?? 0) : 0
    const extPayload = {
      ...corePayload,
      tracking_status: 'pending',
      transport_option: transportOption ?? 'self_pickup',
      transport_cost: tCost,
      insurance_selected: insuranceSelected ?? false,
      insurance_cost: iCost,
      delivery_address: deliveryAddress ?? null,
      pre_payment_amount: Math.min(totalAmount, Number(product.price_per_day) * 5),
      commission_rate: 10,
    }

    let r = await fetch(`${BASE}/rest/v1/bookings`, {
      method: 'POST', headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify(extPayload),
    })

    // If extended fields fail (schema-v2 not run), fallback to core fields
    if (!r.ok) {
      const errText = await r.text()
      if (errText.includes('column') || errText.includes('does not exist')) {
        r = await fetch(`${BASE}/rest/v1/bookings`, {
          method: 'POST', headers: { ...H, Prefer: 'return=representation' },
          body: JSON.stringify(corePayload),
        })
      } else {
        return NextResponse.json({ error: errText }, { status: r.status })
      }
    }

    const data = await r.json()
    if (!r.ok) return NextResponse.json({ error: data.message ?? data }, { status: r.status })
    return NextResponse.json({ booking: Array.isArray(data) ? data[0] : data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, status, trackingStatus, ...extra } = await req.json()
    if (!bookingId)
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    // Always include status (works even without schema-v2)
    const patch: Record<string, any> = {}
    if (status) patch.status = status

    // Try first with just status (works without schema-v2)
    // Then retry with extended fields if schema-v2 is available
    const r = await fetch(`${BASE}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    })
    if (!r.ok) {
      const t = await r.text()
      return NextResponse.json({ error: t }, { status: r.status })
    }

    // Also try to update extended fields (only works if schema-v2 has been run)
    if (trackingStatus) {
      const now = new Date().toISOString()
      const extPatch: Record<string, any> = { tracking_status: trackingStatus }
      if (trackingStatus === 'in_transit')        extPatch.dispatched_at        = now
      if (trackingStatus === 'delivered')          extPatch.delivered_at         = now
      if (trackingStatus === 'return_initiated')   extPatch.return_initiated_at  = now
      if (trackingStatus === 'return_in_transit')  extPatch.return_in_transit_at = now
      if (trackingStatus === 'returned')           extPatch.returned_at          = now
      if (trackingStatus === 'completed')          extPatch.closed_at            = now

      // Best-effort — don't fail if column doesn't exist
      await fetch(`${BASE}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify(extPatch),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
