export interface DemoAccount {
  email: string
  password: string
  name: string
  role: 'vendor' | 'renter' | 'admin'
  company: string
  status: 'verified' | 'pending' | 'rejected'
  redirectTo: string
  description: string
  avatar: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // ── ADMIN ──────────────────────────────────────────────────────────────────
  {
    email: 'admin@mietealle.de',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    company: 'Mietealle GmbH',
    status: 'verified',
    redirectTo: '/admin/dashboard',
    description: 'Full platform access. Review KYC, manage vendors & renters.',
    avatar: 'A',
  },

  // ── VENDORS ────────────────────────────────────────────────────────────────
  {
    email: 'k.mueller@techequip.de',
    password: 'vendor123',
    name: 'Klaus Müller',
    role: 'vendor',
    company: 'TechEquip GmbH',
    status: 'verified',
    redirectTo: '/vendor/dashboard',
    description: 'Verified vendor with 2 active listings and confirmed bookings.',
    avatar: 'K',
  },
  {
    email: 'm.weber@avpro.de',
    password: 'vendor123',
    name: 'Markus Weber',
    role: 'vendor',
    company: 'AV Pro Rentals',
    status: 'pending',
    redirectTo: '/vendor/dashboard',
    description: 'Pending verification — shows "awaiting approval" state.',
    avatar: 'M',
  },

  // ── RENTERS ────────────────────────────────────────────────────────────────
  {
    email: 's.bauer@eventco.de',
    password: 'renter123',
    name: 'Sophie Bauer',
    role: 'renter',
    company: 'EventCo GmbH',
    status: 'verified',
    redirectTo: '/renter/dashboard',
    description: 'Verified renter with 2 active orders visible in the dashboard.',
    avatar: 'S',
  },
  {
    email: 'f.hoffmann@bautech.de',
    password: 'renter123',
    name: 'Felix Hoffmann',
    role: 'renter',
    company: 'BauTech AG',
    status: 'pending',
    redirectTo: '/renter/dashboard',
    description: 'Pending KYC — shows verification-in-progress state.',
    avatar: 'F',
  },
]

export function findAccount(email: string, password: string): DemoAccount | null {
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  ) ?? null
}

export function findAccountByEmail(email: string): DemoAccount | null {
  return DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null
}
