'use client'

import { useState, useEffect, useCallback } from 'react'

const STEP_LABELS: Record<string, string> = {
  Ligacao:     '📞 Ligação',
  WhatsApp:    '💬 WhatsApp',
  TikTok:      '🎵 TikTok',
  IMC:         '📊 IMC',
  Diagnostico: '🔍 Diagnóstico',
  Vendas:      '💰 Vendas',
}

interface Step {
  name: string
  label: string
  number: number
  count: number
}

interface RecentEvent {
  step_name: string
  session_id: string
  created_at: string
}

interface DashboardData {
  steps: Step[]
  recent: RecentEvent[]
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return `${Math.floor(diff / 86400)}d atrás`
}

export default function DashboardPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async (pwd: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'x-dashboard-password': pwd },
      })
      if (res.status === 401) { setError('Senha incorreta'); setAuthed(false); return }
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthed(true)
    fetchData(password)
  }

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authed || !password) return
    const interval = setInterval(() => fetchData(password), 30000)
    return () => clearInterval(interval)
  }, [authed, password, fetchData])

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-3xl mb-2">📊</p>
            <h1 className="text-white font-black text-xl">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Start Empoderada</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#22C55E] text-black font-black py-3 rounded-xl active:scale-95 transition-transform"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  const steps = data?.steps ?? []
  const recent = data?.recent ?? []
  const visitantes = steps[0]?.count ?? 0
  const leadsAdq = steps[2]?.count ?? 0
  const leadsQual = steps[4]?.count ?? 0
  const finalizados = steps[5]?.count ?? 0
  const taxaInteracao = visitantes > 0 ? ((leadsAdq / visitantes) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-xl">📊 Dashboard</h1>
          <p className="text-white/40 text-xs mt-0.5">Start Empoderada</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <p className="text-white/30 text-xs">
              {loading ? 'Atualizando...' : `Atualizado ${timeAgo(lastUpdate.toISOString())}`}
            </p>
          )}
          <button
            onClick={() => fetchData(password)}
            className="bg-white/10 border border-white/20 text-white text-xs px-3 py-2 rounded-lg active:scale-95 transition-transform"
          >
            ↺ Atualizar
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Visitantes', value: visitantes, desc: 'Entraram no funil', icon: '👁️' },
          { label: 'Leads Adquiridos', value: leadsAdq, desc: 'Chegaram ao TikTok', icon: '🙋' },
          { label: 'Taxa de Interação', value: `${taxaInteracao}%`, desc: 'Visitantes × TikTok', icon: '📈' },
          { label: 'Leads Qualificados', value: leadsQual, desc: 'Chegaram ao Diagnóstico', icon: '👍' },
          { label: 'Fluxos Finalizados', value: finalizados, desc: 'Chegaram à oferta', icon: '✅' },
          { label: 'Conversão Geral', value: visitantes > 0 ? `${((finalizados / visitantes) * 100).toFixed(1)}%` : '0.0%', desc: 'Entrada → Vendas', icon: '🏆' },
        ].map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xl">{card.icon}</span>
            <p className="text-[#22C55E] font-black text-2xl">{card.value}</p>
            <p className="text-white font-semibold text-xs">{card.label}</p>
            <p className="text-white/40 text-[10px]">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Funil visual */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-bold text-sm mb-4">Funil de Conversão</h2>
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const prev = i > 0 ? steps[i - 1].count : step.count
            const pct = prev > 0 ? Math.round((step.count / prev) * 100) : 100
            const barWidth = visitantes > 0 ? Math.round((step.count / visitantes) * 100) : 0
            const dropped = prev - step.count

            return (
              <div key={step.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-semibold">
                    {STEP_LABELS[step.name] ?? step.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {i > 0 && dropped > 0 && (
                      <span className="text-red-400 text-[10px]">-{dropped} saíram</span>
                    )}
                    <span className="text-white font-black text-sm">{step.count}</span>
                    {i > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pct >= 70 ? 'bg-green-500/20 text-green-400' : pct >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Eventos recentes */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-white font-bold text-sm mb-4">Últimas Entradas</h2>
        {recent.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">Nenhum evento ainda</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((ev, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{STEP_LABELS[ev.step_name]?.split(' ')[0] ?? '📍'}</span>
                  <span className="text-white text-xs">{STEP_LABELS[ev.step_name] ?? ev.step_name}</span>
                </div>
                <span className="text-white/30 text-[10px]">{timeAgo(ev.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs text-center mt-6">Atualiza automaticamente a cada 30 segundos</p>
    </div>
  )
}
