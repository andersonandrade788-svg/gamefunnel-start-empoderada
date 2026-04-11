import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { name: 'Quiz',        number: 1, label: 'Quiz' },
  { name: 'TikTok',      number: 2, label: 'TikTok' },
  { name: 'IMC',         number: 3, label: 'IMC' },
  { name: 'Diagnostico', number: 4, label: 'Diagnóstico' },
  { name: 'Roleta',      number: 5, label: 'Roleta' },
  { name: 'Vendas',      number: 6, label: 'Viu a Oferta' },
]

async function countSteps(source?: 'ad' | 'organic') {
  return Promise.all(
    STEPS.map(async (step) => {
      let query = supabase
        .from('funnel_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('step_name', step.name)

      if (source) query = query.eq('source', source)

      const { count } = await query
      return { ...step, count: count ?? 0 }
    })
  )
}

async function getRecent(source?: 'ad' | 'organic') {
  let query = supabase
    .from('funnel_events')
    .select('step_name, session_id, created_at, source')
    .order('created_at', { ascending: false })
    .limit(20)

  if (source) query = query.eq('source', source)

  const { data } = await query
  return data ?? []
}

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-dashboard-password')
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sourceFilter = searchParams.get('source') as 'ad' | 'organic' | null

  const [steps, recent] = await Promise.all([
    countSteps(sourceFilter ?? undefined),
    getRecent(sourceFilter ?? undefined),
  ])

  return NextResponse.json({ steps, recent })
}
