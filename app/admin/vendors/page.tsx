'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users?role=vendor').then(r => r.json()).then(d => { setVendors(d.users ?? []); setLoading(false) })
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-500 text-sm mt-1">{vendors.length} registered vendors</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3">Vendor</th><th className="text-left px-6 py-3">Company</th>
                <th className="text-left px-6 py-3">Email</th><th className="text-left px-6 py-3">City</th>
                <th className="text-left px-6 py-3">Joined</th><th className="text-left px-6 py-3">Status</th><th className="text-left px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">{v.name[0]}</div><p className="font-medium text-gray-900">{v.name}</p></div></td>
                  <td className="px-6 py-4 text-gray-600">{v.company}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{v.email}</td>
                  <td className="px-6 py-4 text-gray-500">{v.city ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(v.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${v.verification_status === 'verified' ? 'bg-green-100 text-green-700' : v.verification_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {v.verification_status === 'verified' ? <CheckCircle className="w-3 h-3" /> : v.verification_status === 'pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {v.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4"><Link href="/admin/verifications" className="text-xs font-medium text-brand-600 hover:underline">Details →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
