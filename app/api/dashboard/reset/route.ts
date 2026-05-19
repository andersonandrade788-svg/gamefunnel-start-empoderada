import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ECN_STEPS = ['ECN_Landing', 'ECN_Resultado', 'ECN_Vendas', 'ECN_CheckoutClick']

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-dashboard-password')
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error, count } = await supabase
    .from('funnel_events')
    .delete({ count: 'exact' })
    .in('step_name', ECN_STEPS)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, deleted: count ?? 0 })
}
