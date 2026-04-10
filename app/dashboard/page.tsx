'use client'

import { useState, useEffect, useCallback } from 'react'

const STEPS_META = [
  { name: 'Ligacao',     emoji: '📞', label: 'Ligação',     color: '#a78bfa' },
  { name: 'WhatsApp',    emoji: '💬', label: 'WhatsApp',    color: '#34d399' },
  { name: 'TikTok',      emoji: '🎵', label: 'TikTok',      color: '#f472b6' },
  { name: 'IMC',         emoji: '📊', label: 'IMC',         color: '#60a5fa' },
  { name: 'Diagnostico', emoji: '🔍', label: 'Diagnóstico', color: '#fbbf24' },
  { name: 'Vendas',      emoji: '💰', label: 'Vendas',      color: '#22c55e' },
]

interface Step { name: string; label: string; number: number; count: number }
interface RecentEvent { step_name: string; session_id: string; created_at: string }
interface DashboardData { steps: Step[]; recent: RecentEvent[] }

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return `${Math.floor(diff / 86400)}d atrás`
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ── Login ──────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pwd: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/dashboard', {
      headers: { 'x-dashboard-password': password },
    })
    setLoading(false)
    if (res.status === 401) { setError('Senha incorreta'); return }
    onLogin(password)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">

      {/* Painel esquerdo — visível só no desktop */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#0a1a0a] to-[#0D0D0D] border-r border-white/5 p-12 gap-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] mb-6 shadow-2xl shadow-green-500/30">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-white font-black text-4xl leading-tight">GameFunnel</h1>
          <p className="text-[#22C55E] font-bold text-lg mt-1">Start Empoderada</p>
          <p className="text-white/30 text-sm mt-3 max-w-xs">Acompanhe cada etapa do funil em tempo real e saiba exatamente onde seus leads estão.</p>
        </div>

        {/* Mini preview do funil */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          {[
            { label: 'Ligação',     color: '#a78bfa', w: '100%' },
            { label: 'WhatsApp',    color: '#34d399', w: '82%'  },
            { label: 'TikTok',      color: '#f472b6', w: '68%'  },
            { label: 'IMC',         color: '#60a5fa', w: '54%'  },
            { label: 'Diagnóstico', color: '#fbbf24', w: '40%'  },
            { label: 'Vendas',      color: '#22c55e', w: '25%'  },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-20 text-right flex-shrink-0">{s.label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: s.w, background: s.color + '80' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/30 text-xs">Atualização em tempo real</span>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] mb-4 shadow-lg shadow-green-500/20">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-white font-black text-2xl">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Start Empoderada</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-white font-black text-2xl">Bem-vindo de volta</h2>
            <p className="text-white/40 text-sm mt-1">Entre com sua senha para acessar o dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E] transition-all text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-lg">🔐</span>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-black font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acessar Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'funil' | 'recentes'>('funil')

  const fetchData = useCallback(async (password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'x-dashboard-password': password },
      })
      if (!res.ok) return
      setData(await res.json())
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  function handleLogin(password: string) {
    setPwd(password)
    setAuthed(true)
    fetchData(password)
  }

  useEffect(() => {
    if (!authed || !pwd) return
    const interval = setInterval(() => fetchData(pwd), 30000)
    return () => clearInterval(interval)
  }, [authed, pwd, fetchData])

  if (!authed) return <LoginScreen onLogin={handleLogin} />

  const steps = data?.steps ?? []
  const recent = data?.recent ?? []
  const visitantes = steps[0]?.count ?? 0
  const leadsAdq   = steps[2]?.count ?? 0
  const leadsQual  = steps[4]?.count ?? 0
  const finalizados = steps[5]?.count ?? 0
  const taxaInt = visitantes > 0 ? ((leadsAdq / visitantes) * 100).toFixed(1) : '0.0'
  const taxaConv = visitantes > 0 ? ((finalizados / visitantes) * 100).toFixed(1) : '0.0'

  const topCards = [
    { label: 'Visitantes',        value: visitantes,    desc: 'Entraram no funil',         icon: '👁️',  color: 'from-violet-500/20 to-violet-500/5',  border: 'border-violet-500/30',  text: 'text-violet-400' },
    { label: 'Leads Adquiridos',  value: leadsAdq,      desc: 'Chegaram ao TikTok',        icon: '🙋',  color: 'from-pink-500/20 to-pink-500/5',      border: 'border-pink-500/30',    text: 'text-pink-400'   },
    { label: 'Taxa de Interação', value: `${taxaInt}%`, desc: 'Visitantes → TikTok',       icon: '📈',  color: 'from-blue-500/20 to-blue-500/5',      border: 'border-blue-500/30',    text: 'text-blue-400'   },
    { label: 'Leads Qualificados',value: leadsQual,     desc: 'Chegaram ao Diagnóstico',   icon: '👍',  color: 'from-yellow-500/20 to-yellow-500/5',  border: 'border-yellow-500/30',  text: 'text-yellow-400' },
    { label: 'Fluxos Finalizados',value: finalizados,   desc: 'Chegaram à oferta',         icon: '✅',  color: 'from-green-500/20 to-green-500/5',    border: 'border-green-500/30',   text: 'text-green-400'  },
    { label: 'Conversão Geral',   value: `${taxaConv}%`,desc: 'Entrada → Vendas',          icon: '🏆',  color: 'from-orange-500/20 to-orange-500/5',  border: 'border-orange-500/30',  text: 'text-orange-400' },
  ]

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-md shadow-green-500/20 flex-shrink-0">
              <span className="text-base">📊</span>
            </div>
            <div>
              <h1 className="text-white font-black text-base leading-tight">Dashboard</h1>
              <p className="text-white/30 text-[11px]">Start Empoderada</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/30 text-xs">
                {loading ? 'Atualizando...' : lastUpdate ? `${timeAgo(lastUpdate.toISOString())}` : '—'}
              </span>
            </div>
            <button
              onClick={() => fetchData(pwd)}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>↺</span>
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topCards.map((card, i) => (
            <div
              key={i}
              className={`bg-gradient-to-b ${card.color} border ${card.border} rounded-2xl p-4 flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className={`font-black text-2xl sm:text-3xl ${card.text}`}>{card.value}</p>
              <div>
                <p className="text-white font-semibold text-xs leading-tight">{card.label}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
          {(['funil', 'recentes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#22C55E] text-black'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab === 'funil' ? '🔽 Funil' : '⏱️ Recentes'}
            </button>
          ))}
        </div>

        {/* ── Funil Tab ── */}
        {activeTab === 'funil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Funil visual */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-6">Funil de Conversão</h2>
              <div className="flex flex-col gap-5">
                {steps.map((step, i) => {
                  const meta = STEPS_META.find(s => s.name === step.name)
                  const prev = i > 0 ? steps[i - 1].count : step.count
                  const pct = prev > 0 ? Math.round((step.count / prev) * 100) : 100
                  const barWidth = visitantes > 0 ? Math.round((step.count / visitantes) * 100) : 0
                  const dropped = prev - step.count

                  return (
                    <div key={step.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{meta?.emoji}</span>
                          <span className="text-white text-sm font-semibold">{meta?.label ?? step.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {i > 0 && dropped > 0 && (
                            <span className="text-red-400/70 text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full">
                              -{dropped} saíram
                            </span>
                          )}
                          <span className="text-white font-black text-base">{step.count}</span>
                          {i > 0 && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              pct >= 70 ? 'bg-green-500/15 text-green-400'
                              : pct >= 40 ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-red-500/15 text-red-400'
                            }`}>
                              {pct}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${meta?.color}99, ${meta?.color})`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pirâmide do funil */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-6">Visualização do Funil</h2>
              <div className="flex flex-col items-center gap-1.5">
                {steps.map((step, i) => {
                  const meta = STEPS_META.find(s => s.name === step.name)
                  const maxCount = steps[0]?.count || 1
                  const widthPct = Math.max(((step.count / maxCount) * 85), 15)

                  return (
                    <div key={step.name} className="w-full flex flex-col items-center">
                      <div
                        className="rounded-xl py-2.5 px-4 flex items-center justify-between transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          background: `${meta?.color}18`,
                          border: `1px solid ${meta?.color}40`,
                          minWidth: '120px',
                        }}
                      >
                        <span className="text-sm">{meta?.emoji}</span>
                        <span className="text-white text-xs font-bold">{meta?.label}</span>
                        <span className="font-black text-sm" style={{ color: meta?.color }}>{step.count}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="text-white/20 text-xs my-0.5">▼</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Recentes Tab ── */}
        {activeTab === 'recentes' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Últimas Entradas</h2>
              <span className="text-white/30 text-xs">{recent.length} eventos</span>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📭</span>
                <p className="text-white/30 text-sm">Nenhum evento registrado ainda</p>
                <p className="text-white/20 text-xs">Navegue pelo funil para gerar dados</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recent.map((ev, i) => {
                  const meta = STEPS_META.find(s => s.name === ev.step_name)
                  return (
                    <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${meta?.color}18`, border: `1px solid ${meta?.color}30` }}
                        >
                          <span className="text-sm">{meta?.emoji ?? '📍'}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{meta?.label ?? ev.step_name}</p>
                          <p className="text-white/30 text-[10px] font-mono">
                            #{ev.session_id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs">{timeAgo(ev.created_at)}</p>
                        <p className="text-white/20 text-[10px]">{formatTime(ev.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <p className="text-white/15 text-xs text-center pb-4">
          ↺ Atualiza automaticamente a cada 30 segundos
        </p>
      </main>
    </div>
  )
}
