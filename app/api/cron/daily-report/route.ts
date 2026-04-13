import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { name: 'Quiz',        label: 'Quiz',         emoji: '🎯' },
  { name: 'TikTok',      label: 'TikTok',       emoji: '🎵' },
  { name: 'IMC',         label: 'IMC',          emoji: '📊' },
  { name: 'Diagnostico', label: 'Diagnóstico',  emoji: '🔍' },
  { name: 'Vendas',      label: 'Viu a Oferta', emoji: '👀' },
]

async function getStepCounts(since: string) {
  return Promise.all(
    STEPS.map(async (step) => {
      const { count } = await supabase
        .from('funnel_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('step_name', step.name)
        .gte('created_at', since)
      return { ...step, count: count ?? 0 }
    })
  )
}

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-dashboard-password') || req.nextUrl.searchParams.get('secret')
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const [todaySteps, yesterdaySteps] = await Promise.all([
    getStepCounts(todayStart.toISOString()),
    getStepCounts(yesterdayStart.toISOString()),
  ])

  // Leads capturados hoje
  const { data: leads } = await supabase
    .from('leads')
    .select('phone, created_at')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })

  const top = todaySteps[0].count
  const vendas = todaySteps[4].count
  const taxaFunil = top > 0 ? ((vendas / top) * 100).toFixed(1) : '0.0'

  const stepsHtml = todaySteps.map((step, i) => {
    const prev = i > 0 ? todaySteps[i - 1].count : step.count
    const taxa = i === 0 ? 100 : (prev > 0 ? Math.round((step.count / prev) * 100) : 0)
    const yesterday = yesterdaySteps[i].count
    const diff = step.count - yesterday
    const diffText = diff > 0 ? `+${diff}` : `${diff}`
    const diffColor = diff >= 0 ? '#22C55E' : '#ef4444'

    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;">
          ${step.emoji} ${step.label}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;font-weight:bold;color:#fff;">
          ${step.count}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;color:${diffColor};font-weight:bold;">
          ${diffText}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1f1f1f;text-align:center;color:${taxa >= 50 ? '#22C55E' : taxa >= 30 ? '#fbbf24' : '#ef4444'};">
          ${i === 0 ? '—' : `${taxa}%`}
        </td>
      </tr>
    `
  }).join('')

  const leadsHtml = leads && leads.length > 0
    ? leads.map(l => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1f1f1f;color:#22C55E;">📱 ${l.phone}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #1f1f1f;color:#888;text-align:right;">
            ${new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </td>
        </tr>
      `).join('')
    : `<tr><td colspan="2" style="padding:16px;text-align:center;color:#555;">Nenhum lead capturado hoje</td></tr>`

  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background:#0D0D0D;color:#ccc;font-family:Arial,sans-serif;margin:0;padding:24px;">
      <div style="max-width:560px;margin:0 auto;">

        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:40px;margin-bottom:8px;">📊</div>
          <h1 style="color:#fff;font-size:22px;margin:0;">Relatório Diário</h1>
          <p style="color:#555;margin:4px 0 0;">Start Empoderada · ${dateStr}</p>
        </div>

        <!-- Resumo -->
        <div style="display:flex;gap:12px;margin-bottom:24px;">
          <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#555;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Entraram no Quiz</p>
            <p style="color:#a78bfa;font-size:28px;font-weight:bold;margin:0;">${top}</p>
          </div>
          <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#555;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Taxa do Funil</p>
            <p style="color:#22C55E;font-size:28px;font-weight:bold;margin:0;">${taxaFunil}%</p>
          </div>
          <div style="flex:1;background:#111;border:1px solid #1f1f1f;border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#555;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Leads</p>
            <p style="color:#f472b6;font-size:28px;font-weight:bold;margin:0;">${leads?.length ?? 0}</p>
          </div>
        </div>

        <!-- Funil -->
        <div style="background:#111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;margin-bottom:24px;">
          <div style="padding:16px;border-bottom:1px solid #1f1f1f;">
            <h2 style="color:#fff;font-size:14px;margin:0;">Funil de Conversão</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#ccc;">
            <thead>
              <tr style="color:#555;font-size:11px;text-transform:uppercase;">
                <th style="padding:10px 16px;text-align:left;">Etapa</th>
                <th style="padding:10px 16px;text-align:center;">Hoje</th>
                <th style="padding:10px 16px;text-align:center;">vs Ontem</th>
                <th style="padding:10px 16px;text-align:center;">Taxa</th>
              </tr>
            </thead>
            <tbody>${stepsHtml}</tbody>
          </table>
        </div>

        <!-- Leads -->
        <div style="background:#111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;margin-bottom:32px;">
          <div style="padding:16px;border-bottom:1px solid #1f1f1f;">
            <h2 style="color:#fff;font-size:14px;margin:0;">📱 Leads Capturados Hoje</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tbody>${leadsHtml}</tbody>
          </table>
        </div>

        <p style="color:#333;font-size:11px;text-align:center;">
          Start Empoderada · Relatório automático diário
        </p>
      </div>
    </body>
    </html>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Dashboard <relatorio@resend.dev>',
    to: 'andersonandrade788@gmail.com',
    subject: `📊 Relatório Diário — ${top} pessoas no funil hoje`,
    html,
  })

  return NextResponse.json({ ok: true, sent: true })
}
