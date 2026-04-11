'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import StatusBar from '@/components/StatusBar'
import { initiateCheckout } from '@/lib/pixel'
import { trackStep } from '@/lib/analytics'

// ── Roleta ─────────────────────────────────────────────────────────────────────
const SEGMENTS = [
  { lines: ['Acesso', 'VIP'],     color: '#6D28D9', colorLight: '#A78BFA' },
  { lines: ['R$ 20', 'off'],      color: '#0369A1', colorLight: '#38BDF8' },
  { lines: ['Bônus', 'Surpresa'], color: '#B45309', colorLight: '#FCD34D' },
  { lines: ['1º mês', 'R$ 37'],  color: '#15803D', colorLight: '#4ADE80', prize: true },
  { lines: ['Consul-', 'toria'],  color: '#DC2626', colorLight: '#F87171' },
  { lines: ['Material', 'VIP'],   color: '#5B21B6', colorLight: '#C4B5FD' },
  { lines: ['R$ 10', 'off'],      color: '#0E7490', colorLight: '#67E8F9' },
  { lines: ['Bônus', 'Extra'],    color: '#C2410C', colorLight: '#FB923C' },
]
const FINAL_ROTATION = 2002.5
function toRad(deg: number) { return deg * Math.PI / 180 }
function segPath(i: number) {
  const cx = 150, cy = 150, r = 130
  const s = i * 45, e = (i + 1) * 45
  const x1 = cx + r * Math.sin(toRad(s)), y1 = cy - r * Math.cos(toRad(s))
  const x2 = cx + r * Math.sin(toRad(e)), y2 = cy - r * Math.cos(toRad(e))
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}
function textPos(i: number) {
  const cx = 150, cy = 150, r = 82, mid = (i + 0.5) * 45
  return { x: cx + r * Math.sin(toRad(mid)), y: cy - r * Math.cos(toRad(mid)), rotation: mid }
}

function playCashRegister() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()

    // "Ding" metálico da caixa registradora
    const bell = ctx.createOscillator()
    const bellGain = ctx.createGain()
    bell.connect(bellGain); bellGain.connect(ctx.destination)
    bell.type = 'sine'
    bell.frequency.setValueAtTime(1400, ctx.currentTime)
    bell.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3)
    bellGain.gain.setValueAtTime(0.5, ctx.currentTime)
    bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    bell.start(); bell.stop(ctx.currentTime + 0.8)

    // "Ka-ching" — nota grave mecânica
    const kaching = ctx.createOscillator()
    const kGain = ctx.createGain()
    kaching.connect(kGain); kGain.connect(ctx.destination)
    kaching.type = 'square'
    kaching.frequency.setValueAtTime(180, ctx.currentTime + 0.05)
    kaching.frequency.setValueAtTime(220, ctx.currentTime + 0.09)
    kaching.frequency.setValueAtTime(160, ctx.currentTime + 0.13)
    kGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.05)
    kGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    kaching.start(ctx.currentTime + 0.05)
    kaching.stop(ctx.currentTime + 0.35)

    // Fanfarra celebratória em seguida
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + 0.4 + i * 0.14
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.38, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t); osc.stop(t + 0.45)
    })
  } catch (_) {}
}

const CONFETTI_COLORS_R = ['#22C55E','#FACC15','#F87171','#60A5FA','#A78BFA','#FB923C','#34D399','#FDE68A']
const roletaConfetti = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS_R[i % CONFETTI_COLORS_R.length],
  left: Math.random() * 100,
  delay: Math.random() * 1.5,
  duration: 2 + Math.random() * 2,
  size: 7 + Math.random() * 9,
  isCircle: Math.random() > 0.5,
}))

function Roleta({ onClaim }: { onClaim: () => void }) {
  const [spun, setSpun] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  function getAudioCtx(): AudioContext | null {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
      return audioCtxRef.current
    } catch (_) { return null }
  }

  function playTickCtx(ctx: AudioContext) {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(900, ctx.currentTime)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.start(); osc.stop(ctx.currentTime + 0.06)
    } catch (_) {}
  }

  function playCashCtx(ctx: AudioContext) {
    try {
      const bell = ctx.createOscillator()
      const bellGain = ctx.createGain()
      bell.connect(bellGain); bellGain.connect(ctx.destination)
      bell.type = 'sine'
      bell.frequency.setValueAtTime(1400, ctx.currentTime)
      bell.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3)
      bellGain.gain.setValueAtTime(0.5, ctx.currentTime)
      bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      bell.start(); bell.stop(ctx.currentTime + 0.8)

      const kaching = ctx.createOscillator()
      const kGain = ctx.createGain()
      kaching.connect(kGain); kGain.connect(ctx.destination)
      kaching.type = 'square'
      kaching.frequency.setValueAtTime(180, ctx.currentTime + 0.05)
      kaching.frequency.setValueAtTime(220, ctx.currentTime + 0.09)
      kaching.frequency.setValueAtTime(160, ctx.currentTime + 0.13)
      kGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.05)
      kGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      kaching.start(ctx.currentTime + 0.05)
      kaching.stop(ctx.currentTime + 0.35)

      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        const t = ctx.currentTime + 0.4 + i * 0.14
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.38, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.start(t); osc.stop(t + 0.45)
      })
    } catch (_) {}
  }

  function handleSpin() {
    if (spinning || spun) return

    // Cria AudioContext no momento do clique (exigido pelo browser/iOS)
    const ctx = getAudioCtx()
    setSpinning(true)

    let count = 0
    const maxTicks = 38
    function tick() {
      if (count >= maxTicks) return
      if (ctx) playTickCtx(ctx)
      count++
      const delay = 70 + (count / maxTicks) * 380
      tickRef.current = setTimeout(tick, delay)
    }
    tick()

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4.5s cubic-bezier(0.17, 0.67, 0.08, 0.99)'
      wheelRef.current.style.transform = `rotate(${FINAL_ROTATION}deg)`
    }
    setTimeout(() => {
      setSpinning(false); setSpun(true)
      if (ctx) playCashCtx(ctx)
      setShowConfetti(true)
      setTimeout(() => setWon(true), 600)
    }, 4500)
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <style>{`
        @keyframes wheel-idle {
          0%, 100% { box-shadow: 0 0 24px #facc1550, 0 0 48px #facc1520; }
          50%       { box-shadow: 0 0 36px #facc1570, 0 0 64px #facc1530; }
        }
        @keyframes prize-reveal {
          0%   { opacity: 0; transform: scale(0.85) translateY(8px); }
          60%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(300%) rotate(25deg); }
        }
        .wheel-idle   { animation: wheel-idle 2.5s ease-in-out infinite; }
        .prize-reveal { animation: prize-reveal 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .shimmer-bar  { animation: shimmer 2.5s ease-in-out infinite; }
        @keyframes confetti-r {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confete da roleta */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {roletaConfetti.map(p => (
            <div key={p.id} style={{
              position: 'absolute', top: '-10px', left: `${p.left}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
              animation: `confetti-r ${p.duration}s ${p.delay}s ease-in forwards`,
            }} />
          ))}
        </div>
      )}

      {!won ? (
        <>
          {/* Roda */}
          <div className={`relative flex items-center justify-center ${!spinning ? 'wheel-idle' : ''}`}
            style={{ padding: 20, borderRadius: '50%' }}>

            {/* Ponteiro */}
            <div className="absolute z-30" style={{ top: 6, left: '50%', transform: 'translateX(-50%)' }}>
              <svg width="26" height="38" viewBox="0 0 26 38">
                <defs>
                  <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                <path d="M 13 36 L 1 5 Q 13 0 25 5 Z" fill="url(#ptr)" />
                <path d="M 13 36 L 1 5 Q 13 0 25 5 Z" fill="none" stroke="#78350F" strokeWidth="1.2" />
                <circle cx="13" cy="6" r="3" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
              </svg>
            </div>

            {/* Anel externo dourado */}
            <div className="rounded-full p-[3px]" style={{
              background: 'conic-gradient(from 0deg, #FACC15, #B45309, #FDE68A, #F59E0B, #FACC15)',
              boxShadow: '0 0 0 2px #78350F'
            }}>
              <div className="w-[272px] h-[272px] rounded-full overflow-hidden" style={{
                boxShadow: 'inset 0 0 20px #00000060'
              }}>
                <div ref={wheelRef} className="w-full h-full" style={{ willChange: 'transform' }}>
                  <svg viewBox="0 0 300 300" width="272" height="272">
                    <defs>
                      {SEGMENTS.map((seg, i) => (
                        <linearGradient key={i} id={`sg${i}`} x1="0.2" y1="0.2" x2="1" y2="1">
                          <stop offset="0%" stopColor={seg.colorLight} />
                          <stop offset="100%" stopColor={seg.color} />
                        </linearGradient>
                      ))}
                      <radialGradient id="shine" cx="38%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {SEGMENTS.map((seg, i) => {
                      const tp = textPos(i)
                      return (
                        <g key={i}>
                          <path d={segPath(i)} fill={`url(#sg${i})`} stroke="#00000025" strokeWidth="1.5" />
                          {seg.prize && <path d={segPath(i)} fill="#ffffff" opacity="0.1" />}
                          <text x={tp.x} y={tp.y} fill="#fff" fontSize={seg.prize ? "11" : "9.5"} fontWeight="900"
                            textAnchor="middle" dominantBaseline="middle"
                            transform={`rotate(${tp.rotation}, ${tp.x}, ${tp.y})`}>
                            {seg.lines.map((line, li) => (
                              <tspan key={li} x={tp.x} dy={li === 0 ? '-7' : '14'}>{line}</tspan>
                            ))}
                          </text>
                        </g>
                      )
                    })}

                    {/* Shine overlay */}
                    <circle cx="150" cy="150" r="130" fill="url(#shine)" />

                    {/* Linhas separadoras */}
                    {SEGMENTS.map((_, i) => {
                      const a = i * 45
                      return <line key={i} x1="150" y1="150"
                        x2={150 + 130 * Math.sin(toRad(a))} y2={150 - 130 * Math.cos(toRad(a))}
                        stroke="#00000030" strokeWidth="1.5" />
                    })}

                    {/* Hub central */}
                    <circle cx="150" cy="150" r="24" fill="#111" stroke="#FACC15" strokeWidth="3" />
                    <circle cx="150" cy="150" r="17" fill="#1a1a1a" />
                    <circle cx="150" cy="150" r="11" fill="#FACC15" opacity="0.95" />
                    <text x="150" y="151" textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#111" fontWeight="900">★</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning || spun}
            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 relative overflow-hidden"
            style={(!spinning && !spun) ? {
              background: 'linear-gradient(135deg, #FDE68A 0%, #FACC15 45%, #D97706 100%)',
              boxShadow: '0 4px 24px #FACC1550, inset 0 1px 0 #ffffff50',
              color: '#1a1a1a',
            } : { background: '#ffffff10', color: '#ffffff30' }}
          >
            {(!spinning && !spun) && (
              <div className="shimmer-bar absolute inset-0 w-1/3" style={{
                background: 'linear-gradient(90deg, transparent, #ffffff30, transparent)',
              }} />
            )}
            <span className="relative z-10">
              {spinning ? '⟳ Girando...' : spun ? 'Aguarde...' : '🎰 GIRAR A ROLETA'}
            </span>
          </button>

          <p className="text-white/30 text-xs text-center">Gire e descubra sua recompensa exclusiva</p>
        </>
      ) : (
        <div className="w-full flex flex-col gap-4 prize-reveal">
          <div className="relative overflow-hidden rounded-2xl" style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #052e16 100%)',
            border: '2px solid #22C55E60',
            boxShadow: '0 0 32px #22C55E25, inset 0 1px 0 #22C55E30',
          }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, #22C55E, transparent)'
            }} />
            <div className="p-6 text-center flex flex-col gap-2">
              <div className="text-5xl">🎉</div>
              <p className="text-[#4ADE80] font-black text-xs uppercase tracking-widest">Parabéns! Você ganhou!</p>
              <p className="text-white/70 font-semibold text-sm">1º mês do Start Empoderada por apenas</p>
              <div className="flex items-end justify-center gap-1 my-1">
                <span className="text-white/50 text-xl font-bold self-start mt-3">R$</span>
                <span className="font-black leading-none" style={{ fontSize: 72, color: '#4ADE80', lineHeight: 1 }}>37<span style={{ fontSize: 36 }}>,00</span></span>
              </div>
              <p className="text-white/40 text-xs">depois R$ 67,00/mês · cancele quando quiser</p>
            </div>
          </div>

          <button
            onClick={onClaim}
            className="w-full font-black text-lg py-5 rounded-2xl transition-all active:scale-95 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              boxShadow: '0 4px 28px #22C55E50, inset 0 1px 0 #ffffff25',
              color: 'white',
            }}
          >
            GARANTIR MEU DESCONTO →
          </button>
          <p className="text-white/30 text-[10px] text-center">🔓 Cancele quando quiser · sem multa</p>
        </div>
      )}
    </div>
  )
}

const FAQS = [
  {
    q: 'Quanto tempo leva pra ver resultado?',
    a: 'A maioria das alunas relata sentir diferença já nas primeiras 2 semanas. Resultados visíveis no corpo geralmente aparecem entre 30 e 60 dias seguindo o método.',
  },
  {
    q: 'Preciso de equipamentos ou academia?',
    a: 'Não. Temos treinos completos para fazer em casa, sem equipamentos. Também temos versões para academia, você escolhe o que funciona melhor pra sua rotina.',
  },
  {
    q: 'Funciona pra qualquer idade?',
    a: 'Sim. O programa foi desenvolvido para mulheres de todas as idades e níveis. Os treinos são adaptáveis e o acompanhamento é personalizado.',
  },
  {
    q: 'E se eu não conseguir seguir?',
    a: 'É exatamente pra isso que existe o acompanhamento e a comunidade. Você nunca vai estar sozinha. Quando travar, tem alguém pra te apoiar e te colocar de volta nos trilhos.',
  },
  {
    q: 'Tem garantia?',
    a: 'Sim. 7 dias de garantia incondicional. Se por qualquer motivo você não gostar, devolvemos 100% do seu dinheiro sem perguntas.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Vandeilma',
    result: 'Perdeu 14kg em 90 dias',
    text: 'Nunca imaginei que conseguiria. Tentei de tudo antes e nada funcionava. Com o método da Giovanna foi diferente — finalmente entendi o que estava fazendo de errado.',
    initials: 'VA',
    color: 'bg-green-600',
  },
  {
    name: 'Aluna Start',
    result: 'Eliminou 7,2kg e ganhou 3kg de massa magra',
    text: 'O que me surpreendeu foi o suporte. Qualquer dúvida, qualquer trava, sempre tinha alguém pra me ajudar. Me senti parte de algo maior.',
    initials: 'AS',
    color: 'bg-green-500',
  },
  {
    name: 'Josi',
    result: 'Perdeu 6,2kg seguindo o método',
    text: 'Comecei sem acreditar muito. Em 3 semanas já sentia diferença nas roupas. O treino de 20 minutos cabe direitinho na minha rotina de mãe.',
    initials: 'JO',
    color: 'bg-emerald-500',
  },
]

const FEATURES = [
  { icon: '📋', title: 'Plano Personalizado', desc: 'Treinos adaptados ao seu nível e objetivo' },
  { icon: '⏱️', title: '15–30 min por dia', desc: 'Rotinas que cabem em qualquer agenda' },
  { icon: '👯', title: 'Comunidade Exclusiva', desc: 'Milhares de mulheres juntas no mesmo caminho' },
  { icon: '📅', title: 'Acompanhamento 6 meses', desc: 'Você nunca mais vai se sentir sozinha' },
]

const PAINS = [
  'Começa motivada... e para em 2 semanas',
  'Já tentou todas as dietas e nenhuma funcionou',
  'Perdeu peso e ganhou tudo de volta',
  'Sente que algo está errado com você',
]

function sendServerEvent(eventName: string) {
  fetch('/api/pixel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventSourceUrl: window.location.href,
      clientUserAgent: navigator.userAgent,
      fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] ?? '',
      fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] ?? '',
    }),
  }).catch(() => {})
}

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SalesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [vagas, setVagas] = useState(7)
  const [showRoleta, setShowRoleta] = useState(false)

  useEffect(() => { trackStep('Vendas', 6) }, [])

  // Abre roleta automaticamente após 1.5s sempre que chega na página
  useEffect(() => {
    const t = setTimeout(() => setShowRoleta(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const TIMER_KEY = '_funnel_timer'
    const VAGAS_KEY = '_funnel_vagas'

    // Timer — persiste por 24h desde a primeira visita
    const saved = localStorage.getItem(TIMER_KEY)
    let expiry: number
    if (saved) {
      const parsed = parseInt(saved)
      expiry = (!isNaN(parsed) && parsed > Date.now()) ? parsed : Date.now() + 24 * 60 * 60 * 1000
    } else {
      expiry = Date.now() + 24 * 60 * 60 * 1000
    }
    localStorage.setItem(TIMER_KEY, String(expiry))

    // Vagas — fixo por sessão, começa em número entre 5-8
    const savedVagas = localStorage.getItem(VAGAS_KEY)
    if (savedVagas) {
      setVagas(parseInt(savedVagas))
    } else {
      const initial = Math.floor(Math.random() * 4) + 5 // 5–8
      localStorage.setItem(VAGAS_KEY, String(initial))
      setVagas(initial)
    }

    const tick = () => setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const [showExitPopup, setShowExitPopup] = useState(false)
  const exitShownRef = useRef(false)

  useEffect(() => {
    const SHOWN_KEY = '_exit_popup_shown'
    if (localStorage.getItem(SHOWN_KEY)) return

    // Desktop: mouse sai pelo topo (indo fechar a aba)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShownRef.current) {
        exitShownRef.current = true
        localStorage.setItem(SHOWN_KEY, '1')
        setShowExitPopup(true)
      }
    }

    // Mobile: visibilidade perdida (troca de aba / minimiza)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && !exitShownRef.current) {
        exitShownRef.current = true
        localStorage.setItem(SHOWN_KEY, '1')
        setShowExitPopup(true)
      }
    }

    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const handleCheckout = useCallback(() => {
    initiateCheckout()
    sendServerEvent('InitiateCheckout')
  }, [])

  return (
    <div className="mobile-frame bg-[#0A0A0A] overflow-y-auto" style={{ minHeight: '100dvh' }}>

      {/* Status bar */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]">
        <StatusBar dark={true} />
      </div>

      {/* ── URGÊNCIA STICKY ───────────────────────────────────────── */}
      <div className="sticky top-[28px] z-40 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-sm border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-red-400 text-base flex-shrink-0 animate-pulse">🔥</span>
          <div className="min-w-0">
            <p className="text-white text-[11px] font-semibold leading-tight truncate">Oferta expira em:</p>
            <p className="text-red-300 font-black text-base leading-tight tabular-nums">{formatCountdown(timeLeft)}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-red-500/30 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-yellow-400 text-base">⚠️</span>
          <div className="text-right">
            <p className="text-white text-[11px] font-semibold leading-tight">Restam apenas</p>
            <p className="text-yellow-300 font-black text-base leading-tight">{vagas} vagas</p>
          </div>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-5 pt-6 pb-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#22C55E]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
            🔓 Acesso Liberado
          </span>

          <h1 className="text-white text-3xl font-black leading-tight break-words">
            O sistema que faz você <span className="text-[#22C55E]">manter o resultado</span>
          </h1>

          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Chega de começar e parar. Descubra o método que milhares de mulheres usam para transformar o corpo sem sofrer.
          </p>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 mt-2">
            <div className="flex -space-x-2">
              {['VA', 'JO', 'AS', 'CA'].map((init, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] border-2 border-[#0A0A0A] flex items-center justify-center text-white text-[9px] font-bold">
                  {init}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">+2.847 mulheres</p>
              <p className="text-white/50 text-xs">já transformaram suas vidas</p>
            </div>
          </div>

          <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" onClick={handleCheckout} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base py-4 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mt-2 text-center block">
            QUERO COMEÇAR AGORA
          </a>
        </div>
      </section>

      {/* ── PAIN POINTS ───────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-black text-xl mb-4 text-center">Você se identifica?</h2>
          <div className="flex flex-col gap-3">
            {PAINS.map((pain, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">✗</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVELATION ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="relative bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/10 border border-[#22C55E]/30 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 blur-2xl rounded-full pointer-events-none" />
          <h2 className="text-white font-black text-xl mb-3 relative z-10">
            O problema nunca foi <span className="text-[#22C55E]">você</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4 relative z-10">
            Você foi colocada num sistema impossível de manter: treinos genéricos, dietas extremas, sem acompanhamento.
          </p>
          <div className="bg-black/40 rounded-xl px-4 py-3 relative z-10">
            <p className="text-white text-sm font-semibold text-center leading-relaxed">
              O que separa quem consegue de quem desiste é ter um{' '}
              <span className="text-[#22C55E] font-black">SISTEMA.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCT ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="flex flex-col items-center gap-1 mb-6 text-center">
          <div className="flex items-center gap-2 mb-1 w-full">
            <div className="h-px flex-1 bg-[#22C55E]/30" />
            <span className="text-[#22C55E] text-xs font-bold tracking-widest uppercase whitespace-nowrap">O Programa</span>
            <div className="h-px flex-1 bg-[#22C55E]/30" />
          </div>
          <h2 className="text-white font-black text-2xl">START EMPODERADA</h2>
          <p className="text-white/50 text-sm">O programa que transforma seu corpo de forma sustentável</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-white font-bold text-sm leading-tight">{f.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEMBERS AREA ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <h2 className="text-white font-black text-xl mb-2 text-center">Acesso Imediato à Área de Membros</h2>
        <p className="text-white/50 text-sm text-center mb-5">Veja o que você vai receber assim que entrar</p>

        <div className="bg-gradient-to-br from-[#0a160a] to-[#0a0a0a] border border-[#22C55E]/30 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/80" />
            <p className="text-white text-xs font-bold tracking-wide">Área de Membros — Start Empoderada</p>
          </div>
          {/* Screenshot real da área de membros */}
          <div className="relative w-full">
            <img
              src="/area-membros.jpg"
              alt="Área de membros Start Empoderada"
              className="w-full object-cover"
            />
            {/* Fade inferior para transição suave */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#16213e] to-transparent" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#22C55E] font-black text-2xl">5+</p>
              <p className="text-white/50 text-xs">Módulos Completos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#22C55E] font-black text-2xl">14+</p>
              <p className="text-white/50 text-xs">Aulas Práticas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <h2 className="text-white font-black text-xl mb-1 text-center">Depoimentos das Empoderadas</h2>
        <p className="text-white/40 text-sm text-center mb-5">Resultados reais de alunas reais</p>

        <div className="flex flex-col gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Imagem do depoimento */}
              <img
                src={`/${i + 1}.jpg`}
                alt={`Depoimento de ${t.name}`}
                className="w-full object-cover"
              />
              {/* Info abaixo da imagem */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-[#22C55E] text-xs font-semibold">{t.result}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <span className="text-[#22C55E] text-lg">🏆</span>
          <p className="text-white/70 text-sm font-medium">+2.847 mulheres já transformaram suas vidas</p>
        </div>
      </section>

      {/* ── GRÁFICO TRANSFORMAÇÃO ────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Sua transformação prevista</p>
            <h3 className="text-white font-black text-lg leading-snug">Você em <span className="text-[#22C55E]">14 dias</span> seguindo o método</h3>
          </div>

          {/* Gráfico SVG */}
          <div className="relative w-full" style={{ height: 180 }}>
            <svg viewBox="0 0 320 160" width="100%" height="160" className="overflow-visible">
              {/* Grade */}
              {[0, 40, 80, 120].map(y => (
                <line key={y} x1="36" y1={y + 8} x2="312" y2={y + 8} stroke="#ffffff10" strokeWidth="1" />
              ))}

              {/* Labels Y */}
              {['100%', '75%', '50%', '25%'].map((label, i) => (
                <text key={i} x="30" y={i * 40 + 13} textAnchor="end" fill="#ffffff40" fontSize="9" fontWeight="600">{label}</text>
              ))}

              {/* Labels X */}
              {['Hoje', 'Dia 3', 'Dia 7', 'Dia 10', 'Dia 14'].map((label, i) => {
                const xs = [44, 113, 182, 247, 308]
                return <text key={i} x={xs[i]} y="155" textAnchor="middle" fill="#ffffff40" fontSize="9" fontWeight="600">{label}</text>
              })}

              {/* Área ANTES (cinza/vermelho — sem método) */}
              <defs>
                <linearGradient id="grad-before" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef444430" />
                  <stop offset="100%" stopColor="#ef444400" />
                </linearGradient>
                <linearGradient id="grad-after" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E50" />
                  <stop offset="100%" stopColor="#22C55E00" />
                </linearGradient>
              </defs>

              {/* Linha ANTES (plana, caindo levemente) */}
              <path
                d="M 44 88 L 113 98 L 182 105 L 247 110 L 308 118 L 308 148 L 44 148 Z"
                fill="url(#grad-before)"
              />
              <path
                d="M 44 88 L 113 98 L 182 105 L 247 110 L 308 118"
                fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3"
              />

              {/* Linha DEPOIS (subindo) */}
              <path
                d="M 44 108 L 113 80 L 182 52 L 247 30 L 308 12 L 308 148 L 44 148 Z"
                fill="url(#grad-after)"
              />
              <path
                d="M 44 108 L 113 80 L 182 52 L 247 30 L 308 12"
                fill="none" stroke="#22C55E" strokeWidth="2.5"
              />

              {/* Ponto inicial compartilhado */}
              <circle cx="44" cy="108" r="4" fill="#ffffff" stroke="#0a0a0a" strokeWidth="2" />

              {/* Ponto final ANTES */}
              <circle cx="308" cy="118" r="4" fill="#ef4444" stroke="#0a0a0a" strokeWidth="2" />
              <text x="308" y="112" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="800">sem método</text>

              {/* Ponto final DEPOIS */}
              <circle cx="308" cy="12" r="5" fill="#22C55E" stroke="#0a0a0a" strokeWidth="2" />
              <text x="308" y="7" textAnchor="middle" fill="#22C55E" fontSize="8" fontWeight="800">com método</text>
            </svg>
          </div>

          {/* Métricas comparativas */}
          <div className="flex flex-col gap-2">
            {[
              { label: 'Energia', antes: 25, depois: 88, icon: '⚡' },
              { label: 'Disposição', antes: 20, depois: 85, icon: '💪' },
              { label: 'Confiança', antes: 30, depois: 90, icon: '✨' },
            ].map(({ label, antes, depois, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-base w-5 flex-shrink-0">{icon}</span>
                <p className="text-white/60 text-xs font-bold w-20 flex-shrink-0">{label}</p>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 bg-red-500/30 rounded-full" style={{ width: `${antes}%` }} />
                    <span className="text-red-400 text-[10px] font-bold">{antes}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 bg-[#22C55E] rounded-full transition-all duration-1000" style={{ width: `${depois}%` }} />
                    <span className="text-[#22C55E] text-[10px] font-bold">{depois}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/30 text-[10px] text-center">Baseado em resultados reais de alunas com perfil similar ao seu</p>
        </div>
      </section>

      {/* ── OFFER ─────────────────────────────────────────────────── */}
      <section id="oferta" className="px-4 sm:px-6 pb-10">
        <div className="relative bg-gradient-to-br from-[#0a160a] to-[#0a0a0a] border-2 border-[#22C55E]/50 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />

          <div className="p-5 flex flex-col gap-5">
            <div className="text-center">
              <span className="bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold px-3 py-1 rounded-full">
                ⚡ Oferta Especial
              </span>
              <h2 className="text-white font-black text-2xl mt-3">Start Empoderada</h2>
            </div>

            {/* Ancoragem de valor */}
            <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest text-center">O que você recebe</p>
              </div>
              <div className="flex flex-col divide-y divide-white/5">
                {[
                  { item: 'Plano de treino personalizado',    valor: 'R$ 297' },
                  { item: 'Treinos em casa e na academia',    valor: 'R$ 197' },
                  { item: 'Guia alimentar prático',           valor: 'R$ 97'  },
                  { item: 'Comunidade exclusiva de mulheres', valor: 'R$ 197' },
                  { item: 'Acompanhamento por 6 meses',       valor: 'R$ 497' },
                  { item: 'Bônus: Lives em grupo',            valor: 'R$ 97'  },
                  { item: 'Bônus: Desafios mensais',          valor: 'R$ 97'  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#22C55E] text-[8px] font-bold">✓</span>
                      </div>
                      <span className="text-white/80 text-xs leading-tight">{row.item}</span>
                    </div>
                    <span className="text-white/40 text-xs line-through flex-shrink-0">{row.valor}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60 text-xs font-bold">Valor total</span>
                <span className="text-white/50 text-sm font-black line-through">R$ 1.479</span>
              </div>
            </div>

            {/* Preço com ancoragem */}
            <div className="text-center flex flex-col gap-3">
              <p className="text-white/40 text-sm">Tudo isso por apenas</p>

              {/* 1º mês com desconto da roleta */}
              <div className="bg-[#22C55E]/10 border-2 border-[#22C55E]/50 rounded-2xl px-4 py-4">
                <span className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">🎰 Desconto da roleta</span>
                <p className="text-white/50 text-xs mt-2">1º mês por apenas</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-white/60 text-xl font-bold self-start mt-2">R$</span>
                  <span className="text-[#22C55E] font-black text-6xl leading-none">37<span className="text-3xl">,00</span></span>
                </div>
              </div>

              {/* Recorrência */}
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex flex-col gap-1">
                <p className="text-white/50 text-xs">A partir do 2º mês</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-white/40 text-base font-bold self-start mt-1">R$</span>
                  <span className="text-white font-black text-3xl leading-none">67<span className="text-xl">,00</span></span>
                  <span className="text-white/40 text-sm mb-1">/mês</span>
                </div>
                <p className="text-white/30 text-xs">menos que um jantar fora 🍽️</p>
              </div>

              {/* Cancelamento */}
              <div className="flex items-center justify-center gap-2 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5">
                <span className="text-white/40 text-sm">🔓</span>
                <p className="text-white/50 text-xs font-medium">Cancele quando quiser, sem multa e sem burocracia</p>
              </div>
            </div>

            {/* Urgência inline */}
            <div className="bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-red-400 animate-pulse">🔥</span>
                <div>
                  <p className="text-white/60 text-[10px]">Oferta expira em</p>
                  <p className="text-red-300 font-black text-base tabular-nums leading-none">{formatCountdown(timeLeft)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px]">Vagas restantes</p>
                <p className="text-yellow-300 font-black text-base leading-none">{vagas} vagas</p>
              </div>
            </div>

            <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 text-center block">
              QUERO COMEÇAR AGORA
            </a>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🔒', label: 'Compra segura' },
                { icon: '↩️', label: '7 dias de garantia' },
                { icon: '💬', label: 'Suporte no WhatsApp' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{b.icon}</span>
                  <p className="text-white/40 text-xs text-center leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <a
          href="https://wa.me/5511915306467?text=Ol%C3%A1%20Geo%2C%20quero%20mais%20informa%C3%A7%C3%B5es%20dos%20seus%20m%C3%A9todos..."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-[#15803D] font-bold text-sm py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Dúvidas? Me chama no WhatsApp
        </a>

        <h2 className="text-white font-black text-xl mb-5 text-center">Dúvidas Frequentes</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-white text-sm font-semibold pr-3 leading-snug">{faq.q}</span>
                <span className={`text-[#22C55E] text-xl font-light flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-white/60 text-sm leading-relaxed border-t border-white/10 pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-14">
        <div className="relative bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5 border border-[#22C55E]/30 rounded-2xl p-6 flex flex-col items-center gap-5 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#22C55E20_0%,_transparent_70%)] pointer-events-none" />
          <p className="text-white/60 text-sm leading-relaxed relative z-10">
            Você chegou até aqui por um motivo.<br />
            <strong className="text-white">Não deixa essa oportunidade passar.</strong>
          </p>
          <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" className="relative z-10 w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 text-center block">
            QUERO COMEÇAR AGORA
          </a>
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
            <p className="text-white/40 text-xs">+2.847 mulheres transformadas</p>
          </div>
        </div>
      </section>

      {/* ── ROLETA POPUP ──────────────────────────────────────────── */}
      {showRoleta && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-[#0f1a0f] border border-[#22C55E]/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-[#22C55E] to-yellow-400" />
            <div className="p-5 flex flex-col gap-4">
              <div className="text-center">
                <span className="text-2xl">🎰</span>
                <h2 className="text-white font-black text-xl mt-1 leading-tight">
                  Gire e ganhe seu prêmio!
                </h2>
                <p className="text-white/40 text-xs mt-1">Você tem direito a 1 giro gratuito</p>
              </div>
              <Roleta onClaim={() => {
                setShowRoleta(false)
                setTimeout(() => {
                  document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })
                }, 300)
              }} />
              <button
                onClick={() => setShowRoleta(false)}
                className="text-white/20 text-xs text-center hover:text-white/40 transition-colors"
              >
                Fechar e ver a oferta completa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTÃO FLUTUANTE WHATSAPP ──────────────────────────────── */}
      <a
        href="https://wa.me/5511915306467?text=Ol%C3%A1%20Geo%2C%20quero%20mais%20informa%C3%A7%C3%B5es%20dos%20seus%20m%C3%A9todos..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-4 py-3 rounded-full shadow-2xl shadow-green-500/40 active:scale-95 transition-all duration-200 hover:bg-[#1ebe5d]"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Falar com a Giovanna</span>
      </a>

      {/* ── EXIT INTENT POPUP ─────────────────────────────────────── */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#0f1f0f] border border-[#22C55E]/40 rounded-3xl overflow-hidden shadow-2xl shadow-green-900/50">

            {/* Linha de destaque topo */}
            <div className="h-1 w-full bg-gradient-to-r from-[#22C55E] via-[#4ade80] to-[#22C55E]" />

            <div className="p-6 flex flex-col gap-4">
              {/* Ícone + título */}
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl">🚨</span>
                <h2 className="text-white font-black text-xl leading-tight">
                  Espera! Antes de ir...
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Você está saindo sem garantir sua vaga. As vagas estão acabando rápido.
                </p>
              </div>

              {/* Oferta em destaque */}
              <div className="bg-black/40 border border-[#22C55E]/20 rounded-2xl px-4 py-4 flex flex-col items-center gap-1 text-center">
                <p className="text-white/50 text-xs line-through">De R$ 997,00</p>
                <div className="flex items-end gap-1">
                  <span className="text-white/60 text-base font-bold self-start mt-1">R$</span>
                  <span className="text-white font-black text-5xl leading-none">397</span>
                </div>
                <p className="text-white/50 text-xs mt-1">ou 12x de <strong className="text-white">R$41,01</strong></p>
                <div className="flex items-center gap-2 mt-2 bg-red-950/60 border border-red-500/30 rounded-xl px-3 py-2">
                  <span className="text-red-400 animate-pulse text-sm">🔥</span>
                  <p className="text-red-300 font-black text-sm tabular-nums">{formatCountdown(timeLeft)}</p>
                  <span className="text-white/30 text-xs">restando</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <a
                  href="https://pay.cakto.com.br/36sdo2o_810308"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCheckout}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 text-center block"
                >
                  QUERO GARANTIR MINHA VAGA
                </a>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="w-full text-white/30 text-xs py-2 hover:text-white/50 transition-colors"
                >
                  Não, prefiro perder essa oportunidade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
