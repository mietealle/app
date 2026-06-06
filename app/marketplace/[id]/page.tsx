'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/session'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  MapPin, Star, Calendar, ChevronLeft, Shield, Clock, CheckCircle,
  Phone, Mail, Lock, X, Edit3, Truck, Package, AlertCircle
} from 'lucide-react'

function ContactModal({ vendor, onClose }: { vendor: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Contact Vendor</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="flex items-center gap-3 mb-5 bg-gray-50 rounded-xl p-4">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-lg">{vendor.name?.[0] ?? 'V'}</div>
          <div><p className="font-semibold text-gray-900">{vendor.name}</p><p className="text-sm text-gray-500">{vendor.company}</p></div>
        </div>
        <div className="space-y-3">
          {vendor.email && (
            <a href={`mailto:${vendor.email}?subject=Equipment Rental Enquiry`}
              className="flex items-center gap-3 w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700 font-medium hover:bg-brand-100">
              <Mail className="w-5 h-5" /><div className="text-left"><p className="font-semibold">Send Email</p><p className="text-xs text-brand-600">{vendor.email}</p></div>
            </a>
          )}
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`}
              className="flex items-center gap-3 w-full px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium hover:bg-green-100">
              <Phone className="w-5 h-5" /><div className="text-left"><p className="font-semibold">Call Vendor</p><p className="text-xs text-green-600">{vendor.phone}</p></div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [product, setProduct]     = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [requested, setRequested] = useState(false)
  const [booking, setBooking]     = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [session, setSession]     = useState<any>(null)
  const [bookError, setBookError] = useState('')
  const [transport, setTransport] = useState<'self_pickup'|'vendor'>('self_pickup')
  const [insurance, setInsurance] = useState(false)
  const [address, setAddress]     = useState('')

  const INSURANCE_COST = 25  // flat €25 per booking (placeholder)

  useEffect(() => {
    setSession(getSession())
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 0
  const rentalCost    = days * (product?.price_per_day ?? 0)
  const transportCost = transport === 'vendor' ? (product?.transport_cost ?? 0) : 0
  const insuranceCost = insurance ? INSURANCE_COST : 0
  const total         = rentalCost + transportCost + insuranceCost
  const prePayment    = Math.min(total, (product?.price_per_day ?? 0) * 5)  // 5 days upfront

  const isOwnProduct = session?.role === 'vendor' && product?.vendor_id === session?.id
  const isViewOnly   = session?.role !== 'renter'

  const handleBook = async () => {
    setBookError('')
    if (!session) { router.push('/renter/login'); return }
    if (session.role !== 'renter') { setBookError('Only renter accounts can book equipment.'); return }
    if (days < (product?.min_rental_days ?? 1)) { setBookError(`Minimum ${product?.min_rental_days} day(s) required.`); return }
    if (transport === 'vendor' && !address.trim()) { setBookError('Please enter your delivery address.'); return }

    setBooking(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id, renterId: session.id, startDate, endDate,
        transportOption: transport, transportCost, insuranceSelected: insurance, insuranceCost,
        deliveryAddress: address || null,
      }),
    })
    const data = await res.json()
    setBooking(false)
    if (!res.ok) { setBookError(data.error ?? 'Booking failed'); return }
    setRequested(true)
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
    </div>
  )
  if (!product) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><p className="text-gray-500 mb-4">Product not found.</p><Link href="/marketplace" className="text-brand-600 hover:underline">← Back</Link></div>
      </div><Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {showContact && product.vendor && <ContactModal vendor={product.vendor} onClose={() => setShowContact(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/marketplace" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-72 sm:h-96">
                {product.images?.[0]
                  ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" unoptimized />
                  : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No image</div>}
                <div className="absolute top-4 left-4">
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.available ? '● Available' : '○ Unavailable'}
                  </span>
                </div>
                {isOwnProduct && (
                  <div className="absolute top-4 right-4">
                    <Link href={`/vendor/products/${product.id}/edit`}
                      className="flex items-center gap-1.5 bg-white/90 backdrop-blur text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white">
                      <Edit3 className="w-3.5 h-3.5" />Edit
                    </Link>
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {product.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{product.category}</span>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.title}</h1>
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />{product.location}
                    <span>·</span><Star className="w-4 h-4 fill-amber-400 stroke-amber-400" /><span className="font-medium text-amber-600">4.8</span>
                  </div>
                  {product.quantity > 1 && <p className="text-xs text-green-600 mt-1">✓ {product.quantity} units available</p>}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price_per_day)}</span>
                  <span className="text-gray-500 text-sm">/day</span>
                  <p className="text-xs text-gray-400 mt-0.5">Min. {product.min_rental_days} day{product.min_rental_days > 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

              {/* Delivery options */}
              <div className="mt-5 flex flex-wrap gap-3">
                {product.transport_available && <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"><Truck className="w-3.5 h-3.5" />Vendor delivery available</span>}
                {product.insurance_required   && <span className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full"><Shield className="w-3.5 h-3.5" />Insurance required</span>}
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                        <span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-600" />Availability Calendar</h3>
              {!product.bookings || product.bookings.length === 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />Fully available — no existing bookings
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Booked periods (unavailable for rental):</p>
                  {product.bookings.filter((b: any) => b.status !== 'cancelled').map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                      <span className="font-medium text-red-700">📅 Booked</span>
                      <span className="text-red-600">{formatDate(b.start_date)} → {formatDate(b.end_date)}</span>
                      <span className={`capitalize font-medium ${b.status === 'confirmed' ? 'text-orange-600' : 'text-gray-500'}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor */}
            {product.vendor && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">About the Vendor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-lg">{product.vendor.name?.[0] ?? 'V'}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.vendor.company}</p>
                    {product.vendor.city && <p className="text-xs text-gray-500">{product.vendor.city}</p>}
                    {product.vendor.verification_status === 'verified' && (
                      <div className="flex items-center gap-1 text-sm text-green-600 mt-0.5"><CheckCircle className="w-3.5 h-3.5" />KYC Verified</div>
                    )}
                  </div>
                  <button onClick={() => setShowContact(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700">
                    <Phone className="w-4 h-4" />Contact
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {isOwnProduct ? 'Your Listing' : 'Book Equipment'}
                </h3>

                {isOwnProduct ? (
                  <div className="text-center py-6 bg-brand-50 rounded-xl">
                    <p className="text-sm font-medium text-brand-700 mb-3">This is your listing</p>
                    <Link href={`/vendor/products/${product.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
                      <Edit3 className="w-4 h-4" />Edit Listing
                    </Link>
                  </div>
                ) : requested ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                    <p className="font-semibold text-gray-900 mb-1">Booking Request Sent!</p>
                    <p className="text-sm text-gray-500 mb-4">The vendor will confirm within 24 hours.</p>
                    <Link href="/renter/orders" className="text-sm text-brand-600 hover:underline">View your orders →</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Dates */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">📅 Start Date *</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
                        style={{ colorScheme: 'light' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">📅 End Date *</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
                        style={{ colorScheme: 'light' }} />
                    </div>

                    {/* Transport */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">🚚 Transport Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setTransport('self_pickup')}
                          className={`py-2.5 text-xs font-medium rounded-xl border-2 transition-colors ${transport==='self_pickup' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}>
                          🏭 Self Pickup<br /><span className="text-[10px] text-gray-400">Free</span>
                        </button>
                        <button onClick={() => setTransport('vendor')}
                          disabled={!product.transport_available}
                          className={`py-2.5 text-xs font-medium rounded-xl border-2 transition-colors ${transport==='vendor' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                          🚚 Vendor Delivers<br />
                          <span className="text-[10px] text-gray-400">{product.transport_available ? `+${formatCurrency(product.transport_cost ?? 0)}` : 'Not available'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Delivery address */}
                    {transport === 'vendor' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">📍 Delivery Address *</label>
                        <textarea value={address} onChange={e => setAddress(e.target.value)}
                          rows={2} placeholder="Street, City, Postal Code"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 resize-none" />
                      </div>
                    )}

                    {/* Insurance */}
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={insurance} onChange={e => setInsurance(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer" />
                        <div>
                          <p className="text-sm font-semibold text-purple-900 flex items-center gap-1">
                            <Shield className="w-4 h-4" />Add Insurance — {formatCurrency(INSURANCE_COST)}
                          </p>
                          <p className="text-xs text-purple-700 mt-0.5">
                            Coverage for accidental damage during rental period. Placeholder — actual terms will be defined with insurance partner.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Price breakdown */}
                    {days > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>{formatCurrency(product.price_per_day)} × {days} day{days>1?'s':''}</span>
                          <span>{formatCurrency(rentalCost)}</span>
                        </div>
                        {transportCost > 0 && <div className="flex justify-between text-gray-600"><span>🚚 Transport</span><span>{formatCurrency(transportCost)}</span></div>}
                        {insuranceCost > 0 && <div className="flex justify-between text-gray-600"><span>🛡️ Insurance</span><span>{formatCurrency(insuranceCost)}</span></div>}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total</span><span className="text-brand-700">{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                          <span>💳 Pre-payment required (5 days)</span>
                          <span className="font-semibold">{formatCurrency(prePayment)}</span>
                        </div>
                      </div>
                    )}

                    {!session && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-700">
                        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><Link href="/renter/login" className="font-semibold underline">Sign in as Renter</Link> to book this equipment.</span>
                      </div>
                    )}

                    {bookError && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{bookError}</div>}

                    <button
                      disabled={!product.available || booking || (!!session && session.role !== 'renter')}
                      onClick={handleBook}
                      className="w-full py-3 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                      {booking ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</> :
                        !product.available ? 'Currently Unavailable' :
                        !session ? 'Sign In to Book' :
                        session.role !== 'renter' ? 'Only Renters Can Book' :
                        days === 0 ? 'Select Dates to Book' :
                        days < product.min_rental_days ? `Min. ${product.min_rental_days} days required` :
                        `Request Booking`}
                    </button>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500"><Shield className="w-3.5 h-3.5 text-green-500" />Secure B2B transaction</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 text-blue-500" />Vendor responds within 24 hours</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><Package className="w-3.5 h-3.5 text-orange-500" />48-hour dispatch after confirmation</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
