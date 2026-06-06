'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { CheckCircle, XCircle, Eye, FileText, Building2, Phone, Mail, RefreshCw } from 'lucide-react'

const COMMISSION = 0.10

export default function VerificationsPage() {
  const [tab, setTab]           = useState<'all'|'pending'|'vendors'|'renters'>('pending')
  const [users, setUsers]       = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [actioning, setActioning]   = useState<string | null>(null)
  const [commissionInput, setCommissionInput] = useState<Record<string, number>>({})

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u => {
    if (tab === 'pending') return u.verification_status === 'pending'
    if (tab === 'vendors') return u.role === 'vendor'
    if (tab === 'renters') return u.role === 'renter'
    return true
  })

  const handle = async (userId: string, status: 'verified' | 'rejected') => {
    setActioning(userId)
    const rate = commissionInput[userId] ?? selected?.commission_rate ?? 10
    await fetch('/api/admin/verify', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status, commissionRate: rate }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verification_status: status, commission_rate: rate } : u))
    if (selected?.id === userId) setSelected((s: any) => s ? { ...s, verification_status: status, commission_rate: rate } : s)
    setActioning(null)
  }

  const pendingCount = users.filter(u => u.verification_status === 'pending').length
  const tabs = [
    { key: 'pending' as const, label: 'Pending', count: pendingCount },
    { key: 'all'     as const, label: 'All' },
    { key: 'vendors' as const, label: 'Vendors' },
    { key: 'renters' as const, label: 'Renters' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verifications</h1>
          <p className="text-gray-500 text-sm mt-1">Review government documents and approve or reject accounts.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl hover:bg-gray-50 shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      {/* Commission note */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-purple-700 font-bold text-sm">%</span>
        </div>
        <div>
          <p className="font-semibold text-purple-900 text-sm">Platform Commission: 10%</p>
          <p className="text-purple-700 text-xs">Mietealle earns 10% on every confirmed booking. Vendors receive 90% payout after completion.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
        {tabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {label}
            {count !== undefined && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{count}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {loading ? (
            <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No records in this view</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3">Name / Company</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Document</th>
                    <th className="text-left px-6 py-3">Commission</th>
                    <th className="text-left px-6 py-3">Registered</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 ${selected?.id === user.id ? 'bg-brand-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'vendor' ? 'bg-brand-100 text-brand-700' : 'bg-orange-100 text-orange-700'}`}>{user.name[0]}</div>
                          <div><p className="font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.company}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${user.role === 'vendor' ? 'bg-brand-50 text-brand-700' : 'bg-orange-50 text-orange-700'}`}>{user.role}</span></td>
                      <td className="px-6 py-4 text-gray-500"><div className="flex items-center gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" />{user.govt_doc_type ?? '—'}</div></td>
                      <td className="px-6 py-4">
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
          {user.commission_rate ?? 10}%
        </span>
      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.verification_status === 'verified' ? 'bg-green-100 text-green-700' : user.verification_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600"><Eye className="w-4 h-4" /></button>
                          {user.verification_status === 'pending' && (
                            <>
                              <button onClick={() => handle(user.id, 'verified')} disabled={!!actioning} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-40"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => handle(user.id, 'rejected')} disabled={!!actioning} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-gray-900">Application Detail</h3><button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button></div>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${selected.role === 'vendor' ? 'bg-brand-100 text-brand-700' : 'bg-orange-100 text-orange-700'}`}>{selected.name[0]}</div>
              <div><p className="font-semibold text-gray-900">{selected.name}</p><p className="text-sm text-gray-500">{selected.company}</p></div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4 text-gray-400 shrink-0" />{selected.email}</div>
              <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4 text-gray-400 shrink-0" />{selected.phone ?? '—'}</div>
              <div className="flex items-center gap-3 text-gray-600"><Building2 className="w-4 h-4 text-gray-400 shrink-0" />{selected.company}</div>
            </div>
            <div className="space-y-2 mb-4">
              {[['Document Type', selected.govt_doc_type], ['Doc Number', selected.govt_doc_number], ['City', selected.city], ['Registered', formatDate(selected.created_at)]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3 flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span><span className="font-medium text-gray-900">{v ?? '—'}</span>
                </div>
              ))}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-purple-900 font-semibold text-sm mb-2">💰 Commission Rate</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <input type="number" min="1" max="30" step="0.5"
                    value={commissionInput[selected.id] ?? selected.commission_rate ?? 10}
                    onChange={e => setCommissionInput(prev => ({ ...prev, [selected.id]: Number(e.target.value) }))}
                    className="w-20 px-3 py-1.5 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white font-semibold" />
                  <span className="text-sm text-purple-700 font-semibold">% of each booking</span>
                </div>
                <p className="text-xs text-purple-600">
                  Vendor payout: {100 - (commissionInput[selected.id] ?? selected.commission_rate ?? 10)}% · Mietealle: {commissionInput[selected.id] ?? selected.commission_rate ?? 10}%
                </p>
              </div>
            </div>
            {selected.verification_status === 'pending' ? (
              <div className="flex gap-3">
                <button onClick={() => handle(selected.id, 'verified')} disabled={!!actioning}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" />Approve
                </button>
                <button onClick={() => handle(selected.id, 'rejected')} disabled={!!actioning}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">
                  <XCircle className="w-4 h-4" />Reject
                </button>
              </div>
            ) : (
              <div className={`text-center py-3 rounded-xl text-sm font-semibold ${selected.verification_status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {selected.verification_status === 'verified' ? '✓ Application Approved' : '✗ Application Rejected'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
