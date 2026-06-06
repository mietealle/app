/**
 * Mietealle — Supabase setup script
 * Run once:  node scripts/setup-db.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'

// Polyfill WebSocket for Node 20
if (!globalThis.WebSocket) globalThis.WebSocket = ws

const { createClient } = await import('@supabase/supabase-js')

const __dir = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local ──────────────────────────────────────────────────────────
const env = {}
readFileSync(resolve(__dir, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const [k, ...vs] = line.split('=')
  if (k && !k.startsWith('#') && k.trim()) env[k.trim()] = vs.join('=').trim()
})

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1)
}

console.log('\n🚀  Mietealle — Supabase Setup')
console.log('   Project:', SUPABASE_URL, '\n')

// ── Helpers: raw fetch with service-role headers ─────────────────────────────
const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function dbGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

async function dbPost(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  })
  const text = await r.text()
  return { ok: r.ok, status: r.status, data: text ? JSON.parse(text) : null }
}

async function authPost(path, body) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

async function authGet(path) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, { headers })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

// ── Step 1: Check tables ──────────────────────────────────────────────────────
console.log('🔍  Step 1/3 — Checking database tables...')
const tableCheck = await dbGet('profiles?select=id&limit=1')

if (tableCheck.status === 404 ||
    (tableCheck.data?.message || '').includes('does not exist') ||
    (tableCheck.data?.hint || '').includes('profiles')) {
  console.log('\n   ⚠️   Tables not found — run the schema SQL first.\n')
  console.log('   1. Open: https://supabase.com/dashboard/project/pjlkuzasfdaczhgvuhbw/sql/new')
  console.log('   2. Open file: supabase/schema.sql → Select All → Copy → Paste → Run')
  console.log('   3. Re-run: node scripts/setup-db.mjs\n')
  process.exit(0)
}

if (!tableCheck.ok && tableCheck.status !== 200) {
  // "permission denied" with service-role = table exists but needs GRANT
  // Try to fix it via a GRANT query
  if ((tableCheck.data?.message || '').includes('permission denied')) {
    console.log('   ⚠️   Permission issue — tables exist but need grants. Continuing...\n')
  } else {
    console.error('   ❌  Unexpected error:', JSON.stringify(tableCheck.data))
    process.exit(1)
  }
} else {
  console.log('   ✅  Tables exist!\n')
}

// ── Step 2: Create admin auth user via Admin API ──────────────────────────────
console.log('👤  Step 2/3 — Creating admin auth user...')

// List existing users
const listRes = await authGet('admin/users?page=1&per_page=50')
if (!listRes.ok) {
  console.error('   ❌  Cannot list users:', JSON.stringify(listRes.data))
  process.exit(1)
}

const existingUsers = listRes.data?.users || listRes.data || []
const existing = existingUsers.find(u => u.email === 'admin@mietealle.de')
let adminId

if (existing) {
  adminId = existing.id
  console.log('   ✅  Admin already exists:', adminId, '\n')
} else {
  const createRes = await authPost('admin/users', {
    email: 'admin@mietealle.de',
    password: 'admin123',
    email_confirm: true,
  })
  if (!createRes.ok) {
    console.error('   ❌  Create user failed:', JSON.stringify(createRes.data)); process.exit(1)
  }
  adminId = createRes.data.id
  console.log('   ✅  Admin user created:', adminId, '\n')
}

// ── Step 3: Upsert admin profile ──────────────────────────────────────────────
console.log('📝  Step 3/3 — Saving admin profile...')

const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify({
    id: adminId,
    name: 'Admin User',
    email: 'admin@mietealle.de',
    role: 'admin',
    company: 'Mietealle GmbH',
    phone: '+49 40 000000',
    verification_status: 'verified',
  }),
})

const upsertBody = await upsertRes.text()
if (!upsertRes.ok) {
  console.error('   ❌  Profile error:', upsertBody)
  console.log('\n   ℹ️   If you see "permission denied", run this in Supabase SQL Editor:')
  console.log('       GRANT ALL ON public.profiles TO service_role;')
  process.exit(1)
}

console.log('   ✅  Admin profile saved!\n')

console.log('═══════════════════════════════════════════════')
console.log('✅  Setup complete!')
console.log('   Admin login →  http://localhost:3000/admin/login')
console.log('   Email       →  admin@mietealle.de')
console.log('   Password    →  admin123')
console.log('═══════════════════════════════════════════════')
console.log('\n   Run: npm run dev\n')
