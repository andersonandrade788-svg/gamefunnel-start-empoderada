'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

type Screen =
  | { type: 'hook' }
  | { type: 'identification' }
  | { type: 'question'; index: number }
  | { type: 'belief' }
  | { type: 'result' }
  | { type: 'silhouette' }
  | { type: 'transition' }

type Notif = { id: number; kg: number; xp: number }

const QUESTIONS = [
  {
    question: 'Quando você vê alguém tendo resultado… o que você sente de verdade?',
    options: [
      'Inspiração… mas também frustração',
      'Comparação — por que ela e não eu?',
      'Raiva. Tipo: por que não eu?',
      'Indiferença… já desisti um pouco',
    ],
  },
  {
    question: 'Qual dessas frases descreve melhor sua relação com disciplina?',
    options: [
      'Começo forte e apago depois de 2 semanas',
      'Só mantenho quando vejo resultado rápido',
      'Dependo muito do humor do dia',
      'Tenho disciplina, mas não vejo resultado',
    ],
  },
  {
    question: 'O que você acredita que ainda está te impedindo?',
    options: [
      'Falta de tempo real na minha rotina',
      'Não sei o que funciona de verdade pra mim',
      'Já tentei muito e me decepcionei',
      'Falta alguém me guiando de perto',
    ],
  },
  {
    question: 'Se você pudesse mudar uma coisa agora… qual seria?',
    options: [
      'Ter um corpo que me deixe orgulhosa',
      'Ter energia de verdade no dia a dia',
      'Parar de começar e parar',
      'Me sentir confiante de novo',
    ],
  },
]

const DROPS: Record<string, { kg: number; xp: number }> = {
  identification: { kg: 0.5, xp: 50 },
  'question-0':   { kg: 0.8, xp: 80 },
  'question-1':   { kg: 0.7, xp: 70 },
  'question-2':   { kg: 1.0, xp: 100 },
  'question-3':   { kg: 0.8, xp: 80 },
  belief:         { kg: 0.6, xp: 60 },
  result:         { kg: 0.6, xp: 60 },
}

const CONFETTI_COLORS = ['#22C55E', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#FB923C', '#34D399']

const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2.5 + Math.random() * 2,
  size: 7 + Math.random() * 8,
  isCircle: Math.random() > 0.5,
}))

function progressFor(screen: Screen): number {
  if (screen.type === 'hook') return 5
  if (screen.type === 'identification') return 15
  if (screen.type === 'question') return 25 + screen.index * 15
  if (screen.type === 'belief') return 82
  if (screen.type === 'result') return 92
  return 100
}

function playLevelUp() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      const start = ctx.currentTime + i * 0.13
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.35, start + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28)
      osc.start(start)
      osc.stop(start + 0.3)
    })
  } catch (_) {}
}

function playFanfare() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    // Fanfarra celebratória: arpejo rápido + nota longa final
    const sequence = [
      { freq: 523, start: 0,    dur: 0.15 },
      { freq: 659, start: 0.13, dur: 0.15 },
      { freq: 784, start: 0.26, dur: 0.15 },
      { freq: 1047,start: 0.39, dur: 0.5  },
    ]
    sequence.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + start
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.4, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      osc.start(t)
      osc.stop(t + dur + 0.05)
    })
  } catch (_) {}
}

const CAROUSEL_IMAGES = [
  '/tela%20inicial.jpg',
  '/tela%20inicia%2002.jpg',
  '/tela%20inicial%2003.jpg',
]

export default function QuizPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>({ type: 'hook' })
  const [animating, setAnimating] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [totalKg, setTotalKg] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [calcProgress, setCalcProgress] = useState(0)
  const notifIdRef = useRef(0)

  useEffect(() => { trackStep('Quiz', 1) }, [])

  useEffect(() => {
    if (screen.type === 'transition') {
      setTimeout(() => {
        setShowConfetti(true)
        setBadgeVisible(true)
        playFanfare()
      }, 300)
    }
  }, [screen.type])

  function showNotification(kg: number, xp: number) {
    const id = ++notifIdRef.current
    setNotifications(prev => [...prev, { id, kg, xp }])
    setTotalKg(prev => Math.round((prev + kg) * 10) / 10)
    setTotalXp(prev => prev + xp)
    playLevelUp()
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 2800)
  }

  function next(nextScreen: Screen, dropKey?: string) {
    if (dropKey && DROPS[dropKey]) {
      const { kg, xp } = DROPS[dropKey]
      showNotification(kg, xp)
    }

    // Mostra loading "calculando" antes de telas de resultado
    const showLoading = nextScreen.type === 'belief' || nextScreen.type === 'result'
    if (showLoading) {
      setCalculating(true)
      setCalcProgress(0)
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 18 + 8
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setTimeout(() => {
            setCalculating(false)
            setCalcProgress(0)
            setAnimating(true)
            setTimeout(() => { setScreen(nextScreen); setAnimating(false) }, 350)
          }, 400)
        }
        setCalcProgress(Math.min(p, 100))
      }, 120)
      return
    }

    setAnimating(true)
    setTimeout(() => {
      setScreen(nextScreen)
      setAnimating(false)
    }, 350)
  }

  function handleOption() {
    if (screen.type === 'identification') {
      next({ type: 'question', index: 0 }, 'identification')
    } else if (screen.type === 'question') {
      if (screen.index < QUESTIONS.length - 1) {
        next({ type: 'question', index: screen.index + 1 }, `question-${screen.index}`)
      } else {
        next({ type: 'belief' }, `question-${screen.index}`)
      }
    }
  }

  const progress = progressFor(screen)

  return (
    <div className="mobile-frame bg-white flex flex-col" style={{ minHeight: '100dvh' }}>

      <style>{`
        @keyframes notif-pop {
          0%   { opacity: 0; transform: translateY(-24px) scale(0.85); }
          18%  { opacity: 1; transform: translateY(4px) scale(1.05); }
          28%  { transform: translateY(0) scale(1); }
          72%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
          55%  { transform: scale(1.25) rotate(12deg); opacity: 1; }
          75%  { transform: scale(0.93) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .notif-anim   { animation: notif-pop 2.8s ease forwards; }
        .badge-anim   { animation: badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: '-20px',
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
                animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Loading — Calculando perfil */}
      {calculating && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-8 gap-6">
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="text-5xl animate-bounce">🧠</div>
            <div className="text-center flex flex-col gap-1">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aguarde um momento</p>
              <h2 className="text-gray-900 font-black text-xl leading-snug">Calculando seu perfil…</h2>
            </div>

            {/* Barra de progresso */}
            <div className="w-full flex flex-col gap-2">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-[#22C55E] rounded-full transition-all duration-150"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
              <p className="text-[#22C55E] font-black text-sm text-right">{Math.round(calcProgress)}%</p>
            </div>

            {/* Steps animados */}
            <div className="w-full flex flex-col gap-2 mt-2">
              {[
                { label: 'Analisando suas respostas…',     done: calcProgress > 25 },
                { label: 'Identificando padrões…',         done: calcProgress > 55 },
                { label: 'Montando seu perfil exclusivo…', done: calcProgress > 80 },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${s.done ? 'bg-[#22C55E]' : 'bg-gray-100'}`}>
                    {s.done && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <p className={`text-xs font-semibold transition-all duration-300 ${s.done ? 'text-gray-800' : 'text-gray-300'}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating notifications */}
      <div className="fixed top-14 left-0 right-0 flex flex-col items-center gap-2 z-40 pointer-events-none px-6">
        {notifications.map(n => (
          <div
            key={n.id}
            className="notif-anim bg-[#22C55E] text-white font-black px-5 py-3 rounded-2xl shadow-xl shadow-green-500/40 flex items-center gap-3 text-sm"
          >
            <span>🔥</span>
            <span>-{n.kg}kg queimado!</span>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">+{n.xp} XP</span>
          </div>
        ))}
      </div>

      <div className="bg-white flex-shrink-0">
        <StatusBar dark={false} />
      </div>

      {/* Barra de progresso */}
      {screen.type !== 'hook' && (
        <div className="px-5 pt-3 pb-1 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            {totalKg > 0 && (
              <p className="text-[#22C55E] text-xs font-black">🔥 -{totalKg}kg</p>
            )}
            {totalXp > 0 && (
              <p className="text-purple-500 text-xs font-black">⚡ {totalXp} XP</p>
            )}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className={`flex-1 flex flex-col transition-all duration-350 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

        {/* ── TELA 1: HOOK ── */}
        {screen.type === 'hook' && (
          <div className="flex-1 flex flex-col relative">
            <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: '55vh' }}>
              {CAROUSEL_IMAGES.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Start Empoderada"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
                  style={{ opacity: carouselIndex === i ? 1 : 0 }}
                />
              ))}
              {/* Dots */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 z-10">
                {CAROUSEL_IMAGES.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: carouselIndex === i ? 18 : 6,
                      height: 6,
                      backgroundColor: carouselIndex === i ? '#22C55E' : '#ffffff80',
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
            </div>
            <div className="flex flex-col px-6 gap-5 pb-8 pt-1">
              <div className="flex flex-col gap-3 text-center">
                <h1 className="text-gray-900 font-black text-[1.6rem] leading-tight">
                  Posso ser direta<br />com você?
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Em <strong className="text-gray-800">2 minutos</strong> eu consigo te mostrar por que você ainda não conseguiu o corpo que quer…
                </p>
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <p className="text-[#22C55E] font-black text-base px-2">E não é culpa sua.</p>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex -space-x-1.5">
                  {['VA', 'JO', 'CA'].map((init, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[#22C55E] border-2 border-white flex items-center justify-center text-white text-[8px] font-black">
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs"><strong className="text-gray-800">+2.847 mulheres</strong> já descobriram</p>
              </div>
              <button
                onClick={() => next({ type: 'identification' })}
                className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all"
              >
                👉 Quero descobrir
              </button>
              <p className="text-gray-300 text-xs text-center">Teste gratuito · 2 minutos · sem compromisso</p>
            </div>
          </div>
        )}

        {/* ── TELA 2: IDENTIFICAÇÃO ── */}
        {screen.type === 'identification' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-6">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Antes de tudo…</p>
              <h2 className="text-gray-900 font-black text-xl leading-snug">
                Qual dessas frases mais parece com você hoje?
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { emoji: '😔', text: 'Eu tento, mas parece que não sai do lugar' },
                { emoji: '💸', text: 'Já investi tempo e dinheiro e não tive retorno' },
                { emoji: '🌀', text: 'Sinto que tô perdida, sem saber por onde começar' },
                { emoji: '🔥', text: 'Sei que tenho potencial, mas sempre trava na hora' },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={handleOption}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm text-left bg-[#22C55E]/8 border-2 border-[#22C55E]/25 text-gray-800 active:bg-[#22C55E] active:text-white active:border-[#22C55E] transition-all duration-150"
                >
                  <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                  <span className="leading-snug">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TELAS 3–6: PERGUNTAS ── */}
        {screen.type === 'question' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-6">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-[#22C55E] text-xs font-black uppercase tracking-widest">
                Pergunta {screen.index + 1} de {QUESTIONS.length}
              </p>
              <h2 className="text-gray-900 font-black text-xl leading-snug">
                {QUESTIONS[screen.index].question}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {QUESTIONS[screen.index].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={handleOption}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm text-left bg-[#22C55E]/8 border-2 border-[#22C55E]/25 text-gray-800 active:bg-[#22C55E] active:text-white active:border-[#22C55E] transition-all duration-150"
                >
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
                  <span className="leading-snug">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TELA 7: QUEBRA DE CRENÇA ── */}
        {screen.type === 'belief' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center py-10">
            <div className="flex flex-col gap-5">
              <span className="text-5xl">💡</span>
              <div className="flex flex-col gap-3">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Com base no que você respondeu…</p>
                <h2 className="text-gray-900 font-black text-2xl leading-snug">
                  O problema <span className="text-[#22C55E]">NÃO</span> é falta de esforço.
                </h2>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-5 flex flex-col gap-3 text-left">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Você já tentou bastante. Já se esforçou. Já recomeçou mais de uma vez.
                </p>
                <p className="text-gray-900 font-bold text-sm leading-relaxed">
                  O que está travando não é força de vontade.
                </p>
                <p className="text-[#22C55E] font-black text-base leading-relaxed">
                  É que você está tentando do jeito errado — sem um sistema feito pra você.
                </p>
              </div>
            </div>
            <button
              onClick={() => next({ type: 'result' }, 'belief')}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              Entender meu resultado →
            </button>
          </div>
        )}

        {/* ── TELA 8: RESULTADO ── */}
        {screen.type === 'result' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-5 overflow-y-auto">
            <div className="text-center flex flex-col gap-1">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Seu perfil</p>
              <h2 className="text-gray-900 font-black text-2xl leading-tight">
                Você é do tipo:<br />
                <span className="text-[#22C55E]">"Potencial Travado"</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-2xl px-4 py-4">
                <p className="text-[#22C55E] text-xs font-black uppercase tracking-wider mb-2">🔥 Quem você é</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você sabe mais do que a média. Já pesquisou, já tentou, já começou várias vezes. O problema não é conhecimento — é execução com método.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <p className="text-gray-500 text-xs font-black uppercase tracking-wider mb-2">😔 Por que você trava</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você entra motivada, mas sem estrutura. Quando bate o cansaço ou a vida aperta — sem suporte — é natural parar. E isso te frustra mais do que deveria.
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                <p className="text-red-400 text-xs font-black uppercase tracking-wider mb-2">⚠️ Se continuar assim…</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você vai continuar no ciclo de começar, parar e se culpar. E cada vez que isso acontece, a crença de "isso não é pra mim" fica mais forte.
                </p>
              </div>
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-2xl px-4 py-4">
                <p className="text-[#22C55E] text-xs font-black uppercase tracking-wider mb-2">✨ Mas quando você ajusta isso…</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Com o sistema certo, o suporte certo e um plano que respeita sua rotina — você vira uma máquina de resultado. E dessa vez, mantém.
                </p>
              </div>
            </div>
            <button
              onClick={() => next({ type: 'silhouette' }, 'result')}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all mt-2"
            >
              Ver o meu caminho →
            </button>
          </div>
        )}

        {/* ── TELA SILHUETA: TRANSFORMAÇÃO ── */}
        {screen.type === 'silhouette' && (
          <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6">
            <style>{`
              @keyframes morph-before {
                0%   { d: path("M 100 280 C 60 260 45 220 48 180 C 50 140 55 110 80 90 C 95 78 110 72 120 70 C 130 68 145 70 155 78 C 170 88 178 105 180 130 C 183 155 175 175 168 195 C 158 220 150 240 152 280 Z"); }
                100% { d: path("M 100 280 C 72 265 62 235 64 200 C 66 165 72 135 90 112 C 103 96 115 88 125 86 C 135 84 148 86 158 96 C 170 108 174 128 172 152 C 170 175 162 195 158 215 C 152 240 148 258 148 280 Z"); }
              }
              @keyframes morph-after {
                0%   { opacity: 0; transform: scale(0.95); }
                40%  { opacity: 0; }
                100% { opacity: 1; transform: scale(1); }
              }
              @keyframes glow-pulse {
                0%, 100% { filter: drop-shadow(0 0 8px #22C55E60); }
                50%       { filter: drop-shadow(0 0 18px #22C55E90); }
              }
              @keyframes arrow-move {
                0%, 100% { transform: translateX(0); opacity: 0.6; }
                50%       { transform: translateX(6px); opacity: 1; }
              }
              .silhouette-after { animation: morph-after 1.8s ease forwards, glow-pulse 2.5s 1.8s ease-in-out infinite; }
              .arrow-anim       { animation: arrow-move 1s ease-in-out infinite; }
            `}</style>

            <div className="text-center flex flex-col gap-1">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Projeção personalizada</p>
              <h2 className="text-gray-900 font-black text-xl leading-tight">
                Imagina você assim<br />em <span className="text-[#22C55E]">30 dias</span>…
              </h2>
            </div>

            {/* Silhuetas lado a lado */}
            <div className="flex items-end justify-center gap-6 w-full">

              {/* ANTES */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="bg-red-50 border border-red-100 rounded-2xl px-3 py-1">
                  <span className="text-red-400 text-xs font-black uppercase">Hoje</span>
                </div>
                <div className="w-full rounded-2xl overflow-hidden shadow-md" style={{ height: 220 }}>
                  <img
                    src="/antes%2001.jpg"
                    alt="Antes"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Seta animada */}
              <div className="flex flex-col items-center gap-1 mb-10 flex-shrink-0">
                <div className="arrow-anim text-[#22C55E] text-3xl font-black">→</div>
                <p className="text-[#22C55E] text-[9px] font-black uppercase tracking-wider text-center">30<br/>dias</p>
              </div>

              {/* DEPOIS */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="bg-green-50 border border-green-100 rounded-2xl px-3 py-1">
                  <span className="text-[#22C55E] text-xs font-black uppercase">Depois</span>
                </div>
                <div className="silhouette-after w-full rounded-2xl overflow-hidden shadow-md" style={{ height: 220 }}>
                  <img
                    src="/antes%2002.jpg"
                    alt="Depois"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="w-full flex flex-col gap-2">
              {[
                { label: 'Peso', antes: '-5 a 8kg', depois: 'eliminados', icon: '⚖️' },
                { label: 'Energia', antes: 'baixa', depois: '+80% mais disposição', icon: '⚡' },
                { label: 'Confiança', antes: 'abalada', depois: 'renovada e forte', icon: '💪' },
              ].map(({ label, antes, depois, icon }) => (
                <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="text-lg">{icon}</span>
                  <p className="text-gray-500 text-xs font-bold w-16 flex-shrink-0">{label}</p>
                  <div className="flex items-center gap-1.5 flex-1 text-xs">
                    <span className="text-red-400 line-through">{antes}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-[#22C55E] font-black">{depois}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-300 text-[10px] text-center">
              Projeção baseada em resultados reais de alunas com perfil similar ao seu
            </p>

            <button
              onClick={() => next({ type: 'transition' })}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              Quero esse resultado →
            </button>
          </div>
        )}

        {/* ── TELA 9: TRANSIÇÃO CELEBRAÇÃO ── */}
        {screen.type === 'transition' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center py-10 relative z-10">

            {/* Badge conquista */}
            {badgeVisible && (
              <div className="badge-anim flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-400/40 border-4 border-white">
                  <span className="text-4xl">🏆</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-2">
                  <p className="text-yellow-700 text-xs font-black uppercase tracking-wider">🎖️ Conquista desbloqueada!</p>
                  <p className="text-yellow-900 font-black text-sm">Guerreira do Diagnóstico</p>
                </div>
              </div>
            )}

            {/* Celebração dos 5kg + XP */}
            <div className="bg-[#22C55E] rounded-2xl px-5 py-4 w-full flex flex-col gap-1 shadow-lg shadow-green-500/30">
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Simulação completa</p>
              <p className="text-white font-black text-3xl">-5kg queimados! 🔥</p>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="bg-white/20 rounded-full px-3 py-1 text-white text-xs font-black">⚡ {totalXp} XP ganhos</span>
              </div>
              <p className="text-white/70 text-sm mt-1">Agora imagina isso no seu corpo de verdade…</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <h2 className="text-gray-900 font-black text-2xl leading-snug">
                Existe um caminho específico para o seu perfil…
              </h2>
              <p className="text-gray-500 text-base leading-relaxed">
                E é exatamente o que eu vou te mostrar agora.
              </p>
              <div className="bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-2xl px-5 py-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Mulheres com o seu perfil que seguiram esse método transformaram o corpo em <strong className="text-[#22C55E]">30 dias</strong> — sem academia cara, sem dieta impossível.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/exp3')}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              👉 Eu preciso desse caminho
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
