'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { RefreshCw, ChevronRight, Calendar, CheckCircle, Clock, XCircle, Package } from 'lucide-react'

const COMMISSION = 0.10

const STATUS_FLOW = ['pending', 'confirmed', 'completed', 'cancelled'] as const
const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending — awaiting vendor confirmation',
  confirmed: 'Confirmed — vendor accepted, rental in progress',
  completed: 'Completed — rental finished successfully',
  cancelled: 'Cancelled',
}
const STATUS_ICON: Record<string, any> = {
  pending:   Clock,
  confirmed: CheckCircle,
  completed: Package,
  cancelled: XCircle,
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/bookings').then(r => r.json()).then(d => {
      setBookings(d.bookings ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(true)
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status }),
    })
    // Update local state
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    if (selected?.id === bookingId) setSelected((s: any) => s ? { ...s, status } : s)
    setUpdating(false)
  }

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter)
  const totalRevenue    = bookings.filter(b=>['confirmed','completed'].includes(b.status)).reduce((s,b)=>s+Number(b.total_amount),0)
  const totalCommission = totalRevenue * COMMISSION

  const tabs = [
    { key: 'all',       label: 'All',       count: bookings.length },
    { key: 'pending',   label: 'Pending',   count: bookings.filter(b=>b.status==='pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b=>b.status==='confirmed').length },
    { key: 'completed', label: 'Completed', count: bookings.filter(b=>b.status==='completed').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b=>b.status==='cancelled').length },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Full booking lifecycle — view, confirm, complete or cancel.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl hover:bg-gray-50 shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Booking Value',    value: formatCurrency(bookings.reduce((s,b)=>s+Number(b.total_amount),0)), color: 'brand' },
          { label: 'Confirmed Revenue',      value: formatCurrency(totalRevenue),    color: 'green'  },
          { label: `Platform Commission (${COMMISSION*100}%)`, value: formatCurrency(totalCommission), color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
        {tabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><p className="text-gray-400 text-sm">No bookings in this category.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3">Equipment</th>
                    <th className="text-left px-6 py-3">Renter</th>
                    <th className="text-left px-6 py-3">Vendor</th>
                    <th className="text-left px-6 py-3">Dates</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Commission</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(b => (
                    <tr key={b.id} className={`hover:bg-gray-50/50 cursor-pointer ${selected?.id === b.id ? 'bg-brand-50/30' : ''}`} onClick={() => setSelected(b)}>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[160px] truncate">{b.product?.title ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{b.renter?.company ?? b.renter?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{b.vendor?.company ?? b.vendor?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{formatDate(b.start_date)} – {formatDate(b.end_date)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(b.total_amount)}</td>
                      <td className="px-6 py-4 font-semibold text-purple-700">{formatCurrency(Number(b.total_amount)*COMMISSION)}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(b.status)}`}>{b.status}</span></td>
                      <td className="px-6 py-4"><ChevronRight className="w-4 h-4 text-gray-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Booking Detail</h3>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Status flow */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Booking Flow</p>
              <div className="space-y-2">
                {STATUS_FLOW.filter(s => s !== 'cancelled').map((s, i) => {
                  const Icon = STATUS_ICON[s]
                  const done = STATUS_FLOW.indexOf(selected.status as any) >= STATUS_FLOW.indexOf(s) && selected.status !== 'cancelled'
                  const current = selected.status === s
                  return (
                    <div key={s} className={`flex items-center gap-3 p-3 rounded-xl ${current ? 'bg-brand-50 border border-brand-200' : done ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${current ? 'bg-brand-600' : done ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <Icon className={`w-4 h-4 ${current || done ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold capitalize ${current ? 'text-brand-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{s}</p>
                        <p className={`text-[10px] leading-tight ${current ? 'text-brand-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</p>
                      </div>
                      {i < 2 && <div className={`w-px h-4 ml-3 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Equipment</span><span className="font-medium text-right text-xs">{selected.product?.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Renter</span><span className="font-medium">{selected.renter?.company ?? selected.renter?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium">{selected.vendor?.company ?? selected.vendor?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Period</span><span className="font-medium text-xs">{formatDate(selected.start_date)} – {formatDate(selected.end_date)} ({selected.total_days}d)</span></div>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Rental Amount</span><span className="font-bold">{formatCurrency(selected.total_amount)}</span></div>
                <div className="flex justify-between text-purple-700"><span>Platform Commission (10%)</span><span className="font-bold">{formatCurrency(Number(selected.total_amount)*COMMISSION)}</span></div>
                <div className="flex justify-between text-green-700 border-t border-brand-100 pt-2"><span>Vendor Payout (90%)</span><span className="font-bold">{formatCurrency(Number(selected.total_amount)*0.90)}</span></div>
              </div>
            </div>

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selected.id, 'confirmed')} disabled={updating}
                  className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">Confirm</button>
                <button onClick={() => updateStatus(selected.id, 'cancelled')} disabled={updating}
                  className="flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">Cancel</button>
              </div>
            )}
            {selected.status === 'confirmed' && (
              <button onClick={() => updateStatus(selected.id, 'completed')} disabled={updating}
                className="w-full py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">Mark as Completed</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
