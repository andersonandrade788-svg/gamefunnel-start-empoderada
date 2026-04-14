import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Detecta o tipo de evento pelo campo status ou event_type da Cakto
    const status = body?.status ?? body?.event_type ?? body?.type ?? ''

    let stepName = ''
    let stepNumber = 7

    if (status.toLowerCase().includes('pix') || status.toLowerCase().includes('pending')) {
      stepName = 'Pix Gerado'
    } else if (status.toLowerCase().includes('refused') || status.toLowerCase().includes('recusado') || status.toLowerCase().includes('declined')) {
      stepName = 'Cartão Recusado'
    } else if (status.toLowerCase().includes('abandon') || status.toLowerCase().includes('cart')) {
      stepName = 'Abandono'
    } else {
      stepName = `Checkout: ${status}`
    }

    await db.from('funnel_events').insert({
      step_name: stepName,
      step_number: stepNumber,
      session_id: body?.customer?.email ?? body?.id ?? 'webhook',
      source: 'ad',
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
