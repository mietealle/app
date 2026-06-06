/**
 * Mietealle — Full database seed
 * Creates all 5 demo accounts + products + bookings in Supabase.
 *
 * Run:  node scripts/seed.mjs
 *
 * IMPORTANT: Run supabase/schema.sql in the SQL Editor first.
 * If you see "permission denied", also run the GRANTS block from schema.sql.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local ──────────────────────────────────────────────────────────
const env = {}
readFileSync(resolve(__dir, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const [k, ...vs] = line.split('=')
  if (k && !k.startsWith('#') && k.trim()) env[k.trim()] = vs.join('=').trim()
})

const URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SVC = env['SUPABASE_SERVICE_ROLE_KEY']

if (!URL || !SVC) { console.error('❌  Missing keys in .env.local'); process.exit(1) }

console.log('\n🌱  Mietealle — Database Seed')
console.log('   Project:', URL, '\n')

// ── Raw API helpers ───────────────────────────────────────────────────────────
const H = {
  'apikey': SVC,
  'Authorization': `Bearer ${SVC}`,
  'Content-Type': 'application/json',
}

async function authPost(path, body) {
  const r = await fetch(`${URL}/auth/v1/${path}`, {
    method: 'POST', headers: H, body: JSON.stringify(body),
  })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

async function authGet(path) {
  const r = await fetch(`${URL}/auth/v1/${path}`, { headers: H })
  return { ok: r.ok, data: await r.json() }
}

async function dbUpsert(table, rows, conflict = 'id') {
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...H, 'Prefer': `resolution=merge-duplicates,return=representation` },
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`${table} upsert failed (${r.status}): ${text}`)
  return text ? JSON.parse(text) : []
}

// ── Step 0: Check tables ──────────────────────────────────────────────────────
process.stdout.write('🔍  Checking tables... ')
const check = await fetch(`${URL}/rest/v1/profiles?select=id&limit=1`, { headers: H })
if (check.status === 404) {
  console.log('\n❌  Tables not found.')
  console.log('   Run supabase/schema.sql in the SQL Editor first.')
  console.log(`   URL: https://supabase.com/dashboard/project/${URL.split('//')[1].split('.')[0]}/sql/new\n`)
  process.exit(1)
}
if (check.status === 403 || (await check.clone().text()).includes('permission denied')) {
  console.log('\n❌  Permission denied.')
  console.log('   Run the GRANTS block from schema.sql in the SQL Editor:\n')
  console.log('   grant usage on schema public to postgres, anon, authenticated, service_role;')
  console.log('   grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;\n')
  process.exit(1)
}
console.log('✅\n')

// ── Step 1: Create / find all 5 auth users ────────────────────────────────────
console.log('👥  Step 1 — Creating auth users...')

const ACCOUNTS = [
  { email: 'admin@mietealle.de',        password: 'admin123',   label: 'Admin' },
  { email: 'k.mueller@techequip.de',    password: 'vendor123',  label: 'Vendor 1 (verified)' },
  { email: 'm.weber@avpro.de',          password: 'vendor123',  label: 'Vendor 2 (pending)' },
  { email: 's.bauer@eventco.de',        password: 'renter123',  label: 'Renter 1 (verified)' },
  { email: 'f.hoffmann@bautech.de',     password: 'renter123',  label: 'Renter 2 (pending)' },
]

// Fetch existing users (paginated)
const listRes = await authGet('admin/users?page=1&per_page=100')
const existing = listRes.data?.users ?? []
const byEmail = Object.fromEntries(existing.map(u => [u.email, u.id]))

const ids = {}
for (const acc of ACCOUNTS) {
  if (byEmail[acc.email]) {
    ids[acc.email] = byEmail[acc.email]
    console.log(`   ✅  ${acc.label} already exists`)
  } else {
    const r = await authPost('admin/users', {
      email: acc.email, password: acc.password, email_confirm: true,
    })
    if (!r.ok) { console.error(`   ❌  ${acc.label}:`, r.data?.msg ?? r.data); process.exit(1) }
    ids[acc.email] = r.data.id
    console.log(`   ✅  ${acc.label} created → ${r.data.id}`)
  }
}

// ── Step 2: Upsert profiles ───────────────────────────────────────────────────
console.log('\n📋  Step 2 — Upserting profiles...')

// All rows MUST have identical keys — PostgREST PGRST102 requires this
const profiles = [
  {
    id: ids['admin@mietealle.de'],
    name: 'Admin User', email: 'admin@mietealle.de',
    role: 'admin', company: 'Mietealle GmbH', phone: '+49 40 000000',
    address: null, city: null, vat_id: null,
    verification_status: 'verified',
    govt_doc_type: null, govt_doc_number: null, govt_doc_url: null,
  },
  {
    id: ids['k.mueller@techequip.de'],
    name: 'Klaus Müller', email: 'k.mueller@techequip.de',
    role: 'vendor', company: 'TechEquip GmbH', phone: '+49 40 123456',
    address: 'Hauptstraße 1', city: 'Hamburg', vat_id: null,
    verification_status: 'verified',
    govt_doc_type: 'Gewerbeanmeldung', govt_doc_number: 'HRB 12345', govt_doc_url: null,
  },
  {
    id: ids['m.weber@avpro.de'],
    name: 'Markus Weber', email: 'm.weber@avpro.de',
    role: 'vendor', company: 'AV Pro Rentals', phone: '+49 69 111222',
    address: 'Kaiserstraße 5', city: 'Frankfurt', vat_id: null,
    verification_status: 'pending',
    govt_doc_type: 'Gewerbeschein', govt_doc_number: 'GS-2024-0312', govt_doc_url: null,
  },
  {
    id: ids['s.bauer@eventco.de'],
    name: 'Sophie Bauer', email: 's.bauer@eventco.de',
    role: 'renter', company: 'EventCo GmbH', phone: '+49 40 999888',
    address: 'Alsterufer 10', city: 'Hamburg', vat_id: 'DE123456789',
    verification_status: 'verified',
    govt_doc_type: 'Gewerbeanmeldung', govt_doc_number: 'HRB 99001', govt_doc_url: null,
  },
  {
    id: ids['f.hoffmann@bautech.de'],
    name: 'Felix Hoffmann', email: 'f.hoffmann@bautech.de',
    role: 'renter', company: 'BauTech AG', phone: '+49 89 777666',
    address: 'Maximilianstraße 3', city: 'Munich', vat_id: null,
    verification_status: 'pending',
    govt_doc_type: 'Handelsregister', govt_doc_number: 'HRB 55432', govt_doc_url: null,
  },
]

await dbUpsert('profiles', profiles)
console.log('   ✅  5 profiles saved')

// ── Step 3: Upsert products ───────────────────────────────────────────────────
console.log('\n📦  Step 3 — Upserting products...')

const v1 = ids['k.mueller@techequip.de']
const v2 = ids['m.weber@avpro.de']

const products = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    vendor_id: v1,
    title: 'LED Digital Display Board 6m²',
    description: 'High-brightness outdoor LED display board, ideal for events, trade fairs, and exhibitions. 6m² viewing area with Full HD resolution. Easy setup with included mounting kit.',
    category: 'Display & Visual',
    price_per_day: 380,
    min_rental_days: 1,
    location: 'Hamburg, Germany',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    status: 'active',
    available: true,
    specifications: { Resolution: '1920 x 1080 (Full HD)', Brightness: '5000 cd/m²', Size: '3m × 2m', Weight: '85 kg', Power: '2.4 kW' },
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    vendor_id: v1,
    title: 'Industrial Generator 50kVA',
    description: 'Diesel-powered industrial generator suitable for construction sites, outdoor events, and emergency power backup. Includes automatic voltage regulation and noise insulation housing.',
    category: 'Power & Energy',
    price_per_day: 250,
    min_rental_days: 2,
    location: 'Hamburg, Germany',
    images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80'],
    status: 'active',
    available: true,
    specifications: { 'Power Output': '50 kVA / 40 kW', 'Fuel Type': 'Diesel', 'Tank Capacity': '200 L', Runtime: '~20 hours', 'Noise Level': '68 dB(A)' },
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    vendor_id: v1,
    title: 'Electric Forklift 3.5T',
    description: 'Zero-emission electric forklift with 3500 kg lifting capacity. Perfect for warehouse operations, logistics centres, and indoor use.',
    category: 'Material Handling',
    price_per_day: 195,
    min_rental_days: 1,
    location: 'Berlin, Germany',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'],
    status: 'active',
    available: true,
    specifications: { 'Lift Capacity': '3,500 kg', 'Lift Height': '5.5 m', Drive: 'Electric (48V)', 'Battery Life': '8 hours', Width: '1.2 m' },
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    vendor_id: v1,
    title: 'Mobile Scissor Lift 12m',
    description: 'Self-propelled electric scissor lift reaching 12m working height. Ideal for interior construction, maintenance, and installation work. Non-marking tyres for sensitive floors.',
    category: 'Access Equipment',
    price_per_day: 165,
    min_rental_days: 1,
    location: 'Munich, Germany',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
    status: 'active',
    available: false,
    specifications: { 'Working Height': '12 m', 'Platform Size': '2.3m × 1.2m', 'Load Capacity': '450 kg', Drive: 'Electric', Certification: 'EN 280' },
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    vendor_id: v2,
    title: 'Professional Sound System 10kW',
    description: 'Complete PA system with line arrays, subwoofers, and mixing console. Supports audiences up to 2000 people. Perfect for corporate events and outdoor festivals.',
    category: 'Audio & Visual',
    price_per_day: 420,
    min_rental_days: 1,
    location: 'Frankfurt, Germany',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'],
    status: 'active',
    available: true,
    specifications: { 'Output Power': '10,000 W RMS', Speakers: '8× Line Array + 4× Subwoofer', Coverage: 'Up to 2,000 persons', Console: '32-channel digital mixer', 'Setup Time': '3–4 hours' },
  },
  {
    id: '00000000-0000-0000-0001-000000000006',
    vendor_id: v2,
    title: 'Conference Video System Pack',
    description: 'Complete conferencing setup with 85" 4K display, PTZ camera, wireless microphones, and AV receiver. Plug-and-play for boardrooms and hybrid events.',
    category: 'Display & Visual',
    price_per_day: 290,
    min_rental_days: 1,
    location: 'Frankfurt, Germany',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'],
    status: 'active',
    available: true,
    specifications: { Display: '85" 4K UHD', Camera: 'PTZ 4K, 12× optical zoom', Microphones: '4× wireless lapel + 2× handheld', Connectivity: 'HDMI, USB-C, Wi-Fi', 'Setup Time': '1 hour' },
  },
]

await dbUpsert('products', products)
console.log(`   ✅  ${products.length} products saved`)

// ── Step 4: Upsert bookings ───────────────────────────────────────────────────
console.log('\n📅  Step 4 — Upserting bookings...')

const r1 = ids['s.bauer@eventco.de']
const r2 = ids['f.hoffmann@bautech.de']

const bookings = [
  {
    id: '00000000-0000-0000-0002-000000000001',
    product_id: '00000000-0000-0000-0001-000000000001',
    renter_id: r1,
    vendor_id: v1,
    start_date: '2024-06-10',
    end_date: '2024-06-12',
    total_days: 3,
    total_amount: 1140,
    status: 'confirmed',
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    product_id: '00000000-0000-0000-0001-000000000003',
    renter_id: r1,
    vendor_id: v1,
    start_date: '2024-06-20',
    end_date: '2024-06-22',
    total_days: 3,
    total_amount: 585,
    status: 'pending',
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    product_id: '00000000-0000-0000-0001-000000000005',
    renter_id: r2,
    vendor_id: v2,
    start_date: '2024-07-01',
    end_date: '2024-07-03',
    total_days: 3,
    total_amount: 1260,
    status: 'pending',
  },
]

await dbUpsert('bookings', bookings)
console.log(`   ✅  ${bookings.length} bookings saved`)

// ── Done ──────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════')
console.log('✅  Seed complete! All 5 accounts ready:\n')
console.log('   ADMIN')
console.log('   admin@mietealle.de          / admin123')
console.log('')
console.log('   VENDORS')
console.log('   k.mueller@techequip.de      / vendor123  (verified, 4 products)')
console.log('   m.weber@avpro.de            / vendor123  (pending,  2 products)')
console.log('')
console.log('   RENTERS')
console.log('   s.bauer@eventco.de          / renter123  (verified, 2 bookings)')
console.log('   f.hoffmann@bautech.de       / renter123  (pending,  1 booking)')
console.log('')
console.log('   Run: npm run dev')
console.log('   URL: http://localhost:3000\n')
