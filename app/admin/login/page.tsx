'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveSession } from '@/lib/session'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: 'admin@mietealle.de', password: 'admin123' })

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Login failed'); setLoading(false); return }
    if (data.profile.role !== 'admin') {
      setError('This account does not have admin access.'); setLoading(false); return
    }
    saveSession(data.profile)
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Mietealle Platform Management</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-gray-300 mb-1.5">🎯 Demo Credentials</p>
          <p className="text-xs text-gray-400">Email: <span className="font-mono text-gray-200">admin@mietealle.de</span></p>
          <p className="text-xs text-gray-400">Password: <span className="font-mono text-gray-200">admin123</span></p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl space-y-5">
          {error && <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={show ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : 'Sign In to Admin'}
          </button>
          <div className="pt-4 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">Access restricted to authorized personnel only.</p>
          </div>
        </div>
        <div className="text-center mt-6 space-y-2">
          <Link href="/demo" className="block text-sm text-gray-500 hover:text-gray-300">View all demo accounts →</Link>
          <Link href="/" className="block text-sm text-gray-600 hover:text-gray-400">← Back to Marketplace</Link>
        </div>
      </div>
    </div>
  )
}
