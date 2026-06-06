'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import VendorPageLayout from '@/components/layout/VendorPageLayout'
import { getSession } from '@/lib/session'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  Package, CheckCircle, XCircle, Clock, Truck, RefreshCw,
  ChevronRight, AlertCircle, Mail, Phone, ChevronDown
} from 'lucide-react'

const COMMISSION = 0.10

type TrackingStatus =
  | 'pending' | 'confirmed' | 'packaging' | 'in_transit'
  | 'delivered' | 'return_initiated' | 'return_in_transit'
  | 'returned' | 'completed' | 'cancelled'

interface FlowStep { key: TrackingStatus; label: string; desc: string; color: string }
const FLOW: FlowStep[] = [
  { key: 'pending',           label: 'Pending',      desc: 'Awaiting your confirmation',    color: 'amber'  },
  { key: 'confirmed',         label: 'Confirmed',    desc: 'Accepted — start packaging',    color: 'blue'   },
  { key: 'packaging',         label: 'Packaging',    desc: 'Equipment being prepared',      color: 'brand'  },
  { key: 'in_transit',        label: 'In Transit',   desc: 'Dispatched to renter',          color: 'purple' },
  { key: 'delivered',         label: 'Delivered',    desc: 'Renter has received it',        color: 'green'  },
  { key: 'return_initiated',  label: 'Return',       desc: 'Renter initiated return',       color: 'orange' },
  { key: 'returned',          label: 'Returned',     desc: 'Item received back',            color: 'gray'   },
  { key: 'completed',         label: 'Completed',    desc: 'Rental successfully closed',    color: 'green'  },
]

const NEXT: Partial<Record<TrackingStatus, { label: string; next: TrackingStatus; btnColor: string }[]>> = {
  pending:           [{ label: '✓ Accept Booking',    next: 'confirmed',        btnColor: 'bg-green-600 hover:bg-green-700'   },
                      { label: '✗ Decline',           next: 'cancelled',        btnColor: 'bg-red-600 hover:bg-red-700'      }],
  confirmed:         [{ label: '📦 Start Packaging',  next: 'packaging',        btnColor: 'bg-blue-600 hover:bg-blue-700'    }],
  packaging:         [{ label: '🚚 Mark Dispatched',  next: 'in_transit',       btnColor: 'bg-purple-600 hover:bg-purple-700'}],
  in_transit:        [{ label: '✓ Mark Delivered',    next: 'delivered',        btnColor: 'bg-green-600 hover:bg-green-700'  }],
  return_initiated:  [{ label: '📬 Acknowledge',      next: 'return_in_transit',btnColor: 'bg-purple-600 hover:bg-purple-700'}],
  return_in_transit: [{ label: '✓ Confirm Received',  next: 'returned',         btnColor: 'bg-blue-600 hover:bg-blue-700'   }],
  returned:          [{ label: '🔒 Close Rental',     next: 'completed',        btnColor: 'bg-brand-600 hover:bg-brand-700' }],
}

const STEP_COLOR: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700',
  brand: 'bg-brand-100 text-brand-700', purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700', orange: 'bg-orange-100 text-orange-700',
  gray:  'bg-gray-100 text-gray-600',
}

export default function VendorBookingsPage() {
  const router = useRouter()
  const [session, setSession]   = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState<'all'|'pending'|'active'|'completed'>('all')

  const load = useCallback((vendorId: string) => {
    setLoading(true)
    setError('')
    fetch(`/api/bookings?vendor_id=${vendorId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        setBookings(d.bookings ?? [])
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'vendor') { router.push('/vendor/login'); return }
    setSession(s)
    load(s.id)
  }, [router, load])

  const getTS = (b: any): TrackingStatus =>
    (b.tracking_status as TrackingStatus) ?? (b.status as TrackingStatus) ?? 'pending'

  const updateStatus = async (bookingId: string, nextStatus: TrackingStatus) => {
    setUpdating(true)
    try {
      const isCancelled  = nextStatus === 'cancelled'
      const isCompleted  = nextStatus === 'completed'
      const bookingStatus = isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'confirmed'

      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: bookingStatus,
          trackingStatus: nextStatus,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Update failed — check if schema-v2.sql has been run in Supabase.')
      } else {
        setBookings(prev => prev.map(b =>
          b.id === bookingId
            ? { ...b, tracking_status: nextStatus, status: bookingStatus }
            : b
        ))
        if (selected?.id === bookingId) {
          setSelected((s: any) => s ? { ...s, tracking_status: nextStatus, status: bookingStatus } : s)
        }
      }
    } catch (e: any) {
      setError(e.message)
    }
    setUpdating(false)
  }

  const filtered = bookings.filter(b => {
    const ts = getTS(b)
    if (filter === 'pending')   return ts === 'pending'
    if (filter === 'active')    return ['confirmed','packaging','in_transit','delivered'].includes(ts)
    if (filter === 'completed') return ['completed','cancelled','returned'].includes(ts)
    return true
  })

  const pendingCount   = bookings.filter(b => getTS(b) === 'pending').length
  const activeCount    = bookings.filter(b => ['confirmed','packaging','in_transit','delivered'].includes(getTS(b))).length
  const completedCount = bookings.filter(b => ['completed','cancelled','returned'].includes(getTS(b))).length
  const earnings       = bookings.filter(b => getTS(b) === 'completed')
    .reduce((s, b) => s + Number(b.total_amount ?? 0) * 0.9, 0)

  if (!session) return null

  return (
    <VendorPageLayout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Approve, track and manage all your rentals.</p>
          </div>
          <button onClick={() => session && load(session.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl hover:bg-gray-50 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>

        {/* Schema warning */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Error</p>
              <p className="text-red-700 text-xs mt-0.5">{error}</p>
              {error.includes('column') || error.includes('tracking') ? (
                <p className="text-red-600 text-xs mt-1">
                  💡 Run <code className="bg-red-100 px-1 rounded">supabase/schema-v2.sql</code> in your Supabase SQL Editor to add new columns.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending',    value: pendingCount,        color: 'text-amber-600'  },
            { label: 'Active',     value: activeCount,          color: 'text-blue-600'   },
            { label: 'Completed',  value: completedCount,       color: 'text-green-600'  },
            { label: 'Earnings',   value: formatCurrency(earnings), color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
          {[
            { key: 'all'       as const, label: 'All',       count: bookings.length },
            { key: 'pending'   as const, label: 'Pending',   count: pendingCount    },
            { key: 'active'    as const, label: 'Active',    count: activeCount     },
            { key: 'completed' as const, label: 'Completed', count: completedCount  },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : count > 0 && key === 'pending' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
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
                <p className="text-gray-400 text-sm">No bookings here yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const ts      = getTS(b)
                  const isPend  = ts === 'pending'
                  const step    = FLOW.find(f => f.key === ts)
                  return (
                    <div key={b.id} onClick={() => setSelected(selected?.id === b.id ? null : b)}
                      className={`p-5 cursor-pointer hover:bg-gray-50/50 transition-colors ${selected?.id === b.id ? 'bg-brand-50/30 border-l-2 border-brand-500' : ''}`}>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{b.product?.title ?? 'Equipment'}</p>
                            {isPend && (
                              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                            )}
                            {step && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STEP_COLOR[step.color] ?? 'bg-gray-100 text-gray-600'}`}>
                                {step.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{b.renter?.company ?? b.renter?.name ?? 'Renter'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            📅 {formatDate(b.start_date)} – {formatDate(b.end_date)} · {b.total_days ?? 1} days
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm">{formatCurrency(b.total_amount ?? 0)}</p>
                          <p className="text-xs text-green-600">You: {formatCurrency(Number(b.total_amount ?? 0) * 0.9)}</p>
                        </div>
                      </div>

                      {/* Quick approve/decline for pending */}
                      {isPend && (
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating}
                            className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />Accept
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updating}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
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
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Booking Detail</h3>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400">✕</button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                <div className="p-5 space-y-5">

                  {/* Status steps */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progress</p>
                    <div className="space-y-1.5">
                      {FLOW.slice(0, 5).map((step, i) => {
                        const ts       = getTS(selected)
                        const stepIdx  = FLOW.findIndex(f => f.key === ts)
                        const myIdx    = i
                        const done     = stepIdx > myIdx || ts === 'completed'
                        const current  = FLOW[stepIdx]?.key === step.key
                        return (
                          <div key={step.key}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${current ? 'bg-brand-50 border border-brand-200' : done ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${current ? 'bg-brand-600 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {done && !current ? '✓' : i + 1}
                            </div>
                            <div>
                              <p className={`font-semibold ${current ? 'text-brand-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                              {current && <p className="text-[10px] text-brand-600 mt-0.5">{step.desc}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Next actions */}
                  {NEXT[getTS(selected)] && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Steps</p>
                      <div className="space-y-2">
                        {NEXT[getTS(selected)]!.map(action => (
                          <button key={action.next}
                            onClick={() => updateStatus(selected.id, action.next)}
                            disabled={updating}
                            className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${action.btnColor}`}>
                            {updating ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 48hr warning */}
                  {['confirmed','packaging'].includes(getTS(selected)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700"><strong>48-hour dispatch required.</strong> Dispatch within 48 hours of confirmation.</p>
                    </div>
                  )}

                  {/* Booking info */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                    {[
                      ['Equipment',  selected.product?.title],
                      ['Renter',     selected.renter?.company ?? selected.renter?.name],
                      ['Dates',      `${formatDate(selected.start_date)} – ${formatDate(selected.end_date)}`],
                      ['Duration',   `${selected.total_days ?? 1} days`],
                      ['Transport',  selected.transport_option === 'vendor' ? '🚚 Vendor delivery' : '🏭 Self pickup'],
                      ['Insurance',  selected.insurance_selected ? '✓ Included' : '✗ Not selected'],
                      ['Delivery to', selected.delivery_address ?? 'Not specified'],
                    ].map(([l, v]) => (
                      <div key={String(l)} className="flex justify-between gap-2 text-xs">
                        <span className="text-gray-500 shrink-0">{l}</span>
                        <span className="font-medium text-gray-900 text-right">{v ?? '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financials */}
                  <div className="bg-brand-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Rental</span><span className="font-bold">{formatCurrency(selected.total_amount ?? 0)}</span></div>
                    {(selected.transport_cost ?? 0) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600">Transport</span><span>{formatCurrency(selected.transport_cost)}</span></div>
                    )}
                    <div className="flex justify-between text-purple-700 border-t border-brand-100 pt-2">
                      <span>Mietealle ({COMMISSION*100}%)</span>
                      <span className="font-bold">- {formatCurrency(Number(selected.total_amount ?? 0) * COMMISSION)}</span>
                    </div>
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Your payout</span>
                      <span>{formatCurrency(Number(selected.total_amount ?? 0) * 0.9)}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  {selected.renter && (
                    <div className="flex gap-2">
                      {selected.renter.email && (
                        <a href={`mailto:${selected.renter.email}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50">
                          <Mail className="w-3.5 h-3.5" />Email Renter
                        </a>
                      )}
                      {selected.renter.phone && (
                        <a href={`tel:${selected.renter.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50">
                          <Phone className="w-3.5 h-3.5" />Call
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VendorPageLayout>
  )
}
