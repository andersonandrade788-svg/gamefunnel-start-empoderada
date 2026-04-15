'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { trackStep } from '@/lib/analytics'

const QUESTIONS = [
  {
    id: 'sonho',
    emoji: '🍑',
    question: 'Qual é o seu maior sonho pro seu bumbum?',
    options: [
      { text: 'Aumentar e empinar de vez', emoji: '📈' },
      { text: 'Definir e firmar sem flacidez', emoji: '💎' },
      { text: 'Tirar a gordura e moldar', emoji: '🔥' },
      { text: 'Tudo isso junto — quero tudo!', emoji: '⭐' },
    ],
  },
  {
    id: 'tempo',
    emoji: '⏰',
    question: 'Há quanto tempo você tenta melhorar o bumbum sem resultado?',
    options: [
      { text: 'Menos de 3 meses', emoji: '🌱' },
      { text: '3 a 6 meses tentando', emoji: '😟' },
      { text: '6 meses a 1 ano', emoji: '😔' },
      { text: 'Mais de 1 ano — me sinto travada', emoji: '😭' },
    ],
  },
  {
    id: 'nivel',
    emoji: '💪',
    question: 'Qual é o seu nível de treino hoje?',
    options: [
      { text: 'Sou iniciante, mal consigo agachar', emoji: '🐣' },
      { text: 'Treino às vezes mas sem consistência', emoji: '🎢' },
      { text: 'Treino regularmente mas sem resultado', emoji: '😤' },
      { text: 'Treino pesado mas o bumbum não cresce', emoji: '🤯' },
    ],
  },
  {
    id: 'local',
    emoji: '🏠',
    question: 'Onde você prefere treinar?',
    options: [
      { text: 'Em casa sem equipamento', emoji: '🛋️' },
      { text: 'Em casa com elástico/halteres', emoji: '🏋️' },
      { text: 'Na academia', emoji: '🏟️' },
      { text: 'Tanto faz, quero resultado!', emoji: '🎯' },
    ],
  },
  {
    id: 'dias',
    emoji: '📅',
    question: 'Quantos dias por semana você consegue treinar?',
    options: [
      { text: '1 a 2 dias por semana', emoji: '😅' },
      { text: '3 a 4 dias por semana', emoji: '👍' },
      { text: '5 ou mais dias', emoji: '🔥' },
      { text: 'Depende da semana', emoji: '🤷' },
    ],
  },
  {
    id: 'dificuldade',
    emoji: '🚧',
    question: 'O que mais te impede de ter o bumbum que você quer?',
    options: [
      { text: 'Não sei por onde começar', emoji: '😕' },
      { text: 'Começo e desisto rápido', emoji: '🌀' },
      { text: 'Faço tudo certo mas não vejo resultado', emoji: '😡' },
      { text: 'Falta de tempo e motivação', emoji: '⏳' },
    ],
  },
  {
    id: 'situacao',
    emoji: '🪞',
    question: 'Como está seu bumbum hoje?',
    options: [
      { text: 'Pequeno e sem volume', emoji: '😞' },
      { text: 'Caído e sem firmeza', emoji: '😣' },
      { text: 'Com gordura mas sem definição', emoji: '🤔' },
      { text: 'Assimétrico ou irregular', emoji: '😬' },
    ],
  },
  {
    id: 'desejo',
    emoji: '✨',
    question: 'O que você mais quer sentir daqui a 4 semanas?',
    options: [
      { text: 'Orgulho ao olhar no espelho', emoji: '🪞' },
      { text: 'Confiança para usar biquíni', emoji: '👙' },
      { text: 'Sentir as roupas ficando melhores', emoji: '👗' },
      { text: 'Tudo isso — quero me transformar!', emoji: '🦋' },
    ],
  },
]

const XP_PER_QUESTION = 125

function BumbumQuizInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [xp, setXp] = useState(0)
  const [notifications, setNotifications] = useState<{ id: number; text: string }[]>()
  const [calculating, setCalculating] = useState(false)
  const [calcProgress, setCalcProgress] = useState(0)
  const notifIdRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    trackStep('Bumbum_Quiz', 2)
  }, [])

  function getAudioCtx() {
    if (typeof window === 'undefined') return null
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return null
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }

  function playTick() {
    const ctx = getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }

  function addNotification(text: string) {
    const id = ++notifIdRef.current
    setNotifications(prev => [...(prev ?? []), { id, text }])
    setTimeout(() => setNotifications(prev => (prev ?? []).filter(n => n.id !== id)), 2500)
  }

  function handleAnswer(optionText: string) {
    playTick()
    const q = QUESTIONS[current]
    setAnswers(prev => ({ ...prev, [q.id]: optionText }))
    const newXp = xp + XP_PER_QUESTION
    setXp(newXp)
    addNotification(`+${XP_PER_QUESTION} XP 🔥`)

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300)
    } else {
      setCalculating(true)
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 8 + 3
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setTimeout(() => {
            const params = searchParams.toString()
            const nivel = answers.nivel ?? ''
            const profileParam = nivel.includes('iniciante') || nivel.includes('Sou') ? 'iniciante'
              : nivel.includes('pesado') ? 'avancado' : 'intermediario'
            router.push(`/bumbum/resultado?perfil=${profileParam}${params ? `&${params}` : ''}`)
          }, 500)
        }
        setCalcProgress(Math.min(p, 100))
      }, 180)
    }
  }

  const progress = ((current) / QUESTIONS.length) * 100

  if (calculating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-6" style={{ background: '#0D0005', minHeight: '100dvh' }}>
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <span className="text-6xl animate-bounce">🍑</span>
          <h2 className="text-white font-black text-xl text-center">Calculando seu perfil...</h2>
          <p className="text-white/40 text-sm text-center">Analisando suas respostas para criar seu protocolo personalizado</p>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${calcProgress}%`, background: 'linear-gradient(90deg, #E91E8C, #FFD700)' }}
            />
          </div>
          <p style={{ color: '#E91E8C' }} className="font-black text-sm">{Math.round(calcProgress)}%</p>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <div className="flex flex-col overflow-x-hidden" style={{ background: '#0D0005', minHeight: '100dvh' }}>

      {/* Notificações */}
      <div className="fixed top-14 left-0 right-0 flex flex-col items-center gap-2 z-40 pointer-events-none px-6">
        {(notifications ?? []).map(n => (
          <div
            key={n.id}
            className="text-white font-black px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)', animation: 'notif-pop 0.3s ease' }}
          >
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍑</span>
            <span className="text-white/60 text-xs font-bold">Diagnóstico Bumbum</span>
          </div>
          <div style={{ background: '#1A0010', border: '1px solid #E91E8C40' }} className="px-3 py-1 rounded-full">
            <span style={{ color: '#FFD700' }} className="font-black text-xs">⚡ {xp} XP</span>
          </div>
        </div>

        {/* Progresso */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #E91E8C, #FFD700)' }}
          />
        </div>
        <p className="text-white/30 text-xs mt-1">{current + 1} de {QUESTIONS.length}</p>
      </div>

      {/* Pergunta */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col gap-3">
          <span className="text-4xl">{q.emoji}</span>
          <h2 className="text-white font-black text-xl leading-tight">{q.question}</h2>
        </div>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.text)}
              style={{ background: '#1A0010', border: '1px solid #E91E8C30' }}
              className="w-full text-left px-4 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all duration-150 hover:border-pink-500"
            >
              <span className="text-xl flex-shrink-0">{opt.emoji}</span>
              <span className="text-white font-semibold text-sm leading-tight">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default function BumbumQuiz() {
  return (
    <Suspense>
      <BumbumQuizInner />
    </Suspense>
  )
}
