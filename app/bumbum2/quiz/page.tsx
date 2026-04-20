'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { trackStep } from '@/lib/analytics'

const QUESTIONS = [
  {
    id: 'sonho',
    question: 'Qual é o seu maior objetivo para o bumbum?',
    options: [
      { text: 'Aumentar e empinar de vez', emoji: '📈' },
      { text: 'Definir e firmar sem flacidez', emoji: '💎' },
      { text: 'Tirar a gordura e moldar', emoji: '🔥' },
      { text: 'Tudo isso junto!', emoji: '⭐' },
    ],
    reaction: 'Perfeito! Isso vai definir seu protocolo personalizado 🎯',
  },
  {
    id: 'tempo',
    question: 'Há quanto tempo você tenta melhorar sem resultado?',
    options: [
      { text: 'Menos de 3 meses', emoji: '🌱' },
      { text: '3 a 6 meses', emoji: '😟' },
      { text: '6 meses a 1 ano', emoji: '😔' },
      { text: 'Mais de 1 ano travada', emoji: '😭' },
    ],
    reaction: 'Isso é muito comum — temos a solução exata para você 💡',
  },
  {
    id: 'nivel',
    question: 'Qual é o seu nível de treino hoje?',
    options: [
      { text: 'Sou iniciante', emoji: '🐣' },
      { text: 'Treino às vezes sem consistência', emoji: '🎢' },
      { text: 'Treino regularmente sem resultado', emoji: '😤' },
      { text: 'Treino pesado mas não cresce', emoji: '🤯' },
    ],
    reaction: 'Entendido! Isso explica o que está travando o seu glúteo 🔍',
  },
  {
    id: 'local',
    question: 'Onde você prefere treinar?',
    options: [
      { text: 'Em casa sem equipamento', emoji: '🛋️' },
      { text: 'Em casa com elástico/halteres', emoji: '🏋️' },
      { text: 'Na academia', emoji: '🏟️' },
      { text: 'Tanto faz, quero resultado!', emoji: '🎯' },
    ],
    reaction: 'O método funciona em qualquer ambiente 🏠',
  },
  {
    id: 'dias',
    question: 'Quantos dias por semana você consegue treinar?',
    options: [
      { text: '1 a 2 dias', emoji: '😅' },
      { text: '3 a 4 dias', emoji: '👍' },
      { text: '5 ou mais dias', emoji: '🔥' },
      { text: 'Depende da semana', emoji: '🤷' },
    ],
    reaction: 'É suficiente para resultado real com o método certo ⚡',
  },
  {
    id: 'dificuldade',
    question: 'O que mais te impede de ter o bumbum que quer?',
    options: [
      { text: 'Não sei por onde começar', emoji: '😕' },
      { text: 'Começo e desisto rápido', emoji: '🌀' },
      { text: 'Faço tudo certo mas sem resultado', emoji: '😡' },
      { text: 'Falta de tempo e motivação', emoji: '⏳' },
    ],
    reaction: 'Identificamos o bloqueio! Vamos resolver isso juntas 🎯',
  },
  {
    id: 'situacao',
    question: 'Como está seu bumbum hoje?',
    options: [
      { text: 'Pequeno e sem volume', emoji: '😞' },
      { text: 'Caído e sem firmeza', emoji: '😣' },
      { text: 'Com gordura sem definição', emoji: '🤔' },
      { text: 'Assimétrico ou irregular', emoji: '😬' },
    ],
    reaction: 'Seu diagnóstico está ficando muito preciso 📊',
  },
  {
    id: 'desejo',
    question: 'O que você quer sentir em 4 semanas?',
    options: [
      { text: 'Orgulho ao olhar no espelho', emoji: '🪞' },
      { text: 'Confiança para usar biquíni', emoji: '👙' },
      { text: 'Roupas ficando melhores', emoji: '👗' },
      { text: 'Quero me transformar completamente!', emoji: '🦋' },
    ],
    reaction: 'Incrível! Seu perfil completo está quase pronto 🍑',
  },
]

type Phase = 'question' | 'reaction' | 'name' | 'calculating'

function B2QuizInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('question')
  const [currentReaction, setCurrentReaction] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [userName, setUserName] = useState('')
  const [calcProgress, setCalcProgress] = useState(0)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { trackStep('B2_Quiz', 2) }, [])

  useEffect(() => {
    if (phase === 'name') setTimeout(() => nameInputRef.current?.focus(), 300)
  }, [phase])

  function handleAnswer(optionText: string) {
    const q = QUESTIONS[current]
    setAnswers(prev => ({ ...prev, [q.id]: optionText }))
    setSelectedOption(optionText)
    setCurrentReaction(q.reaction)
    setPhase('reaction')
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent(c => c + 1)
        setSelectedOption('')
        setPhase('question')
      } else {
        setPhase('name')
      }
    }, 1300)
  }

  function handleNameSubmit(skip?: boolean) {
    const name = skip ? '' : userName.trim()
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
          const profileParam = nivel.includes('Sou') ? 'iniciante'
            : nivel.includes('pesado') ? 'avancado' : 'intermediario'
          const nameParam = name ? `&nome=${encodeURIComponent(name)}` : ''
          router.push(`/bumbum2/resultado?perfil=${profileParam}${nameParam}${params ? `&${params}` : ''}`)
        }, 500)
      }
      setCalcProgress(Math.min(p, 100))
    }, 180)
  }

  const progress = ((current + (phase === 'reaction' ? 1 : 0)) / QUESTIONS.length) * 100
  const q = QUESTIONS[current]

  if (phase === 'calculating') {
    return (
      <div className="flex flex-col items-center justify-center px-8 gap-6" style={{ background: '#FFF0F5', minHeight: '100svh' }}>
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <span className="text-6xl animate-bounce">🍑</span>
          <h2 className="text-gray-900 font-black text-xl text-center">Criando seu protocolo...</h2>
          <p className="text-gray-500 text-sm text-center">Analisando suas respostas para personalizar seu resultado</p>
          <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${calcProgress}%`, background: 'linear-gradient(90deg, #F43F75, #E91E8C)' }} />
          </div>
          <p style={{ color: '#E91E8C' }} className="font-black text-sm">{Math.round(calcProgress)}%</p>
        </div>
      </div>
    )
  }

  if (phase === 'name') {
    return (
      <div className="flex flex-col items-center justify-center px-6 gap-6" style={{ background: '#FFF0F5', minHeight: '100svh' }}>
        <div className="w-full max-w-xs flex flex-col items-center gap-6">
          <span className="text-6xl">🎉</span>
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-gray-900 font-black text-2xl leading-tight">
              Seu diagnóstico está <span style={{ color: '#E91E8C' }}>pronto!</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">Como posso te chamar? Assim seu resultado fica personalizado.</p>
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
              className="w-full px-4 py-4 rounded-2xl text-gray-900 font-semibold text-base outline-none"
              style={{ background: 'white', border: '2px solid #F43F7560' }}
            />
            <button
              onClick={() => handleNameSubmit()}
              disabled={!userName.trim()}
              style={{ background: userName.trim() ? 'linear-gradient(135deg, #F43F75, #E91E8C)' : '#e5e7eb' }}
              className="w-full text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:text-gray-400"
            >
              🍑 VER MEU DIAGNÓSTICO
            </button>
            <button onClick={() => handleNameSubmit(true)} className="text-gray-400 text-xs text-center py-2">
              Pular e ver resultado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ background: '#FAFAFA', minHeight: '100svh' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-white border-b border-pink-50">
        <div className="flex items-center justify-between mb-3 max-w-md mx-auto">
          <span className="text-gray-500 text-xs font-bold">Diagnóstico Bumbum</span>
          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: '#FFF0F5', color: '#E91E8C' }}>
            {current + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="max-w-md mx-auto">
          <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #F43F75, #E91E8C)' }} />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{Math.round(progress)}% concluído</p>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 pt-6 pb-8">
        <div className="flex flex-col gap-5 flex-1">
          <h2 className="text-gray-900 font-black text-xl leading-tight">{q.question}</h2>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === opt.text
              return (
                <button
                  key={i}
                  onClick={() => phase === 'question' && handleAnswer(opt.text)}
                  disabled={phase === 'reaction'}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all duration-200 active:scale-95"
                  style={{
                    background: isSelected ? '#FFF0F5' : 'white',
                    border: isSelected ? '2px solid #E91E8C' : '1px solid #F3E8FF',
                    boxShadow: isSelected ? '0 0 0 3px #E91E8C20' : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                  <span className="text-gray-800 font-semibold text-sm flex-1">{opt.text}</span>
                  {isSelected && <span style={{ color: '#E91E8C' }} className="font-black text-base flex-shrink-0">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Reaction */}
          {phase === 'reaction' && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl animate-fadeIn"
              style={{ background: '#FFF0F5', border: '1px solid #F43F7530' }}>
              <span className="text-xl flex-shrink-0">💬</span>
              <p style={{ color: '#E91E8C' }} className="font-bold text-sm leading-relaxed">{currentReaction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function B2Quiz() {
  return <Suspense><B2QuizInner /></Suspense>
}
