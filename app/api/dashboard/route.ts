import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { name: 'Quiz',        number: 1, label: 'Quiz' },
  { name: 'TikTok',      number: 2, label: 'TikTok' },
  { name: 'IMC',         number: 3, label: 'IMC' },
  { name: 'Diagnostico', number: 4, label: 'Diagnóstico' },
  { name: 'Vendas',      number: 5, label: 'Viu a Oferta' },
]

function getDateFilter(period: string): string | null {
  const now = new Date()
  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }
  if (period === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    return start.toISOString()
  }
  return null // total
}

async function countSteps(source?: 'ad' | 'organic', since?: string | null) {
  return Promise.all(
    STEPS.map(async (step) => {
      let query = supabase
        .from('funnel_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('step_name', step.name)

      if (source) query = query.eq('source', source)
      if (since)  query = query.gte('created_at', since)

      const { count } = await query
      return { ...step, count: count ?? 0 }
    })
  )
}

async function getRecent(source?: 'ad' | 'organic', since?: string | null) {
  let query = supabase
    .from('funnel_events')
    .select('step_name, session_id, created_at, source')
    .order('created_at', { ascending: false })
    .limit(20)

  if (source) query = query.eq('source', source)
  if (since)  query = query.gte('created_at', since)

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
  const period = searchParams.get('period') ?? 'today'
  const since = getDateFilter(period)

  const [steps, recent] = await Promise.all([
    countSteps(sourceFilter ?? undefined, since),
    getRecent(sourceFilter ?? undefined, since),
  ])

  return NextResponse.json({ steps, recent })
}
