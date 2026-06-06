/**
 * POST /api/auth/register
 * Creates a Supabase auth user + profile row.
 * Uses service-role key so it can write to profiles regardless of RLS.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, password, role,
      company, phone, address, city, vatId,
      docType, docNumber,
    } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // auto-confirm for demo — remove in production
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Failed to create user' }, { status: 400 })
    }

    // 2. Insert the profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      role,
      company: company ?? null,
      phone: phone ?? null,
      address: address ?? null,
      city: city ?? null,
      vat_id: vatId ?? null,
      verification_status: 'pending',
      govt_doc_type: docType ?? null,
      govt_doc_number: docNumber ?? null,
    })

    if (profileError) {
      // Roll back: delete the auth user if profile insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
