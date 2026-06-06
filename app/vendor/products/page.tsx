'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/session'
import { formatCurrency } from '@/lib/utils'
import { Plus, Eye, Edit3, ChevronLeft, ToggleLeft, ToggleRight } from 'lucide-react'

export default function VendorProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'vendor') { router.push('/vendor/login'); return }

    fetch(`/api/products?vendor_id=${session.id}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  const toggleAvailability = async (product: any) => {
    const updated = { ...product, available: !product.available }
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p))
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: updated.available }),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/vendor/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 text-sm mt-0.5">{products.length} products</p>
          </div>
          <Link href="/vendor/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-400 text-sm">No products yet.</p>
            <Link href="/vendor/products/new" className="mt-2 inline-block text-sm text-brand-600 hover:underline">Add your first product →</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-left px-6 py-3">Category</th>
                  <th className="text-left px-6 py-3">Price/Day</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Availability</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {product.images?.[0] && <Image src={product.images[0]} alt={product.title} fill className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(product.price_per_day)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleAvailability(product)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${product.available ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
                        {product.available
                          ? <><ToggleRight className="w-5 h-5" />Available</>
                          : <><ToggleLeft className="w-5 h-5" />Unavailable</>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/marketplace/${product.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600" title="View in marketplace">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/vendor/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600" title="Edit product">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
