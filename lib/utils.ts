import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    verified:  'bg-green-100 text-green-800',
    rejected:  'bg-red-100 text-red-800',
    active:    'bg-green-100 text-green-800',
    inactive:  'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-purple-100 text-purple-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
