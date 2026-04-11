'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

const QUESTIONS = [
  {
    emoji: '🎯',
    question: 'Qual é seu maior objetivo agora?',
    options: [
      { emoji: '🔥', text: 'Emagrecer de vez' },
      { emoji: '💪', text: 'Definir e tonificar' },
      { emoji: '📈', text: 'Ganhar massa magra' },
      { emoji: '⚡', text: 'Manter o resultado' },
    ],
  },
  {
    emoji: '😩',
    question: 'Qual é sua maior dificuldade hoje?',
    options: [
      { emoji: '⏰', text: 'Falta de tempo' },
      { emoji: '🤷', text: 'Não sei por onde começar' },
      { emoji: '😤', text: 'Já tentei e não funcionou' },
      { emoji: '🧠', text: 'Fico sem motivação' },
    ],
  },
  {
    emoji: '🔄',
    question: 'Quantas vezes já tentou mudar o corpo?',
    options: [
      { emoji: '🌱', text: 'É minha primeira vez' },
      { emoji: '🔄', text: '2 a 3 vezes' },
      { emoji: '😅', text: 'Umas 4 ou 5' },
      { emoji: '💀', text: 'Perdi a conta' },
    ],
  },
  {
    emoji: '⏱️',
    question: 'Quanto tempo você tem por dia para treinar?',
    options: [
      { emoji: '⚡', text: '15 minutos' },
      { emoji: '🕐', text: '30 minutos' },
      { emoji: '💪', text: '1 hora' },
      { emoji: '🏆', text: 'Mais de 1 hora' },
    ],
  },
  {
    emoji: '😔',
    question: 'O que mais te faz desistir?',
    options: [
      { emoji: '🥗', text: 'A dieta é difícil demais' },
      { emoji: '😴', text: 'A rotina me esgota' },
      { emoji: '⏳', text: 'Os resultados demoram' },
      { emoji: '🌪️', text: 'A vida corrida atrapalha' },
    ],
  },
  {
    emoji: '💭',
    question: 'Como você se sente com seu corpo hoje?',
    options: [
      { emoji: '😔', text: 'Muito insatisfeita' },
      { emoji: '😐', text: 'Quero mudar mas estou travada' },
      { emoji: '💛', text: 'Já melhorei, quero mais' },
      { emoji: '🔥', text: 'Pronta pra transformar tudo' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [points, setPoints] = useState(0)
  const [finished, setFinished] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => { trackStep('Quiz', 1) }, [])

  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => router.push('/exp3'), 2800)
      return () => clearTimeout(t)
    }
  }, [finished, router])

  function handleSelect(optionIndex: number) {
    if (selected !== null || animating) return
    setSelected(optionIndex)
    setPoints(p => p + 10)

    setTimeout(() => {
      setAnimating(true)
      setTimeout(() => {
        if (current < QUESTIONS.length - 1) {
          setCurrent(c => c + 1)
          setSelected(null)
          setAnimating(false)
        } else {
          setFinished(true)
        }
      }, 300)
    }, 600)
  }

  const q = QUESTIONS[current]
  const progress = ((current) / QUESTIONS.length) * 100

  if (finished) {
    return (
      <div className="mobile-frame bg-[#0D0D0D] flex flex-col items-center justify-center px-6 gap-8">
        <StatusBar dark />
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center">
            <span className="text-4xl">🧬</span>
          </div>
          <div>
            <p className="text-[#22C55E] text-sm font-bold uppercase tracking-widest mb-2">Analisando seu perfil...</p>
            <h2 className="text-white font-black text-2xl leading-tight">Montando seu diagnóstico personalizado</h2>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
            <span className="text-2xl">⭐</span>
            <div className="text-left">
              <p className="text-white/50 text-xs">Pontuação conquistada</p>
              <p className="text-[#22C55E] font-black text-xl">{points} pts</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#22C55E] animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-frame bg-[#0D0D0D] flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="bg-[#0D0D0D] flex-shrink-0">
        <StatusBar dark />
      </div>

      {/* Header com pontos e progresso */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            {current + 1} de {QUESTIONS.length}
          </span>
          <div className="flex items-center gap-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full px-3 py-1">
            <span className="text-sm">⭐</span>
            <span className="text-[#22C55E] font-black text-sm">{points} pts</span>
          </div>
        </div>
        {/* Barra de progresso */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ade80] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className={`flex-1 flex flex-col px-5 py-6 gap-6 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-4xl">{q.emoji}</span>
          </div>
          <h2 className="text-white font-black text-xl leading-snug">{q.question}</h2>
        </div>

        {/* Opções */}
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 min-h-[100px] transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#22C55E]/20 border-[#22C55E] scale-95'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <p className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-[#22C55E]' : 'text-white/80'}`}>
                  {opt.text}
                </p>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">✓</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-white/20 text-xs text-center">Toque em uma opção para continuar</p>
      </div>
    </div>
  )
}
