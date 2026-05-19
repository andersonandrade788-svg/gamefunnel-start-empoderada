'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { viewContent } from '@/lib/pixel'

type Perfil = 'fome' | 'inchaco' | 'tempo' | 'definir' | 'geral'

const PERFIS = {
  fome: {
    label: 'Controladora de Fome',
    emoji: '🍽️',
    bloqueio: 'Fome fora de hora e ansiedade por doces sabotando sua dieta todos os dias',
    necessidade: 'shots metabólicos naturais com plano alimentar estratégico para controlar o apetite',
    destaque: 'controle da fome notável em até 7 dias',
  },
  inchaco: {
    label: 'Desinchadeira em Potencial',
    emoji: '💧',
    bloqueio: 'Retenção de líquidos e inflamação bloqueando seus resultados',
    necessidade: 'protocolo de desinchamento com receitas específicas e movimentos de drenagem',
    destaque: 'desinchar visivelmente em até 5 dias',
  },
  tempo: {
    label: 'Guerreira da Rotina Corrida',
    emoji: '⏰',
    bloqueio: 'Rotina corrida que impede qualquer consistência em alimentação e treinos',
    necessidade: 'treinos de 15-20 min e cardápio prático que encaixa em qualquer agenda',
    destaque: 'resultados visíveis sem abrir mão da rotina',
  },
  definir: {
    label: 'Definidora de Corpo',
    emoji: '💪',
    bloqueio: 'Falta de treinos específicos e plano alimentar para reduzir gordura e ganhar definição',
    necessidade: 'treinos estratégicos focados em ativação muscular com protocolo alimentar de suporte',
    destaque: 'corpo mais firme e definido em 21 dias',
  },
  geral: {
    label: 'Metabolismo Travado',
    emoji: '🔥',
    bloqueio: 'Metabolismo lento e falta de um plano prático para seguir todos os dias',
    necessidade: 'protocolo completo com rotina alimentar, treinos curtos e shot metabólico natural',
    destaque: 'metabolismo ativado e resultados em 21 dias',
  },
}

function derivePerfil(params: URLSearchParams): Perfil {
  const bloqueio = decodeURIComponent(params.get('bloqueio') ?? '')
  const objetivo = decodeURIComponent(params.get('objetivo') ?? '')
  const inchaco  = decodeURIComponent(params.get('inchaco') ?? '')
  const rotina   = decodeURIComponent(params.get('rotina') ?? '')

  if (bloqueio.includes('Fome') || bloqueio.includes('Ansiedade') || bloqueio.includes('doces')) return 'fome'
  if (objetivo.includes('Desinchar') || inchaco.includes('quase todos') || inchaco.includes('Algumas vezes')) return 'inchaco'
  if (rotina.includes('corrida') || rotina.includes('filhos') || rotina.includes('tempo')) return 'tempo'
  if (objetivo.includes('Definir')) return 'definir'
  return 'geral'
}

function renderBold(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g)
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <strong key={i}>{part.slice(1, -1)}</strong>
      : <span key={i}>{part}</span>
  )
}

function buildMessages(p: typeof PERFIS[Perfil], nome?: string) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'amiga'
  return [
    `Oi, *${primeiroNome}*! 👋 Sou a Geovana, especialista em emagrecimento feminino.`,
    `Acabei de analisar todas as suas respostas aqui e *seu diagnóstico ficou pronto*. 🧬`,
    `Com base no que você me contou, identifiquei seu perfil como: *${p.label} ${p.emoji}*`,
    `Seu principal bloqueio hoje é: ${p.bloqueio}.`,
    `O que seu corpo precisa agora é de ${p.necessidade}.`,
    `A boa notícia? Com o protocolo certo você consegue *${p.destaque}*.`,
    `Montei um *Protocolo Efeito Caneta Natural — 21 Dias* personalizado pro seu perfil. 💊\nÉ um método que mulheres com o seu perfil estão usando e transformando o corpo sem dieta restritiva.`,
    `Posso te mostrar como ele funciona? 👇`,
  ]
}

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', gap: 5, padding: '10px 14px',
      background: '#fff', borderRadius: 16, borderBottomLeftRadius: 4,
      alignSelf: 'flex-start', boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
      maxWidth: 72,
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: '#90949c',
          display: 'inline-block',
          animation: 'typingBounce 1.2s infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

function ECNResultadoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const perfil = derivePerfil(searchParams)
  const p = PERFIS[perfil]
  const nome = searchParams.get('nome') ?? undefined
  const messages = buildMessages(p, nome)

  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    viewContent('Resultado_ProtocoloCaneta')
  }, [])

  useEffect(() => {
    if (visibleCount >= messages.length) {
      setTyping(false)
      setDone(true)
      return
    }
    setTyping(true)
    const delay = Math.max(1200, messages[visibleCount].length * 28)
    const t = setTimeout(() => {
      setTyping(false)
      setTimeout(() => setVisibleCount(c => c + 1), 150)
    }, delay)
    return () => clearTimeout(t)
  }, [visibleCount, messages.length])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [visibleCount, typing])

  function goToSales() {
    const qs = searchParams.toString()
    router.push(`/protocolo-caneta-natural/sales?perfil=${perfil}${qs ? `&${qs}` : ''}`)
  }

  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    // position:fixed garante tela fixa sem nunca crescer com URL bar
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      background: '#ECE5DD',
    }}>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      {/* WhatsApp Header */}
      <div style={{
        background: '#075E54',
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#128C7E' }}>
          <img
            src="/geovana.jpg"
            alt="Geovana"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Geovana Bueno</p>
          <p style={{ color: '#B2DFDB', fontSize: 12, margin: 0 }}>online agora</p>
        </div>
      </div>

      {/* Chat — flex:1 = ocupa tudo entre header e CTA */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: '9px 12px 7px',
            maxWidth: '84%',
            alignSelf: 'flex-start',
            boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
            fontSize: 14,
            lineHeight: 1.55,
            color: '#111',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {renderBold(msg)}
            <span style={{ fontSize: 11, color: '#8d9195', marginLeft: 6, float: 'right', marginTop: 3, whiteSpace: 'nowrap' }}>
              {now}
            </span>
          </div>
        ))}

        {typing && <TypingIndicator />}
      </div>

      {/* CTA — sempre renderizado, visível só quando done.
          Isso evita layout shift: o espaço já está reservado. */}
      <div style={{
        background: '#f0f0f0',
        borderTop: '1px solid #ccc',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        flexShrink: 0,
        transition: 'opacity 0.3s',
        opacity: done ? 1 : 0,
        pointerEvents: done ? 'auto' : 'none',
      }}>
        <button
          onClick={goToSales}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            background: '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px',
            fontWeight: 900,
            fontSize: 16,
            cursor: 'pointer',
            width: '100%',
            letterSpacing: 0.3,
            boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
          }}
        >
          SIM, QUERO VER MEU PROTOCOLO! 💊
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#8d9195', margin: '8px 0 0' }}>
          🔒 Acesso imediato · Garantia 7 dias
        </p>
      </div>
    </div>
  )
}

export default function ECNResultado() {
  return <Suspense fallback={null}><ECNResultadoInner /></Suspense>
}
