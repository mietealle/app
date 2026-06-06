'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import VendorPageLayout from '@/components/layout/VendorPageLayout'
import { getSession } from '@/lib/session'
import { categories } from '@/lib/mock-data'
import { Upload, Plus, X, ChevronLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import SmartPricingWidget from '@/components/ai/SmartPricingWidget'

export default function NewProductPage() {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [images, setImages]     = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [specs, setSpecs]       = useState([{ key: '', value: '' }])
  const [form, setForm] = useState({
    title: '', category: 'Display & Visual', description: '',
    pricePerDay: '', minDays: '1', location: '', availability: 'available',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const addSpec = () => setSpecs(s => [...s, { key: '', value: '' }])
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: 'key' | 'value', v: string) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: v } : sp))

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploads = Array.from(files).slice(0, 5) // max 5 images
    for (const file of uploads) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.url) setImages(prev => [...prev, d.url])
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    const session = getSession()
    if (!session) { router.push('/vendor/login'); return }
    if (!form.title || !form.pricePerDay) { setError('Title and price are required.'); return }

    setSaving(true)
    setError('')
    const specifications = Object.fromEntries(specs.filter(s => s.key).map(s => [s.key, s.value]))
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: session.id,
        title: form.title, description: form.description,
        category: form.category, pricePerDay: Number(form.pricePerDay),
        minRentalDays: Number(form.minDays), location: form.location,
        specifications, images,
        available: form.availability === 'available',
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to publish'); return }
    router.push('/vendor/products')
  }

  return (
    <VendorPageLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/vendor/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Equipment</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. LED Digital Display Board 6m²"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Hamburg, Germany"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={4} placeholder="Describe the equipment, condition, and usage notes..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-semibold text-gray-900">Pricing & Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per Day (€) *</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  <input type="number" value={form.pricePerDay} onChange={e => update('pricePerDay', e.target.value)} placeholder="0" min="0"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <SmartPricingWidget
                  category={form.category}
                  location={form.location}
                  onAccept={(price) => update('pricePerDay', String(price))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Rental Days</label>
                <input type="number" value={form.minDays} onChange={e => update('minDays', e.target.value)} min="1"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <div className="flex gap-3">
                {[['available','● Available Now'],['unavailable','○ Temporarily Unavailable']].map(([val, label]) => (
                  <button key={val} onClick={() => update('availability', val)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-colors ${form.availability === val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700">
              <strong>Commission:</strong> Mietealle charges 10% on each booking. You receive 90% after rental completion.
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Technical Specifications</h2>
              <button onClick={addSpec} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"><Plus className="w-4 h-4" />Add Spec</button>
            </div>
            <div className="space-y-3">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={spec.key} onChange={e => updateSpec(i,'key',e.target.value)} placeholder="e.g. Weight"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <input value={spec.value} onChange={e => updateSpec(i,'value',e.target.value)} placeholder="e.g. 85 kg"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button onClick={() => removeSpec(i)} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                    <Image src={url} alt={`Product image ${i+1}`} fill className="object-cover" />
                    <button onClick={() => setImages(prev => prev.filter((_,idx)=>idx!==i))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer">
              {uploading
                ? <><Loader className="w-8 h-8 text-brand-500 mx-auto mb-3 animate-spin" /><p className="text-sm text-brand-600">Uploading to Supabase Storage…</p></>
                : <><Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-sm font-medium text-gray-600">Click to upload product photos</p><p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each · Max 5 images</p></>
              }
              <input ref={fileRef} type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple onChange={e => handleImageUpload(e.target.files)} />
            </div>
          </div>

          {/* Submit */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">Products are <strong>published immediately</strong> — no approval needed for verified vendors.</p>
          </div>

          <div className="flex gap-4">
            <Link href="/vendor/dashboard" className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">Cancel</Link>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Publishing…' : 'Publish Equipment'}
            </button>
          </div>
        </div>
      </div>
    </VendorPageLayout>
  )
}
