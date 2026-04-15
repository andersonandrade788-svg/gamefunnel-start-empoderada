'use client'

import { useState, useEffect, useCallback } from 'react'

const ORIGINAL_STEPS_META = [
  { name: 'Quiz',              emoji: '🎯', label: 'Quiz',            color: '#a78bfa' },
  { name: 'TikTok',            emoji: '🎵', label: 'TikTok',          color: '#f472b6' },
  { name: 'IMC',               emoji: '📊', label: 'IMC',             color: '#60a5fa' },
  { name: 'Diagnostico',       emoji: '🔍', label: 'Diagnóstico',     color: '#fbbf24' },
  { name: 'Vendas',            emoji: '👀', label: 'Viu a Oferta',    color: '#22c55e' },
  { name: 'Pix Gerado',        emoji: '💸', label: 'Pix Gerado',      color: '#34d399' },
  { name: 'Cartão Recusado',   emoji: '❌', label: 'Cartão Recusado', color: '#f87171' },
  { name: 'Abandono',          emoji: '🚪', label: 'Abandono',        color: '#94a3b8' },
  { name: 'Compra',            emoji: '💰', label: 'Comprou',         color: '#f59e0b' },
]

const BUMBUM_STEPS_META = [
  { name: 'Bumbum_Landing',   emoji: '🍑', label: 'Landing Page',  color: '#E91E8C' },
  { name: 'Bumbum_Quiz',      emoji: '📋', label: 'Quiz',          color: '#f472b6' },
  { name: 'Bumbum_Resultado', emoji: '📊', label: 'Resultado',     color: '#fbbf24' },
  { name: 'Bumbum_Vendas',    emoji: '👀', label: 'Viu a Oferta',  color: '#22c55e' },
  { name: 'Compra',           emoji: '💰', label: 'Comprou',       color: '#f59e0b' },
]

interface Step { name: string; label: string; number: number; count: number }
interface RecentEvent { step_name: string; session_id: string; created_at: string; source?: string }
interface Lead { id: string; phone: string; created_at: string }
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
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] mb-4 shadow-lg shadow-green-500/20">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-white font-black text-2xl">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Start Empoderada</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'funil' | 'recentes' | 'leads'>('funil')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'ad' | 'organic'>('all')
  const [period, setPeriod] = useState<'today' | 'yesterday' | '7d' | 'all'>('today')
  const [leads, setLeads] = useState<Lead[]>([])
  const [funnelType, setFunnelType] = useState<'original' | 'bumbum'>('original')

  const fetchData = useCallback(async (password: string, source: 'all' | 'ad' | 'organic' = 'all', per: 'today' | 'yesterday' | '7d' | 'all' = 'today') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (source !== 'all') params.set('source', source)
      params.set('period', per)
      const url = `/api/dashboard?${params.toString()}`
      const [res, leadsRes] = await Promise.all([
        fetch(url, { headers: { 'x-dashboard-password': password } }),
        fetch('/api/leads', { headers: { 'x-dashboard-password': password } }),
      ])
      if (!res.ok) return
      setData(await res.json())
      if (leadsRes.ok) setLeads(await leadsRes.json())
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('_dash_pwd')
    if (!saved) return
    setPwd(saved)
    setAuthed(true)
    fetchData(saved, 'all', 'today')
  }, [fetchData])

  function handleLogin(password: string) {
    localStorage.setItem('_dash_pwd', password)
    setPwd(password)
    setAuthed(true)
    fetchData(password, 'all', 'today')
  }

  function handleSourceChange(source: 'all' | 'ad' | 'organic') {
    setSourceFilter(source)
    fetchData(pwd, source, period)
  }

  function handlePeriodChange(p: 'today' | 'yesterday' | '7d' | 'all') {
    setPeriod(p)
    fetchData(pwd, sourceFilter, p)
  }

  useEffect(() => {
    if (!authed || !pwd) return
    const interval = setInterval(() => fetchData(pwd, sourceFilter, period), 60000)
    return () => clearInterval(interval)
  }, [authed, pwd, sourceFilter, period, fetchData])

  if (!authed) return <LoginScreen onLogin={handleLogin} />

  const STEPS_META = funnelType === 'bumbum' ? BUMBUM_STEPS_META : ORIGINAL_STEPS_META

  const steps = data?.steps ?? []
  const recent = data?.recent ?? []

  function countFor(name: string) {
    return steps.find(s => s.name === name)?.count ?? 0
  }

  const kpis = funnelType === 'bumbum'
    ? (() => {
        const landing = countFor('Bumbum_Landing')
        const quiz    = countFor('Bumbum_Quiz')
        const result  = countFor('Bumbum_Resultado')
        const vendas  = countFor('Bumbum_Vendas')
        const compra  = countFor('Compra')
        const taxa    = landing > 0 ? ((vendas / landing) * 100).toFixed(1) : '0.0'
        return [
          { label: 'Landing Page',   value: landing,        icon: '🍑', color: '#E91E8C', desc: 'entraram na landing' },
          { label: 'Fizeram o Quiz', value: quiz,           icon: '📋', color: '#f472b6', desc: landing > 0 ? `${((quiz/landing)*100).toFixed(0)}% do total` : '—' },
          { label: 'Viram Resultado',value: result,         icon: '📊', color: '#fbbf24', desc: landing > 0 ? `${((result/landing)*100).toFixed(0)}% do total` : '—' },
          { label: 'Viram a Oferta', value: vendas,         icon: '👀', color: '#22c55e', desc: landing > 0 ? `${((vendas/landing)*100).toFixed(0)}% do total` : '—' },
          { label: 'Compraram',      value: compra,         icon: '💰', color: '#f59e0b', desc: landing > 0 ? `${((compra/landing)*100).toFixed(0)}% do total` : '—' },
          { label: 'Taxa do Funil',  value: `${taxa}%`,     icon: '🏆', color: '#fb923c', desc: 'Landing → Oferta' },
        ]
      })()
    : (() => {
        const top    = countFor('Quiz')
        const tiktok = countFor('TikTok')
        const imc    = countFor('IMC')
        const diag   = countFor('Diagnostico')
        const vendas = countFor('Vendas')
        const taxaFunil     = top > 0 ? ((vendas / top) * 100).toFixed(1) : '0.0'
        const taxaInteracao = top > 0 ? ((tiktok / top) * 100).toFixed(1) : '0.0'
        return [
          { label: 'Entraram no Quiz',   value: top,             icon: '🎯', color: '#a78bfa', desc: 'total de visitantes' },
          { label: 'Chegaram ao TikTok', value: tiktok,          icon: '🎵', color: '#f472b6', desc: `${taxaInteracao}% do total` },
          { label: 'Fizeram o IMC',      value: imc,             icon: '📊', color: '#60a5fa', desc: top > 0 ? `${((imc/top)*100).toFixed(0)}% do total` : '—' },
          { label: 'Diagnóstico',        value: diag,            icon: '🔍', color: '#fbbf24', desc: top > 0 ? `${((diag/top)*100).toFixed(0)}% do total` : '—' },
          { label: 'Viram a Oferta',     value: vendas,          icon: '👀', color: '#22c55e', desc: top > 0 ? `${((vendas/top)*100).toFixed(0)}% do total` : '—' },
          { label: 'Taxa do Funil',      value: `${taxaFunil}%`, icon: '🏆', color: '#fb923c', desc: 'Quiz → Oferta' },
        ]
      })()

  return (
    <div className="min-h-screen bg-[#0D0D0D]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-md shadow-green-500/20 flex-shrink-0">
              <span className="text-base">📊</span>
            </div>
            <div>
              <h1 className="text-white font-black text-base leading-tight">Dashboard</h1>
              <p className="text-white/30 text-[11px]">Start Empoderada</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Seletor de funil */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
              <button
                onClick={() => setFunnelType('original')}
                className={`px-3 py-2 transition-all flex items-center gap-1 ${funnelType === 'original' ? 'bg-[#22C55E] text-black' : 'text-white/40 hover:text-white'}`}
              >💚 Original</button>
              <button
                onClick={() => setFunnelType('bumbum')}
                className={`px-3 py-2 transition-all flex items-center gap-1 ${funnelType === 'bumbum' ? 'bg-[#E91E8C] text-white' : 'text-white/40 hover:text-white'}`}
              >🍑 Bumbum</button>
            </div>
            {/* Filtro período */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
              {([
                { key: 'today',     label: 'Hoje' },
                { key: 'yesterday', label: 'Ontem' },
                { key: '7d',        label: '7 dias' },
                { key: 'all',       label: 'Total' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handlePeriodChange(opt.key)}
                  className={`px-3 py-2 transition-all ${
                    period === opt.key ? 'bg-[#22C55E] text-black' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filtro fonte */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
              {([
                { key: 'all',     label: 'Todos',    icon: '👥' },
                { key: 'ad',      label: 'Anúncios', icon: '📢' },
                { key: 'organic', label: 'Orgânico', icon: '🌱' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSourceChange(opt.key)}
                  className={`flex items-center gap-1 px-3 py-2 transition-all ${
                    sourceFilter === opt.key ? 'bg-[#22C55E] text-black' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/30 text-xs">
                {loading ? 'Atualizando...' : lastUpdate ? timeAgo(lastUpdate.toISOString()) : '—'}
              </span>
            </div>

            <button
              onClick={() => fetchData(pwd, sourceFilter)}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>↺</span>
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {kpis.map((k, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xl">{k.icon}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">KPI</span>
              </div>
              <div>
                <p className="font-black text-2xl sm:text-3xl" style={{ color: k.color }}>{k.value}</p>
                <p className="text-white font-semibold text-xs mt-0.5">{k.label}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{k.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1 w-fit">
          {([
            { key: 'funil',    label: '🔽 Funil' },
            { key: 'recentes', label: '⏱️ Recentes' },
            { key: 'leads',    label: `📱 Leads${leads.length > 0 ? ` (${leads.length})` : ''}` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key ? 'bg-[#22C55E] text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Funil Tab ── */}
        {activeTab === 'funil' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-bold text-sm">Funil de Conversão</h2>
              <p className="text-white/30 text-xs mt-0.5">Quantas pessoas passaram por cada etapa</p>
            </div>

            <div className="p-6 flex flex-col gap-1">
              {STEPS_META.map((meta, i) => {
                const step = steps.find(s => s.name === meta.name)
                const count = step?.count ?? 0
                const prev = i > 0 ? (steps.find(s => s.name === STEPS_META[i-1].name)?.count ?? 0) : count
                // taxa em relação ao PASSO ANTERIOR (não ao diagnóstico)
                const taxa = i === 0 ? 100 : (prev > 0 ? Math.round((count / prev) * 100) : 0)
                const topCount = steps.find(s => s.name === STEPS_META[0].name)?.count ?? 0
                const barWidth = topCount > 0 ? Math.max((count / topCount) * 100, count > 0 ? 2 : 0) : 0
                const dropped = i > 0 ? Math.max(prev - count, 0) : 0

                return (
                  <div key={meta.name}>
                    {/* Linha de drop entre etapas */}
                    {i > 0 && dropped > 0 && (
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <div className="w-6 flex-shrink-0" />
                        <div className="flex items-center gap-1.5 text-red-400/60">
                          <span className="text-xs">↘</span>
                          <span className="text-[10px]">{dropped} saíram aqui</span>
                        </div>
                      </div>
                    )}

                    {/* Etapa */}
                    <div className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/3 transition-colors">
                      {/* Ícone + label */}
                      <div className="flex items-center gap-2 w-36 flex-shrink-0">
                        <span className="text-base">{meta.emoji}</span>
                        <span className="text-white/70 text-sm font-semibold truncate">{meta.label}</span>
                      </div>

                      {/* Barra */}
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
                          }}
                        />
                      </div>

                      {/* Contagem + taxa */}
                      <div className="flex items-center gap-2 w-24 justify-end flex-shrink-0">
                        <span className="text-white font-black text-base">{count}</span>
                        {i > 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full min-w-[40px] text-center ${
                            taxa >= 70 ? 'bg-green-500/15 text-green-400'
                            : taxa >= 40 ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-red-500/15 text-red-400'
                          }`}>
                            {taxa}%
                          </span>
                        )}
                        {i === 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full min-w-[40px] text-center bg-violet-500/15 text-violet-400">
                            topo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rodapé com resumo */}
            {(() => {
              const firstStep = STEPS_META[0]
              const lastMainStep = funnelType === 'bumbum' ? STEPS_META[3] : STEPS_META[4]
              const firstCount = steps.find(s => s.name === firstStep.name)?.count ?? 0
              const lastCount  = steps.find(s => s.name === lastMainStep.name)?.count ?? 0
              const taxa = firstCount > 0 ? ((lastCount / firstCount) * 100).toFixed(1) : '0.0'
              const label = funnelType === 'bumbum' ? 'Landing → Oferta' : 'Quiz → Oferta'
              return (
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-white/30 text-xs">Taxa geral do funil ({label})</p>
                  <p className="font-black text-lg" style={{ color: '#22c55e' }}>{taxa}%</p>
                </div>
              )
            })()}
          </div>
        )}

        {/* ── Recentes Tab ── */}
        {activeTab === 'recentes' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">Últimas Entradas</h2>
                <p className="text-white/30 text-xs mt-0.5">Eventos mais recentes do funil</p>
              </div>
              <span className="text-white/20 text-xs bg-white/5 px-3 py-1 rounded-full">{recent.length} eventos</span>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📭</span>
                <p className="text-white/30 text-sm">Nenhum evento registrado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recent.map((ev, i) => {
                  const meta = STEPS_META.find(s => s.name === ev.step_name)
                  return (
                    <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                          style={{ background: `${meta?.color ?? '#ffffff'}15`, border: `1px solid ${meta?.color ?? '#ffffff'}25` }}
                        >
                          {meta?.emoji ?? '📍'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{meta?.label ?? ev.step_name}</p>
                          <p className="text-white/25 text-[10px] font-mono">#{ev.session_id.substring(0, 10)}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.source === 'ad' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-white/30'
                        }`}>
                          {ev.source === 'ad' ? '📢 Anúncio' : '🌱 Orgânico'}
                        </span>
                        <p className="text-white/40 text-xs">{timeAgo(ev.created_at)}</p>
                        <p className="text-white/20 text-[10px]">{formatTime(ev.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Leads Tab ── */}
        {activeTab === 'leads' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">Leads Capturados</h2>
                <p className="text-white/30 text-xs mt-0.5">WhatsApp coletados pelo popup de saída</p>
              </div>
              <span className="text-white/20 text-xs bg-white/5 px-3 py-1 rounded-full">{leads.length} leads</span>
            </div>

            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📭</span>
                <p className="text-white/30 text-sm">Nenhum lead capturado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leads.map((lead, i) => (
                  <div key={lead.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base bg-green-500/10 border border-green-500/20">
                        📱
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{lead.phone}</p>
                        <p className="text-white/25 text-[10px]">Lead #{i + 1}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-white/40 text-xs">{timeAgo(lead.created_at)}</p>
                      <p className="text-white/20 text-[10px]">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-white/15 text-xs text-center pb-4">↺ Atualiza automaticamente a cada 60 segundos</p>
      </main>
    </div>
  )
}
