import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { stepName, stepNumber, sessionId, source } = await req.json()

    const { error } = await supabase.from('funnel_events').insert({
      step_name: stepName,
      step_number: stepNumber,
      session_id: sessionId,
      source: source ?? 'organic',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
