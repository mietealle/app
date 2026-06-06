'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import VendorPageLayout from '@/components/layout/VendorPageLayout'
import { getSession } from '@/lib/session'
import { categories } from '@/lib/mock-data'
import { ChevronLeft, CheckCircle, Plus, X, AlertCircle } from 'lucide-react'

export default function EditProductPage() {
  const { id } = useParams()
  const router  = useRouter()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const [specs, setSpecs]       = useState<{ key: string; value: string }[]>([])
  const [form, setForm] = useState({
    title: '', description: '', category: '', price_per_day: '',
    min_rental_days: '1', location: '', available: true, status: 'active',
  })

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'vendor') { router.push('/vendor/login'); return }

    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        const p = d.product
        if (!p) { router.push('/vendor/products'); return }
        setForm({
          title: p.title ?? '',
          description: p.description ?? '',
          category: p.category ?? '',
          price_per_day: String(p.price_per_day ?? ''),
          min_rental_days: String(p.min_rental_days ?? 1),
          location: p.location ?? '',
          available: p.available ?? true,
          status: p.status ?? 'active',
        })
        setSpecs(
          Object.entries(p.specifications ?? {}).map(([key, value]) => ({ key, value: value as string }))
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, router])

  const update = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))
  const addSpec = () => setSpecs(s => [...s, { key: '', value: '' }])
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: 'key' | 'value', v: string) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: v } : sp))

  const handleSave = async () => {
    setError(''); setSaving(true)
    const specifications = Object.fromEntries(specs.filter(s => s.key).map(s => [s.key, s.value]))
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        category: form.category,
        price_per_day: Number(form.price_per_day),
        min_rental_days: Number(form.min_rental_days),
        location: form.location,
        available: form.available,
        status: form.status,
        specifications,
      }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else { const d = await res.json(); setError(d.error ?? 'Save failed') }
  }

  if (loading) return (
    <VendorPageLayout>
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </VendorPageLayout>
  )

  return (
    <VendorPageLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/vendor/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Products
          </Link>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4" />Saved successfully
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Equipment Listing</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input value={form.location} onChange={e => update('location', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={4} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          </div>

          {/* Pricing & availability */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-semibold text-gray-900">Pricing & Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per Day (€) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  <input type="number" value={form.price_per_day} onChange={e => update('price_per_day', e.target.value)}
                    min="0" className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. Rental Days</label>
                <input type="number" value={form.min_rental_days} onChange={e => update('min_rental_days', e.target.value)}
                  min="1" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            {/* Availability toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <div className="flex gap-3">
                {[true, false].map(val => (
                  <button key={String(val)} onClick={() => update('available', val)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-colors ${form.available === val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {val ? '● Available Now' : '○ Mark Unavailable'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Technical Specifications</h2>
              <button onClick={addSpec} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700">
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            {specs.length === 0 && <p className="text-sm text-gray-400">No specifications added yet.</p>}
            <div className="space-y-3">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)}
                    placeholder="e.g. Weight"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <input value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                    placeholder="e.g. 85 kg"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button onClick={() => removeSpec(i)} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/vendor/products" className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">
              Cancel
            </Link>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </VendorPageLayout>
  )
}
