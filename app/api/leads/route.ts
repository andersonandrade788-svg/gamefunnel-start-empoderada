import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { phone, session_id } = await req.json()
    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

    await supabase.from('leads').insert({ phone, session_id: session_id ?? null })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-dashboard-password')
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('leads')
    .select('id, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json(data ?? [])
}
