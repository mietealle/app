'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/session'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  Package, CheckCircle, XCircle, Clock, Truck, RefreshCw,
  ChevronRight, AlertCircle, Mail, Phone, ArrowRight
} from 'lucide-react'

const COMMISSION = 0.10

// Full tracking status flow with labels and actions
const FLOW = [
  { key: 'pending',             label: 'Pending',         icon: Clock,         color: 'amber',  desc: 'Awaiting your confirmation' },
  { key: 'confirmed',           label: 'Confirmed',       icon: CheckCircle,   color: 'blue',   desc: 'You accepted — start packaging' },
  { key: 'packaging',           label: 'Packaging',       icon: Package,       color: 'brand',  desc: 'Equipment being prepared' },
  { key: 'in_transit',          label: 'In Transit',      icon: Truck,         color: 'purple', desc: 'Dispatched to renter' },
  { key: 'delivered',           label: 'Delivered',       icon: CheckCircle,   color: 'green',  desc: 'Renter has received it' },
  { key: 'return_initiated',    label: 'Return Started',  icon: ArrowRight,    color: 'orange', desc: 'Renter initiated return' },
  { key: 'return_in_transit',   label: 'Return Transit',  icon: Truck,         color: 'purple', desc: 'Returning to you' },
  { key: 'returned',            label: 'Returned',        icon: Package,       color: 'gray',   desc: 'Item received back' },
  { key: 'completed',           label: 'Completed',       icon: CheckCircle,   color: 'green',  desc: 'Rental successfully closed' },
]

const NEXT_ACTIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending:          [{ label: 'Accept Booking', next: 'confirmed', color: 'green' }, { label: 'Decline', next: 'cancelled', color: 'red' }],
  confirmed:        [{ label: 'Start Packaging', next: 'packaging', color: 'blue' }],
  packaging:        [{ label: 'Mark as Dispatched', next: 'in_transit', color: 'purple' }],
  in_transit:       [{ label: 'Mark as Delivered', next: 'delivered', color: 'green' }],
  return_initiated: [{ label: 'Acknowledge Return', next: 'return_in_transit', color: 'purple' }],
  return_in_transit:[{ label: 'Confirm Received', next: 'returned', color: 'blue' }],
  returned:         [{ label: 'Close Rental', next: 'completed', color: 'green' }],
}

const COLOR_MAP: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700',
  brand: 'bg-brand-100 text-brand-700', purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700', orange: 'bg-orange-100 text-orange-700',
  gray:  'bg-gray-100 text-gray-600',   red: 'bg-red-100 text-red-700',
}

export default function VendorBookingsPage() {
  const router  = useRouter()
  const [session, setSession]     = useState<any>(null)
  const [bookings, setBookings]   = useState<any[]>([])
  const [selected, setSelected]   = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(false)
  const [filter, setFilter]       = useState('all')

  const load = useCallback((vendorId: string) => {
    setLoading(true)
    fetch(`/api/bookings?vendor_id=${vendorId}`)
      .then(r => r.json())
      .then(d => { setBookings(d.bookings ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'vendor') { router.push('/vendor/login'); return }
    setSession(s)
    load(s.id)
  }, [router, load])

  const updateStatus = async (bookingId: string, trackingStatus: string) => {
    setUpdating(true)
    await fetch(`/api/bookings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status: trackingStatus === 'cancelled' ? 'cancelled' : trackingStatus === 'completed' ? 'completed' : 'confirmed', trackingStatus }),
    })
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, tracking_status: trackingStatus, status: trackingStatus === 'cancelled' ? 'cancelled' : trackingStatus === 'completed' ? 'completed' : 'confirmed' } : b))
    if (selected?.id === bookingId) setSelected((s: any) => s ? { ...s, tracking_status: trackingStatus } : s)
    setUpdating(false)
  }

  const tabs = [
    { key: 'all',       label: 'All',       count: bookings.length },
    { key: 'pending',   label: 'Pending',   count: bookings.filter(b=>b.tracking_status==='pending'||b.status==='pending').length },
    { key: 'active',    label: 'Active',    count: bookings.filter(b=>['confirmed','packaging','in_transit','delivered'].includes(b.tracking_status??'')).length },
    { key: 'returning', label: 'Returning', count: bookings.filter(b=>['return_initiated','return_in_transit'].includes(b.tracking_status??'')).length },
    { key: 'completed', label: 'Completed', count: bookings.filter(b=>['completed','cancelled'].includes(b.tracking_status??''||b.status)).length },
  ]

  const filtered = bookings.filter(b => {
    const ts = b.tracking_status ?? b.status ?? 'pending'
    if (filter === 'pending')   return ts === 'pending'
    if (filter === 'active')    return ['confirmed','packaging','in_transit','delivered'].includes(ts)
    if (filter === 'returning') return ['return_initiated','return_in_transit','returned'].includes(ts)
    if (filter === 'completed') return ['completed','cancelled'].includes(ts)
    return true
  })

  const totalEarnings = bookings.filter(b=>b.tracking_status==='completed'||b.status==='completed')
    .reduce((s,b)=>s+Number(b.total_amount)*(1-COMMISSION),0)

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-500 text-sm mt-1">Approve, track and manage all your rentals.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => session && load(session.id)} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl hover:bg-gray-50 shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending Requests', value: bookings.filter(b=>b.status==='pending'||b.tracking_status==='pending').length, color: 'text-amber-600' },
            { label: 'Active Rentals',   value: bookings.filter(b=>['confirmed','packaging','in_transit'].includes(b.tracking_status??'')).length, color: 'text-blue-600' },
            { label: 'Total Bookings',   value: bookings.length, color: 'text-gray-900' },
            { label: 'Your Earnings',    value: formatCurrency(totalEarnings), color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit mb-6 shadow-sm overflow-x-auto">
          {tabs.map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : count > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
            {loading ? (
              <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No bookings in this category.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const ts = b.tracking_status ?? b.status ?? 'pending'
                  const flowStep = FLOW.find(f => f.key === ts)
                  const isPending = ts === 'pending'
                  return (
                    <div key={b.id}
                      onClick={() => setSelected(selected?.id === b.id ? null : b)}
                      className={`p-5 cursor-pointer hover:bg-gray-50/50 transition-colors ${selected?.id === b.id ? 'bg-brand-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">{b.product?.title ?? 'Equipment'}</p>
                            {isPending && <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse">● NEW</span>}
                            {flowStep && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR_MAP[flowStep.color] ?? 'bg-gray-100 text-gray-600'}`}>{flowStep.label}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{b.renter?.company ?? b.renter?.name ?? 'Renter'}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                            <span>📅 {formatDate(b.start_date)} – {formatDate(b.end_date)}</span>
                            <span>📦 {b.total_days} days</span>
                            {b.transport_option === 'vendor' && <span>🚚 Vendor transport</span>}
                            {b.insurance_selected && <span>🛡️ Insured</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900">{formatCurrency(b.total_amount)}</p>
                          <p className="text-xs text-green-600">You: {formatCurrency(Number(b.total_amount)*0.9)}</p>
                          <ChevronRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                        </div>
                      </div>

                      {/* Quick actions for pending */}
                      {isPending && (
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating}
                            className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />Accept
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updating}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Booking Detail</h3>
                <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 p-1">✕</button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
                {/* Status flow */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Booking Progress</p>
                  <div className="space-y-1.5">
                    {FLOW.slice(0, 5).map((step, i) => {
                      const ts = selected.tracking_status ?? selected.status ?? 'pending'
                      const stepIdx = FLOW.findIndex(f => f.key === ts)
                      const myIdx   = i
                      const done    = stepIdx >= myIdx
                      const current = stepIdx === myIdx
                      const Icon    = step.icon
                      return (
                        <div key={step.key} className={`flex items-center gap-3 p-2.5 rounded-xl ${current ? 'bg-brand-50 border border-brand-200' : done ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${current ? 'bg-brand-600' : done ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <Icon className={`w-3.5 h-3.5 ${current || done ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${current ? 'text-brand-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                            {current && <p className="text-[10px] text-brand-600">{step.desc}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Next step actions */}
                {NEXT_ACTIONS[selected.tracking_status ?? selected.status ?? 'pending'] && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Next Actions</p>
                    <div className="space-y-2">
                      {NEXT_ACTIONS[selected.tracking_status ?? selected.status ?? 'pending'].map(action => (
                        <button key={action.next} onClick={() => updateStatus(selected.id, action.next)} disabled={updating}
                          className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors ${action.color === 'green' ? 'bg-green-600 hover:bg-green-700' : action.color === 'red' ? 'bg-red-600 hover:bg-red-700' : action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : action.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
                          {updating ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  {[
                    ['Equipment', selected.product?.title],
                    ['Renter',    selected.renter?.company ?? selected.renter?.name],
                    ['Dates',     `${formatDate(selected.start_date)} – ${formatDate(selected.end_date)}`],
                    ['Duration',  `${selected.total_days} days`],
                    ['Transport', selected.transport_option === 'vendor' ? '🚚 Vendor handles delivery' : '🏭 Self pickup'],
                    ['Insurance', selected.insurance_selected ? '✓ Included' : '✗ Not selected'],
                    ['Delivery',  selected.delivery_address ?? 'Not specified'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-2">
                      <span className="text-gray-500 shrink-0">{l}</span>
                      <span className="font-medium text-gray-900 text-right text-xs">{v ?? '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Financial */}
                <div className="bg-brand-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Rental amount</span><span className="font-bold">{formatCurrency(selected.total_amount)}</span></div>
                  {selected.transport_cost > 0 && <div className="flex justify-between"><span className="text-gray-600">Transport</span><span>{formatCurrency(selected.transport_cost)}</span></div>}
                  {selected.insurance_cost > 0 && <div className="flex justify-between"><span className="text-gray-600">Insurance</span><span>{formatCurrency(selected.insurance_cost)}</span></div>}
                  <div className="flex justify-between text-purple-700 border-t border-brand-100 pt-2"><span>Mietealle (10%)</span><span className="font-bold">- {formatCurrency(Number(selected.total_amount)*COMMISSION)}</span></div>
                  <div className="flex justify-between text-green-700"><span className="font-bold">Your payout</span><span className="font-bold">{formatCurrency(Number(selected.total_amount)*0.9)}</span></div>
                </div>

                {/* Contact renter */}
                {selected.renter && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact Renter</p>
                    <div className="flex gap-2">
                      {selected.renter.email && <a href={`mailto:${selected.renter.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50"><Mail className="w-3.5 h-3.5" />Email</a>}
                      {selected.renter.phone && <a href={`tel:${selected.renter.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50"><Phone className="w-3.5 h-3.5" />Call</a>}
                    </div>
                  </div>
                )}

                {/* Dispatch deadline note */}
                {(selected.tracking_status === 'confirmed' || selected.tracking_status === 'packaging') && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700"><strong>48-hour dispatch required.</strong> Please package and dispatch within 48 hours of confirmation to maintain your vendor rating.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
