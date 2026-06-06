'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { saveSession } from '@/lib/session'
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function RenterLoginPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: 's.bauer@eventco.de', password: 'renter123' })

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Login failed'); setLoading(false); return }
    if (data.profile.role !== 'renter') {
      setError(`This account is a ${data.profile.role}.`); setLoading(false); return
    }
    saveSession(data.profile)
    router.push('/renter/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Renter Login</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to browse and book equipment</p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-orange-800 mb-2">🎯 Demo Credentials</p>
            <div className="space-y-1 text-xs text-orange-700">
              <div className="flex justify-between"><span>Verified renter:</span>
                <button onClick={() => setForm({ email: 's.bauer@eventco.de', password: 'renter123' })} className="font-mono text-orange-600 hover:underline">s.bauer@eventco.de</button>
              </div>
              <div className="flex justify-between"><span>Pending renter:</span>
                <button onClick={() => setForm({ email: 'f.hoffmann@bautech.de', password: 'renter123' })} className="font-mono text-orange-600 hover:underline">f.hoffmann@bautech.de</button>
              </div>
              <p className="text-orange-500 mt-1">Password: <span className="font-mono font-bold">renter123</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5">
            {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><EyeOff className="w-4 h-4" /></button>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 bg-orange-500 text-white font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-sm text-gray-500">No account? <Link href="/renter/register" className="text-brand-600 font-medium hover:underline">Register as Renter</Link></p>
          </div>
          <p className="text-center mt-4 text-xs text-gray-400"><Link href="/demo" className="hover:text-brand-600">View all demo accounts →</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
