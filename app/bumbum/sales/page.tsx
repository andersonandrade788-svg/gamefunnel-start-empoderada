'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useRef } from 'react'
import { trackStep } from '@/lib/analytics'
import { initiateCheckout } from '@/lib/pixel'

const CHECKOUT_URL = 'https://pay.cakto.com.br/orhu3er_850513'

// ─── Spin Wheel ───────────────────────────────────────────────────────────────

const SEGMENTS = [
  { label: 'R$97',  color: '#7D0B4E', textColor: '#FFD700' }, // 0: 0°-45°
  { label: 'R$57!', color: '#C2185B', textColor: '#FFFFFF' }, // 1: 45°-90°
  { label: 'R$127', color: '#5A0035', textColor: '#FFD700' }, // 2: 90°-135°
  { label: 'R$197', color: '#9C0D63', textColor: '#FF8C00' }, // 3: 135°-180°
  { label: 'R$57!', color: '#C2185B', textColor: '#FFFFFF' }, // 4: 180°-225°
  { label: 'R$97',  color: '#7D0B4E', textColor: '#FFD700' }, // 5: 225°-270°
  { label: 'R$57!', color: '#FFD700', textColor: '#000000' }, // 6: 270°-315° ← WINNER
  { label: 'R$127', color: '#5A0035', textColor: '#FFD700' }, // 7: 315°-360°
]

// Segment 6 center is at 270° + 22.5° = 292.5° from top (clockwise).
// To bring it to the pointer (top=0°): rotate (360 - 292.5) = 67.5° + 5 full turns.
const FINAL_ROTATION = 5 * 360 + 67.5

// Boundary points at each 45° on circle r=140, cx=cy=150
// (x, y) = (150 + 140*sin(k*45°), 150 - 140*cos(k*45°))
const BOUNDARY_PTS: [number, number][] = [
  [150,      10],       // 0°
  [248.99,   51.01],    // 45°
  [290,      150],      // 90°
  [248.99,   248.99],   // 135°
  [150,      290],      // 180°
  [51.01,    248.99],   // 225°
  [10,       150],      // 270°
  [51.01,    51.01],    // 315°
]

function segPath(i: number) {
  const [x1, y1] = BOUNDARY_PTS[i]
  const [x2, y2] = BOUNDARY_PTS[(i + 1) % 8]
  return `M150,150 L${x1},${y1} A140,140,0,0,1,${x2},${y2} Z`
}

function segTextPos(i: number) {
  const deg = i * 45 + 22.5
  const rad = (deg * Math.PI) / 180
  return { x: 150 + 88 * Math.sin(rad), y: 150 - 88 * Math.cos(rad), deg }
}

function playSpinSounds() {
  try {
    // @ts-ignore
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const n = 30
    for (let i = 0; i < n; i++) {
      // Exponential clustering: many ticks at start (fast), few at end (slow)
      const t = 4.0 * Math.pow(i / n, 1.8)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 600 + ((i * 137) % 400)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.04)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.04)
    }
  } catch (_) {}
}

function playVictorySound() {
  try {
    // @ts-ignore
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    // Ascending victory melody
    const melody = [523, 659, 784, 1047, 1319]
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.13
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.start(t)
      osc.stop(t + 0.5)
    })
    // Coin rain sounds
    for (let i = 0; i < 10; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = 900 + ((i * 173) % 700)
      const t = ctx.currentTime + 0.7 + i * 0.07
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      osc.start(t)
      osc.stop(t + 0.08)
    }
  } catch (_) {}
}

// Pre-generated confetti (deterministic, no Math.random at render)
const CONFETTI_COLORS = ['#E91E8C', '#FFD700', '#FFFFFF', '#FF69B4', '#FFA500']
const CONFETTI = Array.from({ length: 40 }, (_, i) => {
  const seed = i * 13.7
  return {
    id: i,
    x: (seed * 7.3) % 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i * 0.047) % 0.9,
    size: 6 + (i * 0.43) % 8,
    isCircle: i % 3 !== 0,
    duration: 1.4 + (i * 0.03) % 0.8,
  }
})

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Funciona para quem nunca treinou?',
    a: 'Sim! O protocolo tem versão para iniciantes completas. Você recebe treinos adaptados ao seu nível, começando do zero com exercícios simples e progredindo no ritmo certo.',
  },
  {
    q: 'Precisa de academia ou equipamento?',
    a: 'Não! O método funciona em casa, sem equipamento. Se tiver elástico ou haltere, ainda melhor — mas não é obrigatório.',
  },
  {
    q: 'Em quanto tempo vejo resultado?',
    a: 'A maioria das alunas sente diferença na firmeza entre 7 e 10 dias. Resultado visual mais evidente aparece entre a 2ª e 3ª semana seguindo o protocolo.',
  },
  {
    q: 'Como funciona o cancelamento?',
    a: 'Cancele quando quiser, sem burocracia. Basta enviar uma mensagem para o suporte e cancelamos na hora, sem perguntas.',
  },
]

const PROFILE_LABELS: Record<string, string> = {
  iniciante: 'Iniciante Determinada',
  intermediario: 'Guerreira Estagnada',
  avancado: 'Atleta de Alta Performance',
}

// ─── Main component ───────────────────────────────────────────────────────────

function BumbumSalesInner() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(900)
  const [showExit, setShowExit] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [buyers, setBuyers] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const exitTriggered = useRef(false)
  const priceRef = useRef<HTMLDivElement>(null)

  // Spin wheel
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'won' | 'done'>('idle')
  const [wheelRotation, setWheelRotation] = useState(0)

  const perfil = searchParams.get('perfil') ?? 'intermediario'
  const profileLabel = PROFILE_LABELS[perfil] ?? PROFILE_LABELS.intermediario

  useEffect(() => {
    trackStep('Bumbum_Vendas', 4)
    setViewers(Math.floor(Math.random() * 30) + 40)
    setBuyers(Math.floor(Math.random() * 12) + 18)
    const iv = setInterval(() => {
      setViewers(v => Math.max(30, v + Math.floor(Math.random() * 5) - 2))
      if (Math.random() > 0.7) setBuyers(v => v + 1)
    }, 6000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (spinPhase !== 'done') return
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 10 && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    function handleVisibility() {
      if (document.visibilityState === 'hidden' && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    let lastY = window.scrollY
    let lastTime = Date.now()
    function handleScroll() {
      const now = Date.now()
      const dy = window.scrollY - lastY
      const dt = now - lastTime
      if (dy < -60 && dt < 200 && window.scrollY < 200 && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
      lastY = window.scrollY
      lastTime = now
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [spinPhase])

  function spinWheel() {
    if (spinPhase !== 'idle') return
    setSpinPhase('spinning')
    setWheelRotation(FINAL_ROTATION)
    playSpinSounds()
    setTimeout(() => {
      setSpinPhase('won')
      playVictorySound()
    }, 4300)
  }

  function claimPrize() {
    setSpinPhase('done')
    setTimeout(() => {
      priceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function handleCheckout() {
    initiateCheckout()
    const params = searchParams.toString()
    const url = params ? `${CHECKOUT_URL}?${params}` : CHECKOUT_URL
    window.location.href = url
  }

  return (
    <div className="bumbum-page" style={{ background: '#0D0005' }}>

      {/* ── Spin Wheel Overlay ─────────────────────────────────────────────── */}
      {spinPhase !== 'done' && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-5"
          style={{ background: 'rgba(5, 0, 18, 0.97)', overflowY: 'auto' }}
        >
          {/* Confetti particles */}
          {spinPhase === 'won' && CONFETTI.map(p => (
            <div
              key={p.id}
              className="pointer-events-none fixed"
              style={{
                left: `${p.x}%`,
                top: '-12px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
                animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
                zIndex: 65,
              }}
            />
          ))}

          <div className="w-full max-w-xs flex flex-col items-center gap-5 py-8">

            {/* Title */}
            <div className="text-center">
              <h2 className="text-white font-black text-xl leading-tight">
                🎰 GIRE E GANHE{' '}
                <span style={{ color: '#FFD700' }}>SEU DESCONTO!</span>
              </h2>
              <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                Exclusivo para quem completou o diagnóstico 🍑
              </p>
            </div>

            {/* Wheel container */}
            <div className="relative flex items-center justify-center" style={{ width: 284, height: 284 }}>

              {/* Pointer triangle (fixed, pointing down at top of wheel) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 z-10"
                style={{ top: -8 }}
              >
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '13px solid transparent',
                  borderRight: '13px solid transparent',
                  borderTop: '26px solid #FFD700',
                  filter: 'drop-shadow(0 2px 6px rgba(255,215,0,0.7))',
                }} />
              </div>

              {/* Spinning SVG wheel */}
              <div
                style={{
                  width: 280,
                  height: 280,
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinPhase === 'spinning'
                    ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                    : 'none',
                  transformOrigin: 'center center',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 4px #FFD700, 0 0 40px rgba(233,30,140,0.5)',
                  willChange: 'transform',
                }}
              >
                <svg viewBox="0 0 300 300" width={280} height={280}>
                  {/* Pie segments */}
                  {SEGMENTS.map((seg, i) => (
                    <path
                      key={i}
                      d={segPath(i)}
                      fill={seg.color}
                      stroke="#0D0005"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Segment labels */}
                  {SEGMENTS.map((seg, i) => {
                    const { x, y, deg } = segTextPos(i)
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={seg.textColor}
                        fontSize={i === 6 ? '12' : '11'}
                        fontWeight="bold"
                        fontFamily="Inter, sans-serif"
                        transform={`rotate(${deg}, ${x}, ${y})`}
                      >
                        {seg.label}
                      </text>
                    )
                  })}

                  {/* Center hub */}
                  <circle cx="150" cy="150" r="24" fill="#0D0005" stroke="#FFD700" strokeWidth="3" />
                  <text
                    x="150" y="154"
                    textAnchor="middle"
                    fill="#FFD700"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                    letterSpacing="0.5"
                  >
                    GEO
                  </text>
                </svg>
              </div>
            </div>

            {/* Action area */}
            {spinPhase === 'idle' && (
              <div className="w-full flex flex-col items-center gap-2">
                <button
                  onClick={spinWheel}
                  style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                  className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 animate-pulse"
                >
                  🎯 GIRAR AGORA
                </button>
                <p className="text-white/25 text-xs text-center">Gire a roleta e desbloqueie seu preço</p>
              </div>
            )}

            {spinPhase === 'spinning' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60 text-sm font-bold animate-pulse">Girando... boa sorte! 🍀</p>
              </div>
            )}

            {spinPhase === 'won' && (
              <div className="flex flex-col items-center gap-3 w-full animate-scaleIn">
                {/* Win card */}
                <div
                  style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #FFD700' }}
                  className="rounded-2xl p-4 text-center w-full"
                >
                  <p className="text-4xl mb-1">🎉</p>
                  <p style={{ color: '#FFD700' }} className="font-black text-xl leading-tight">VOCÊ GANHOU!</p>
                  <p className="text-white/60 text-xs mt-1 mb-3">Desconto exclusivo desbloqueado:</p>
                  <div className="flex items-end justify-center gap-1.5">
                    <span className="text-white/40 text-sm line-through self-center">R$197</span>
                    <span style={{ color: '#FFD700' }} className="font-black text-5xl leading-none">R$57</span>
                    <span style={{ color: '#FFD700' }} className="font-black text-2xl leading-none mb-0.5">,00</span>
                  </div>
                </div>

                {/* Claim button */}
                <button
                  onClick={claimPrize}
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  className="w-full text-black font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
                >
                  🏆 RESGATAR MEU DESCONTO
                </button>
                <p className="text-white/30 text-xs text-center">
                  🔒 Oferta válida somente agora
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Exit popup ─────────────────────────────────────────────────────── */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div style={{ background: '#1A0010', border: '2px solid #E91E8C' }} className="rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4">
            <button onClick={() => setShowExit(false)} className="self-end text-white/40 text-xl font-bold leading-none">✕</button>
            <div className="text-center flex flex-col gap-3">
              <span className="text-5xl">🍑</span>
              <h3 className="text-white font-black text-xl leading-tight">Espera! Oferta especial só para você</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Porque você fez o diagnóstico, temos um desconto exclusivo reservado.
              </p>
              <div style={{ background: '#E91E8C15', border: '1px solid #E91E8C50' }} className="rounded-2xl p-4 flex flex-col gap-1">
                <p className="text-white/40 text-xs line-through">De R$197,00</p>
                <p style={{ color: '#FFD700' }} className="font-black text-4xl leading-none">R$57,00</p>
                <p className="text-white/40 text-xs">primeiro mês · cancele quando quiser</p>
              </div>
              <button
                onClick={handleCheckout}
                style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                className="w-full text-white font-black text-base py-4 rounded-2xl active:scale-95 transition-all"
              >
                🔥 QUERO COM DESCONTO AGORA
              </button>
              <button onClick={() => setShowExit(false)} className="text-white/25 text-xs">
                Não, prefiro perder essa chance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Urgency bar ────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg, #E91E8C, #C2185B)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Oferta especial expira em {mins}:{secs} — Vagas limitadas
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Header */}
        <div className="pt-6 pb-4 text-center flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-white/40 text-xs">{viewers} vendo agora</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🛒</span>
              <span className="text-white/40 text-xs">{buyers} compraram hoje</span>
            </div>
          </div>

          <span className="text-5xl">🍑</span>
          <div>
            <p style={{ color: '#E91E8C' }} className="font-black text-xs uppercase tracking-wide">Protocolo para {profileLabel}</p>
            <h1 className="text-white font-black text-2xl leading-tight mt-1">
              Desafio do <span style={{ color: '#FFD700' }}>Bumbum Turbinado</span> em 4 Semanas
            </h1>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            O método completo da Geo com treinos específicos para o seu perfil — em casa ou na academia.
          </p>
        </div>

        {/* Mentor authority block */}
        <div className="mb-5 flex flex-col gap-4">

          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider text-center">
            👩‍💼 Quem vai te guiar nessa jornada?
          </p>

          {/* Phone mockup with Instagram post */}
          <div className="flex justify-center">
            {/* Phone outer frame */}
            <div
              style={{
                width: 220,
                background: '#111',
                borderRadius: 32,
                padding: '10px 8px',
                boxShadow: '0 0 0 2px #333, 0 0 0 4px #1a1a1a, 0 20px 60px rgba(233,30,140,0.25)',
              }}
            >
              {/* Notch */}
              <div className="flex justify-center mb-1.5">
                <div style={{ width: 56, height: 6, background: '#222', borderRadius: 4 }} />
              </div>

              {/* Instagram post screen */}
              <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden' }}>

                {/* IG top bar */}
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #E91E8C', flexShrink: 0 }}>
                    <img src="/mentora.jpg" alt="Geovana" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#000', lineHeight: 1 }}>geovanabueno</span>
                      {/* IG verified */}
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#3897F0"/>
                        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 8, color: '#888', lineHeight: 1 }}>Personal Trainer</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#000', fontWeight: 900, lineHeight: 1 }}>···</span>
                </div>

                {/* Photo */}
                <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', background: '#f0f0f0' }}>
                  <img
                    src="/mentora.jpg"
                    alt="Geovana Bueno"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* IG action bar */}
                <div className="px-2.5 pt-2 pb-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {/* Heart */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {/* Comment */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {/* Share */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#000' }}>2.341 curtidas</span>
                  <div>
                    <span style={{ fontSize: 8, fontWeight: 800, color: '#000' }}>geovanabueno </span>
                    <span style={{ fontSize: 8, color: '#333' }}>Personal Trainer 🍑 Emagrecimento feminino</span>
                  </div>
                </div>

                {/* Home bar */}
                <div className="flex justify-center py-1.5">
                  <div style={{ width: 40, height: 3, background: '#000', borderRadius: 2, opacity: 0.15 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bio card beside/below phone */}
          <div
            style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '1px solid #E91E8C40' }}
            className="rounded-2xl p-4 flex flex-col gap-3"
          >
            {/* Stats */}
            <div className="flex items-center justify-around">
              {[
                { value: '15+', label: 'Anos de exp.' },
                { value: '3.200+', label: 'Alunas' },
                { value: '4 sem.', label: 'Resultado' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span style={{ color: '#FFD700' }} className="font-black text-lg leading-none">{s.value}</span>
                  <span className="text-white/40 text-[10px] text-center">{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: '#E91E8C20' }} />

            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm leading-relaxed">
                Personal Trainer especializada em emagrecimento feminino, com{' '}
                <span className="text-white font-bold">mais de 15 anos de experiência</span>{' '}
                transformando o corpo e a autoestima de mulheres — especialmente acima dos 30 anos.
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                Criadora de um método estratégico e prático, já ajudou{' '}
                <span className="text-white font-bold">milhares de alunas</span>{' '}
                a conquistarem resultados reais com treinos simples e adaptáveis à rotina.
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                No Desafio Bumbum Turbinado, ela entrega um{' '}
                <span style={{ color: '#E91E8C' }} className="font-bold">passo a passo direto</span>{' '}
                para glúteos mais firmes e volumosos — mesmo começando do zero.
              </p>
            </div>
          </div>
        </div>

        {/* Price block (scroll target) */}
        <div
          ref={priceRef}
          style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #E91E8C' }}
          className="rounded-3xl p-5 mb-5 text-center flex flex-col gap-3"
        >
          <p style={{ color: '#FFD700' }} className="font-black text-xs uppercase tracking-wider">🔥 Oferta especial por diagnóstico</p>

          <div className="flex flex-col items-center gap-0.5">
            <p className="text-white/40 text-sm line-through">De R$197,00</p>
            <p className="text-white/60 text-sm">Por apenas</p>
            <div className="flex items-end gap-1">
              <p style={{ color: '#FFD700' }} className="font-black text-5xl leading-none">R$57</p>
              <p style={{ color: '#FFD700' }} className="font-black text-xl leading-none mb-1">,00</p>
            </div>
            <p className="text-white/40 text-xs">no primeiro mês · cancele quando quiser</p>
          </div>

          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 QUERO COMEÇAR AGORA
          </button>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['💳 Cartão', '📱 Pix', '🔒 SSL Seguro'].map((s, i) => (
              <span key={i} className="text-white/30 text-[10px] font-bold">{s}</span>
            ))}
          </div>
        </div>

        {/* Included items */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider">✨ O que você recebe:</p>
          {[
            { icon: '📱', title: 'Protocolo de 4 Semanas', desc: 'Treinos diários com vídeos explicativos, passo a passo para o seu nível' },
            { icon: '🍑', title: 'Método Geo de Ativação Glútea', desc: 'A técnica exclusiva que faz o bumbum crescer de verdade, sem truques' },
            { icon: '🏠', title: 'Casa ou Academia', desc: 'Adaptações para qualquer ambiente — com ou sem equipamento' },
            { icon: '📊', title: 'Treino para Seu Perfil', desc: `Protocolo específico para ${profileLabel} — não é genérico, é feito para você` },
            { icon: '💬', title: 'Suporte no Grupo VIP', desc: 'Comunidade exclusiva com outras alunas + acompanhamento direto' },
            { icon: '🎯', title: 'Plano de Alimentação', desc: 'Guia nutricional para potencializar o crescimento muscular' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-xl p-3 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-white font-black text-sm">{item.title}</p>
                <p className="text-white/50 text-xs leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm text-center">RESULTADOS REAIS DAS NOSSAS ALUNAS:</p>

          <div className="-mx-5 relative">
            <div
              className="flex gap-3 overflow-x-auto px-5 pb-2"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {['/dep-a.jpg', '/dep-b.jpg'].map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl overflow-hidden"
                  style={{
                    width: 'calc(85vw - 20px)',
                    maxWidth: '340px',
                    scrollSnapAlign: 'center',
                    border: '1px solid #E91E8C40',
                    background: '#1A0010',
                  }}
                >
                  <img
                    src={src}
                    alt={`Resultado aluna ${i + 1}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Swipe hint hand */}
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ animation: 'swipe-hint 1.2s ease-in-out infinite' }}
            >
              <div className="text-3xl" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>👉</div>
            </div>
          </div>

          <div className="flex justify-center gap-1.5">
            {[0, 1].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#E91E8C' : '#E91E8C30' }} />
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ background: '#1A0010', border: '1px solid #FFD70030' }} className="rounded-2xl p-4 flex items-center gap-3 mb-6">
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-white font-black text-sm">+3.200 mulheres transformadas</p>
            <p className="text-white/40 text-xs">já seguiram o protocolo e mudaram o corpo</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="flex flex-col gap-2 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider mb-1">❓ Perguntas frequentes</p>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{ background: '#1A0010', border: `1px solid ${openFaq === i ? '#E91E8C60' : '#E91E8C20'}` }}
              className="rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-4 py-4 flex items-center justify-between gap-3"
              >
                <span className="text-white font-bold text-sm leading-snug">{item.q}</span>
                <span
                  className="font-black text-lg flex-shrink-0 transition-transform duration-200"
                  style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', color: '#E91E8C' }}
                >+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #FFD70060' }} className="rounded-2xl p-4 mb-5 flex items-center gap-4">
          <span className="text-5xl flex-shrink-0">🛡️</span>
          <div>
            <p style={{ color: '#FFD700' }} className="font-black text-sm">Garantia Total de 7 Dias</p>
            <p className="text-white/60 text-xs leading-relaxed mt-1">
              Se em 7 dias você não estiver satisfeita, devolvemos <strong className="text-white">100% do seu dinheiro</strong>. Sem perguntas, sem burocracia.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 GARANTIR MINHA VAGA POR R$57
          </button>
          <p className="text-white/30 text-xs text-center">
            ⏰ Expira em {mins}:{secs} · 🔒 Pagamento seguro · Cancele quando quiser
          </p>
        </div>

      </div>
    </div>
  )
}

export default function BumbumSales() {
  return (
    <Suspense>
      <BumbumSalesInner />
    </Suspense>
  )
}
