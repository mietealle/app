'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { addUser, generateId } from '@/lib/store'
import { apiRegister, SUPABASE_ENABLED } from '@/lib/api'
import { Package, Upload, CheckCircle, ArrowRight, Building2, Phone, Mail, FileText, AlertCircle } from 'lucide-react'

const steps = ['Account Details', 'Business Info', 'Document Upload', 'Review']

export default function VendorRegisterPage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    company: '', phone: '', address: '', city: '',
    docType: 'Gewerbeanmeldung', docNumber: '', docFile: null as File | null,
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (SUPABASE_ENABLED) {
        // ── Real backend ──────────────────────────────────────────────────────
        const result = await apiRegister({
          name: form.name, email: form.email, password: form.password,
          role: 'vendor',
          company: form.company, phone: form.phone,
          address: form.address, city: form.city,
          docType: form.docType, docNumber: form.docNumber,
        })
        if (result.error) { setError(result.error); setLoading(false); return }
      } else {
        // ── Demo / in-memory fallback ─────────────────────────────────────────
        addUser({
          id: generateId('v'),
          name: form.name || 'New Vendor',
          email: form.email || 'vendor@example.de',
          role: 'vendor',
          company: form.company || 'New Company GmbH',
          phone: form.phone || '+49 000 000',
          verificationStatus: 'pending',
          createdAt: new Date().toISOString().split('T')[0],
          govtDocType: form.docType,
          govtDocNumber: form.docNumber || 'DOC-NEW',
        })
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (submitted) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-4 text-sm leading-relaxed">
            Your vendor application is under review. Our admin team will verify your documents within 1–2 business days.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-700">
            📋 Status: <strong>Pending Admin Verification</strong>
            {!SUPABASE_ENABLED && <p className="text-xs mt-1">Demo mode — go to Admin → KYC Verifications to see your entry.</p>}
          </div>
          <div className="flex gap-3">
            <Link href="/admin/verifications" className="flex-1 py-2.5 text-center text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
              See in Admin
            </Link>
            <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 text-sm">
              Homepage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Become a Vendor</h1>
          <p className="text-gray-500 text-sm mt-1">List your industrial equipment and start earning</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < step ? 'bg-brand-600 border-brand-600 text-white' :
                  i === step ? 'border-brand-600 text-brand-600' : 'border-gray-300 text-gray-400'
                }`}>{i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}</div>
                <span className="hidden sm:block text-xs font-medium">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Klaus Müller"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.de"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Your GmbH"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+49 40 123456"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Hauptstraße 1"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Hamburg"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Document Verification</h2>
              <p className="text-sm text-gray-500">Upload your government-issued business document for KYC verification.</p>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type *</label>
                <select value={form.docType} onChange={(e) => update('docType', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Gewerbeanmeldung</option><option>Handelsregister</option>
                  <option>Gewerbeschein</option><option>Umsatzsteuer-ID</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Document Number *</label>
                <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.docNumber} onChange={(e) => update('docNumber', e.target.value)} placeholder="HRB 12345"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setForm(f => ({ ...f, docFile: e.target.files?.[0] ?? null }))} />
              </label>
              {form.docFile && <p className="flex items-center gap-2 text-sm text-green-600"><CheckCircle className="w-4 h-4" />{form.docFile.name}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Review Your Application</h2>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
                {[['Name', form.name], ['Email', form.email], ['Company', form.company], ['City', form.city], ['Document', form.docType], ['Doc Number', form.docNumber]].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium">{v || '—'}</span></div>
                ))}
              </div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">By submitting you confirm all information is accurate and agree to our Terms of Service.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
            ) : (
              <Link href="/renter/register" className="text-sm text-gray-500 hover:text-brand-600 self-center">Register as Renter instead?</Link>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 flex items-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
