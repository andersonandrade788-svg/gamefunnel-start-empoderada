import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { name: 'Ligacao',     number: 1, label: 'Ligação' },
  { name: 'WhatsApp',    number: 2, label: 'WhatsApp' },
  { name: 'TikTok',      number: 3, label: 'TikTok' },
  { name: 'IMC',         number: 4, label: 'IMC' },
  { name: 'Diagnostico', number: 5, label: 'Diagnóstico' },
  { name: 'Vendas',      number: 6, label: 'Vendas' },
]

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-dashboard-password')
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Count unique sessions per step
  const results = await Promise.all(
    STEPS.map(async (step) => {
      const { count } = await supabase
        .from('funnel_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('step_name', step.name)

      return { ...step, count: count ?? 0 }
    })
  )

  // Recent events (last 20)
  const { data: recent } = await supabase
    .from('funnel_events')
    .select('step_name, session_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ steps: results, recent: recent ?? [] })
}
