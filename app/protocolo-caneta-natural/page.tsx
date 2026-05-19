'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { viewContent } from '@/lib/pixel'

const PINK = '#E91E8C'
const PINK2 = '#F43F75'

const BTN_BASE: React.CSSProperties = {
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
}

// Tela cheia sem crescer: browser URL bar nunca causa layout shift
const SCREEN: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const QUESTIONS = [
  {
    id: 'objetivo',
    question: 'Qual é o seu principal objetivo hoje?',
    options: [
      { text: 'Perder peso', emoji: '⚖️' },
      { text: 'Desinchar', emoji: '💧' },
      { text: 'Controlar a fome', emoji: '🍽️' },
      { text: 'Definir o corpo', emoji: '💪' },
      { text: 'Voltar a me sentir bem no espelho', emoji: '🪞' },
    ],
    reaction: 'Boa! Estamos entendendo seu perfil.',
  },
  {
    id: 'bloqueio',
    question: 'O que mais te atrapalha no processo de emagrecimento?',
    options: [
      { text: 'Fome fora de hora', emoji: '😤' },
      { text: 'Ansiedade por doces', emoji: '🍫' },
      { text: 'Falta de tempo', emoji: '⏰' },
      { text: 'Efeito sanfona', emoji: '🔄' },
      { text: 'Falta de constância', emoji: '😔' },
    ],
    reaction: 'Perfeito, isso ajuda a montar sua recomendação.',
  },
  {
    id: 'rotina',
    question: 'Como está sua rotina atualmente?',
    options: [
      { text: 'Muito corrida', emoji: '🏃' },
      { text: 'Trabalho sentada a maior parte do dia', emoji: '💻' },
      { text: 'Tenho filhos e pouco tempo', emoji: '👶' },
      { text: 'Tenho tempo, mas não consigo manter disciplina', emoji: '😅' },
      { text: 'Estou tentando recomeçar', emoji: '🌱' },
    ],
    reaction: 'Seu diagnóstico está ficando mais preciso.',
  },
  {
    id: 'inchaco',
    question: 'Você sente inchaço com frequência?',
    options: [
      { text: 'Sim, quase todos os dias', emoji: '😣' },
      { text: 'Algumas vezes na semana', emoji: '😕' },
      { text: 'Só em alguns períodos', emoji: '🤔' },
      { text: 'Raramente', emoji: '😊' },
      { text: 'Não sei identificar', emoji: '❓' },
    ],
    reaction: 'Falta pouco para liberar seu resultado.',
  },
  {
    id: 'tentativas',
    question: 'Você já tentou emagrecer antes?',
    options: [
      { text: 'Sim, várias vezes', emoji: '😩' },
      { text: 'Sim, mas parei no meio', emoji: '🛑' },
      { text: 'Já fiz dieta, mas não aguentei', emoji: '😫' },
      { text: 'Já tentei academia, mas desanimei', emoji: '🏋️' },
      { text: 'Estou começando agora', emoji: '✨' },
    ],
    reaction: 'Análise quase concluída.',
  },
  {
    id: 'solucao',
    question: 'Qual tipo de solução combina mais com você?',
    options: [
      { text: 'Algo prático e guiado', emoji: '📋' },
      { text: 'Algo natural e sem remédio', emoji: '🌿' },
      { text: 'Algo rápido para começar hoje', emoji: '⚡' },
      { text: 'Algo que não exija academia pesada', emoji: '🏠' },
      { text: 'Algo com passo a passo diário', emoji: '📅' },
    ],
    reaction: 'Boa! Estamos entendendo seu perfil.',
  },
  {
    id: 'prazo',
    question: 'Em quanto tempo você quer começar a ver mudanças?',
    options: [
      { text: 'O quanto antes', emoji: '🔥' },
      { text: 'Ainda essa semana', emoji: '📆' },
      { text: 'Em até 21 dias', emoji: '✅' },
      { text: 'Quero começar devagar', emoji: '🐌' },
      { text: 'Preciso de um plano simples para seguir', emoji: '🗺️' },
    ],
    reaction: 'Calculando seu protocolo personalizado...',
  },
]

const LOADING_PHRASES = [
  'Analisando seu perfil metabólico...',
  'Identificando seus maiores bloqueios...',
  'Montando sua recomendação personalizada...',
  'Calculando seu nível de aderência ao protocolo...',
  'Resultado pronto!',
]

type Phase = 'landing' | 'question' | 'reaction' | 'nome' | 'loading'

function ECNQuizInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('landing')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState('')
  const [currentReaction, setCurrentReaction] = useState('')
  const [loadingPhrase, setLoadingPhrase] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [nome, setNome] = useState('')

  useEffect(() => {
    viewContent('Quiz_ProtocoloCaneta')
  }, [])

  useEffect(() => {
    if (phase !== 'loading') return
    let phraseIdx = 0
    const phraseIv = setInterval(() => {
      phraseIdx++
      if (phraseIdx < LOADING_PHRASES.length) setLoadingPhrase(phraseIdx)
      else clearInterval(phraseIv)
    }, 900)

    let progress = 0
    const progressIv = setInterval(() => {
      progress += Math.random() * 10 + 6
      if (progress >= 100) {
        progress = 100
        clearInterval(progressIv)
        setTimeout(() => {
          const qs = new URLSearchParams(searchParams.toString())
          Object.entries(answers).forEach(([k, v]) => qs.set(k, encodeURIComponent(v)))
          if (nome.trim()) qs.set('nome', nome.trim())
          router.push(`/protocolo-caneta-natural/resultado?${qs.toString()}`)
        }, 500)
      }
      setLoadingProgress(Math.min(progress, 100))
    }, 180)

    return () => { clearInterval(phraseIv); clearInterval(progressIv) }
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
        setPhase('nome')
      }
    }, 1200)
  }

  const progress = ((current + (phase === 'reaction' ? 1 : 0)) / QUESTIONS.length) * 100
  const q = QUESTIONS[current]

  /* ── LOADING ── */
  if (phase === 'loading') {
    return (
      <div style={{ ...SCREEN, background: '#FFF5F9', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <span style={{ fontSize: 56 }} className="animate-bounce">💊</span>
          <h2 style={{ color: '#111', fontWeight: 900, fontSize: 20, margin: 0 }}>Criando seu diagnóstico...</h2>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: '100%', height: 12, borderRadius: 99, overflow: 'hidden', background: '#FCE7F3' }}>
              <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${PINK2}, ${PINK})`, width: `${loadingProgress}%`, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontWeight: 900, fontSize: 14, color: PINK, margin: 0 }}>{Math.round(loadingProgress)}%</p>
          </div>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, minHeight: 44, margin: 0 }}>
            {LOADING_PHRASES[loadingPhrase]}
          </p>
        </div>
      </div>
    )
  }

  /* ── LANDING ── */
  if (phase === 'landing') {
    return (
      <div style={{ ...SCREEN, background: '#FAFAFA' }}>
        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any,
        }}>
          {/* Hero image */}
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', position: 'relative', lineHeight: 0 }}>
            <img
              src="/capa%20caneta.jpg"
              alt="Protocolo Efeito Caneta Natural"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
              background: 'linear-gradient(to bottom, transparent, #FAFAFA)',
            }} />
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0 20px',
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            maxWidth: 480, margin: '0 auto', width: '100%',
          }}>
            <div style={{
              marginBottom: 16, padding: '6px 16px', borderRadius: 99,
              fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
              background: '#FCE7F3', color: PINK,
            }}>
              ✨ Diagnóstico Gratuito e Personalizado
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ color: '#111', fontWeight: 900, fontSize: 22, lineHeight: 1.3, margin: '0 0 12px' }}>
                Descubra seu{' '}
                <span style={{ color: PINK }}>Perfil Metabólico</span>
                {' '}e veja como ativar o{' '}
                <span style={{ color: PINK2 }}>Efeito Caneta Natural</span>
                {' '}em 21 dias
              </h1>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Responda algumas perguntas rápidas e receba uma recomendação personalizada para acelerar seu metabolismo, controlar a fome e desinchar de forma natural.
              </p>
            </div>

            <button
              onClick={() => setPhase('question')}
              style={{
                ...BTN_BASE,
                width: '100%', color: '#fff', fontWeight: 900, fontSize: 18,
                padding: '18px 0', borderRadius: 16, marginBottom: 24,
                background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
                boxShadow: `0 4px 20px ${PINK}55`,
              }}
            >
              Começar meu diagnóstico →
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              {[
                { icon: '⚡', text: 'Apenas 2 minutos para completar' },
                { icon: '🎯', text: 'Diagnóstico 100% personalizado' },
                { icon: '🌿', text: 'Protocolo natural — sem remédios' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#fff', padding: '12px 16px', borderRadius: 16,
                  border: '1px solid #FCE7F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <p style={{ color: '#374151', fontSize: 14, fontWeight: 600, margin: 0 }}>{f.text}</p>
                </div>
              ))}
            </div>

            <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 16 }}>Gratuito · Sem cadastro · Resultado imediato</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── NOME ── */
  if (phase === 'nome') {
    const primeiroNome = nome.trim().split(' ')[0]
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 52 }}>💊</span>
              <h2 style={{ color: '#111', fontWeight: 900, fontSize: 22, lineHeight: 1.3, margin: '16px 0 8px' }}>
                Seu diagnóstico está pronto!
              </h2>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Qual é o seu nome? A Geovana vai apresentar os resultados pra você.
              </p>
            </div>

            <input
              type="text"
              placeholder="Digite seu nome..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && nome.trim()) setPhase('loading') }}
              autoFocus
              style={{
                width: '100%', padding: '16px', borderRadius: 16, fontSize: 16,
                border: `2px solid ${nome.trim() ? PINK : '#e5e7eb'}`,
                outline: 'none', boxSizing: 'border-box',
                color: '#111', fontWeight: 600, background: '#fff',
                transition: 'border-color 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            />

            <button
              onClick={() => { if (nome.trim()) setPhase('loading') }}
              disabled={!nome.trim()}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                cursor: nome.trim() ? 'pointer' : 'default',
                border: 'none', outline: 'none',
                width: '100%', color: '#fff', fontWeight: 900, fontSize: 18,
                padding: '18px 0', borderRadius: 16,
                background: nome.trim() ? `linear-gradient(135deg, ${PINK2}, ${PINK})` : '#e5e7eb',
                boxShadow: nome.trim() ? `0 4px 20px ${PINK}55` : 'none',
                transition: 'all 0.2s',
              }}
            >
              {nome.trim() ? `Ver meu diagnóstico, ${primeiroNome}! →` : 'Digite seu nome para continuar'}
            </button>

            <button
              onClick={() => setPhase('loading')}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                cursor: 'pointer',
                border: 'none', outline: 'none', background: 'transparent',
                color: '#9ca3af', fontSize: 13, padding: '8px 0',
              }}
            >
              Continuar sem informar nome
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── QUIZ ── */
  return (
    <div style={{ ...SCREEN, background: '#FAFAFA' }}>

      {/* Progress header — altura fixa */}
      <div style={{
        background: '#fff',
        padding: '16px 20px 12px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        borderBottom: '1px solid #fce7f3',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 448, margin: '0 auto 10px' }}>
          <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>Diagnóstico Metabólico</span>
          <span style={{ fontSize: 12, fontWeight: 900, padding: '4px 12px', borderRadius: 99, background: '#FCE7F3', color: PINK }}>
            {current + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div style={{ maxWidth: 448, margin: '0 auto' }}>
          <div style={{ width: '100%', height: 8, borderRadius: 99, overflow: 'hidden', background: '#fce7f3' }}>
            <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${PINK2}, ${PINK})`, width: `${progress}%`, transition: 'width 0.5s' }} />
          </div>
          <p style={{ textAlign: 'right', fontSize: 11, marginTop: 4, color: PINK, fontWeight: 700 }}>{Math.round(progress)}% concluído</p>
        </div>
      </div>

      {/* Quiz body — ocupa resto e scrolla */}
      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any,
        padding: '24px 20px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        maxWidth: 448, margin: '0 auto', width: '100%',
        boxSizing: 'border-box',
      }}>
        <h2 style={{ color: '#111', fontWeight: 900, fontSize: 19, lineHeight: 1.35, margin: '0 0 20px' }}>
          {q.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === opt.text
            return (
              <button key={i}
                onClick={() => phase === 'question' && handleAnswer(opt.text)}
                disabled={phase === 'reaction'}
                style={{
                  ...BTN_BASE,
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16, textAlign: 'left',
                  background: isSelected ? '#FFF0F7' : '#fff',
                  border: isSelected ? `2px solid ${PINK}` : '1px solid #F3E8FF',
                  boxShadow: isSelected ? `0 0 0 3px ${PINK}18` : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s',
                  minHeight: 52,
                }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.emoji}</span>
                <span style={{ color: '#1f2937', fontWeight: 600, fontSize: 14, flex: 1, lineHeight: 1.4 }}>{opt.text}</span>
                {isSelected && <span style={{ fontWeight: 900, fontSize: 16, flexShrink: 0, color: PINK }}>✓</span>}
              </button>
            )
          })}
        </div>

        {phase === 'reaction' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 16px', borderRadius: 16, marginTop: 20,
            background: '#FFF0F7', border: `1px solid ${PINK}30`,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💬</span>
            <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5, color: PINK, margin: 0 }}>{currentReaction}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ECNQuiz() {
  return <Suspense fallback={null}><ECNQuizInner /></Suspense>
}
