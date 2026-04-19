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
    reaction: 'Perfeito! Isso vai definir seu protocolo personalizado 🎯',
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
    reaction: 'Isso é muito comum — mas tem uma solução exata para o seu caso 💡',
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
    reaction: 'Entendido! Isso explica por que o glúteo pode não estar crescendo 🔍',
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
    reaction: 'Ótimo! O método foi adaptado para funcionar em qualquer ambiente 🏠',
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
    reaction: 'Perfeito — é suficiente para resultado real com o método certo ⚡',
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
    reaction: 'Identificamos o bloqueio! Esse é exatamente o ponto que vamos resolver 🎯',
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
    reaction: 'Registrado! Seu diagnóstico está ficando muito preciso 📊',
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
    reaction: 'Incrível escolha! Seu perfil completo está quase pronto 🍑',
  },
]

const XP_PER_QUESTION = 125

type Phase = 'question' | 'reaction' | 'name' | 'calculating'

function BumbumQuizInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [xp, setXp] = useState(0)
  const [notifications, setNotifications] = useState<{ id: number; text: string }[]>([])
  const [phase, setPhase] = useState<Phase>('question')
  const [currentReaction, setCurrentReaction] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [userName, setUserName] = useState('')
  const [calcProgress, setCalcProgress] = useState(0)
  const notifIdRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    trackStep('Bumbum_Quiz', 2)
  }, [])

  useEffect(() => {
    if (phase === 'name') {
      setTimeout(() => nameInputRef.current?.focus(), 300)
    }
  }, [phase])

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
    setNotifications(prev => [...prev, { id, text }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 2500)
  }

  function handleAnswer(optionText: string) {
    playTick()
    const q = QUESTIONS[current]
    setAnswers(prev => ({ ...prev, [q.id]: optionText }))
    setXp(prev => prev + XP_PER_QUESTION)
    addNotification(`+${XP_PER_QUESTION} XP 🔥`)
    setSelectedOption(optionText)
    setCurrentReaction(q.reaction)
    setPhase('reaction')

    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent(c => c + 1)
        setSelectedOption('')
        setPhase('question')
      } else {
        // Last question — go to name capture
        setPhase('name')
      }
    }, 1300)
  }

  function handleNameSubmit(skipName?: boolean) {
    const finalName = skipName ? '' : userName.trim()
    startCalculating(finalName)
  }

  function startCalculating(name: string) {
    setPhase('calculating')
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
          const nameParam = name ? `&nome=${encodeURIComponent(name)}` : ''
          router.push(`/bumbum/resultado?perfil=${profileParam}${nameParam}${params ? `&${params}` : ''}`)
        }, 500)
      }
      setCalcProgress(Math.min(p, 100))
    }, 180)
  }

  const progress = (current / QUESTIONS.length) * 100
  const q = QUESTIONS[current]

  // ── Calculating screen ────────────────────────────────────────────────────
  if (phase === 'calculating') {
    return (
      <div className="bumbum-page flex flex-col items-center justify-center px-8 gap-6" style={{ background: '#0D0005' }}>
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

  // ── Name capture screen ───────────────────────────────────────────────────
  if (phase === 'name') {
    return (
      <div className="bumbum-page flex flex-col items-center justify-center px-8 gap-6" style={{ background: '#0D0005' }}>
        <div className="w-full max-w-xs flex flex-col items-center gap-6 animate-fadeIn">
          <span className="text-6xl">🎉</span>
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-white font-black text-2xl leading-tight">
              Seu diagnóstico está <span style={{ color: '#E91E8C' }}>pronto!</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Como posso te chamar? Assim seu resultado fica personalizado para você.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <input
              ref={nameInputRef}
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && userName.trim() && handleNameSubmit()}
              placeholder="Digite seu nome aqui..."
              maxLength={40}
              className="w-full px-4 py-4 rounded-2xl text-white font-semibold text-base outline-none"
              style={{
                background: '#1A0010',
                border: '2px solid #E91E8C60',
                caretColor: '#E91E8C',
              }}
            />
            <button
              onClick={() => handleNameSubmit()}
              disabled={!userName.trim()}
              style={{
                background: userName.trim()
                  ? 'linear-gradient(135deg, #E91E8C, #C2185B)'
                  : '#2A0018',
              }}
              className="w-full text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              🍑 VER MEU DIAGNÓSTICO
            </button>
            <button
              onClick={() => handleNameSubmit(true)}
              className="text-white/25 text-xs text-center py-2"
            >
              Pular e ver resultado
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <div className="bumbum-page flex flex-col" style={{ background: '#0D0005' }}>

      {/* Notificações XP */}
      <div className="fixed top-20 left-0 right-0 flex flex-col items-center gap-2 z-40 pointer-events-none px-6">
        {notifications.map(n => (
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
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 text-xs font-bold">
            Pergunta <span className="text-white font-black">{current + 1}</span> de {QUESTIONS.length}
          </span>
          <span
            className="text-xs font-black px-2.5 py-0.5 rounded-full"
            style={{ background: '#E91E8C20', color: '#E91E8C' }}
          >
            {Math.round(progress)}% concluído
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #E91E8C, #FFD700)' }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col gap-3">
          <span className="text-4xl">{q.emoji}</span>
          <h2 className="text-white font-black text-xl leading-tight">{q.question}</h2>
        </div>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const isSelected = phase === 'reaction' && opt.text === selectedOption
            return (
              <button
                key={i}
                onClick={() => phase === 'question' && handleAnswer(opt.text)}
                disabled={phase === 'reaction'}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #E91E8C20, #E91E8C10)' : '#1A0010',
                  border: `1px solid ${isSelected ? '#E91E8C' : '#E91E8C30'}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                className="w-full text-left px-4 py-4 rounded-2xl flex items-center gap-3"
              >
                <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                <span className="text-white font-semibold text-sm leading-tight">{opt.text}</span>
                {isSelected && (
                  <span className="ml-auto text-pink-400 font-black text-lg flex-shrink-0">✓</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Reação após resposta */}
        {phase === 'reaction' && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 animate-fadeIn"
            style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '1px solid #E91E8C50' }}
          >
            <span className="text-2xl flex-shrink-0">💬</span>
            <p style={{ color: '#E91E8C' }} className="font-bold text-sm leading-snug">{currentReaction}</p>
          </div>
        )}
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
