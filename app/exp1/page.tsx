'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

const QUESTIONS = [
  {
    question: 'Qual é seu maior objetivo agora?',
    options: [
      { emoji: '🔥', text: 'Emagrecer e perder barriga' },
      { emoji: '💪', text: 'Definir e tonificar o corpo' },
      { emoji: '⚡', text: 'Ter mais energia no dia a dia' },
      { emoji: '🏆', text: 'Manter o resultado de vez' },
    ],
  },
  {
    question: 'Você sente algum desses sintomas há mais de 30 dias?',
    image: '/antes%20-%20e%20-%20depois%20-2.jpg',
    options: [
      { emoji: '😔', text: 'Sim, me identifico com vários' },
      { emoji: '😐', text: 'Sinto alguns, mas não todos' },
    ],
  },
  {
    question: 'Quantas vezes você já tentou mudar o corpo?',
    options: [
      { emoji: '🌱', text: 'É minha primeira vez' },
      { emoji: '🔄', text: '2 a 3 vezes' },
      { emoji: '😅', text: 'Umas 4 ou 5 vezes' },
      { emoji: '💀', text: 'Perdi a conta' },
    ],
  },
  {
    question: 'O que mais te faz desistir?',
    options: [
      { emoji: '⏰', text: 'A rotina corrida não deixa' },
      { emoji: '😤', text: 'Os resultados demoram demais' },
      { emoji: '🧠', text: 'Fico sem motivação rápido' },
      { emoji: '🤷', text: 'Não sei por onde começar' },
    ],
  },
  {
    question: 'Como você se sente com seu corpo hoje?',
    options: [
      { emoji: '😔', text: 'Muito insatisfeita, preciso mudar' },
      { emoji: '😐', text: 'Quero melhorar mas estou travada' },
      { emoji: '🔥', text: 'Pronta pra transformar tudo' },
    ],
  },
  {
    question: 'Você teria interesse em receber um plano personalizado para transformar seu corpo?',
    options: [
      { emoji: '🤩', text: 'Sim, quero demais!' },
      { emoji: '😌', text: 'Tenho interesse mas tenho dúvidas' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => { trackStep('Quiz', 1) }, [])

  useEffect(() => {
    if (finishing) {
      const t = setTimeout(() => router.push('/exp3'), 2500)
      return () => clearTimeout(t)
    }
  }, [finishing, router])

  function handleSelect(optionIndex: number) {
    if (selected !== null || animating) return
    setSelected(optionIndex)

    setTimeout(() => {
      setAnimating(true)
      setTimeout(() => {
        if (current < QUESTIONS.length - 1) {
          setCurrent(c => c + 1)
          setSelected(null)
          setAnimating(false)
        } else {
          setFinishing(true)
        }
      }, 300)
    }, 500)
  }

  const q = QUESTIONS[current]
  const progress = Math.round(((current) / QUESTIONS.length) * 100)

  if (finishing) {
    return (
      <div className="mobile-frame bg-white flex flex-col items-center justify-center px-6 gap-8">
        <StatusBar dark={false} />
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E] flex items-center justify-center">
            <span className="text-4xl">🧬</span>
          </div>
          <div>
            <p className="text-[#22C55E] text-sm font-black uppercase tracking-widest mb-2">Analisando seu perfil...</p>
            <h2 className="text-gray-900 font-black text-2xl leading-tight">Montando seu plano personalizado</h2>
            <p className="text-gray-400 text-sm mt-2">Isso vai levar só alguns segundos</p>
          </div>
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-frame bg-white flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar dark={false} />
      </div>

      {/* Barra de progresso */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs font-semibold">{current + 1} de {QUESTIONS.length}</span>
          <span className="text-[#22C55E] text-xs font-black">{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className={`flex-1 flex flex-col px-5 py-5 gap-5 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>

        {/* Pergunta */}
        <h2 className="text-gray-900 font-black text-xl leading-snug text-center">{q.question}</h2>

        {/* Imagem opcional entre pergunta e opções */}
        {q.image && (
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img src={q.image} alt="Resultado" className="w-full object-cover max-h-52" />
          </div>
        )}

        {/* Opções */}
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-base text-left transition-all duration-200 active:scale-95 border-2 ${
                  isSelected
                    ? 'bg-[#22C55E] border-[#22C55E] text-white scale-95'
                    : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-gray-800 hover:bg-[#22C55E]/20'
                }`}
              >
                <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                <span className="leading-snug">{opt.text}</span>
                {isSelected && <span className="ml-auto text-white font-black">✓</span>}
              </button>
            )
          })}
        </div>

        <p className="text-gray-300 text-xs text-center mt-auto">Toque em uma opção para continuar</p>
      </div>
    </div>
  )
}
