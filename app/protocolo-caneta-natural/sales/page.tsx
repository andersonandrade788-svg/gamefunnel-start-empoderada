'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { initiateCheckout, viewContent } from '@/lib/pixel'

const CHECKOUT_URL = 'https://pay.cakto.com.br/3b43hgj_864016'

const PINK  = '#E91E8C'
const PINK2 = '#F43F75'

const BTN: React.CSSProperties = {
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
}

const BENEFITS = [
  { icon: '⚡', title: 'Acelera o metabolismo', text: 'Estratégias simples para gastar mais energia no dia a dia.' },
  { icon: '🍽️', title: 'Controle da fome', text: 'Plano alimentar para reduzir impulsos e escolhas ruins.' },
  { icon: '💧', title: 'Menos inchaço', text: 'Receitas e hábitos para o corpo ficar mais leve.' },
  { icon: '💪', title: 'Corpo definido', text: 'Treinos curtos e estratégicos para resultado real.' },
]

const ENTREGAVEIS = [
  { icon: '🏋️', title: 'Treinos estratégicos', text: 'Treinos rápidos e eficientes sem precisar de academia pesada.' },
  { icon: '🥗', title: 'Plano alimentar inteligente', text: 'Cardápio prático para controlar a fome e reduzir o inchaço.' },
  { icon: '🌿', title: 'Shot metabólico natural', text: 'Receita exclusiva para apoiar o metabolismo e diminuir vontade de doces.' },
  { icon: '📅', title: 'Desafio 21 dias', text: 'Passo a passo diário para criar novos hábitos e transformar corpo e mente.' },
]

const FAQ_ITEMS = [
  { q: 'O protocolo é um remédio?', a: 'Não. É um protocolo digital com orientações de treino, alimentação e hábitos naturais. Não substitui tratamento médico.' },
  { q: 'Preciso ir para academia?', a: 'Não necessariamente. O protocolo inclui treinos estratégicos e práticos que podem ser feitos em casa.' },
  { q: 'Em quanto tempo recebo acesso?', a: 'O acesso é imediato após a confirmação da compra. Você recebe o link direto no e-mail.' },
  { q: 'Funciona para qualquer pessoa?', a: 'Os resultados podem variar de pessoa para pessoa. O protocolo foi criado para orientar uma rotina mais saudável, prática e consistente.' },
  { q: 'Tem garantia?', a: 'Sim. Você tem 7 dias de garantia total. Se não gostar por qualquer motivo, devolvemos 100% do valor pago.' },
]

function ECNSalesInner() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(900)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const ofertaRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  function unmuteVideo() {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    v.volume = 1
    if (v.paused) v.play().catch(() => {})
    setMuted(false)
  }

  useEffect(() => {
    const KEY = 'ecn_sales_expire'
    try {
      const expire = localStorage.getItem(KEY)
      if (expire) {
        const remaining = Math.floor((Number(expire) - Date.now()) / 1000)
        if (remaining > 0) { setCountdown(remaining); return }
      }
      localStorage.setItem(KEY, String(Date.now() + 900 * 1000))
    } catch {}
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    viewContent('VSL_ProtocoloCaneta')
  }, [])

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function goToCheckout() {
    initiateCheckout()
    const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    const p = new URLSearchParams()
    UTM_KEYS.forEach(k => { const v = searchParams.get(k); if (v) p.set(k, v) })
    const qs = p.toString()
    window.location.href = qs ? `${CHECKOUT_URL}?${qs}` : CHECKOUT_URL
  }

  function scrollToOferta() {
    ofertaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100dvh', WebkitTextSizeAdjust: '100%' } as any}>

      {/* Urgência */}
      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(90deg, ${PINK2}, ${PINK})`,
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
      }}>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, textAlign: 'center' }} className="animate-pulse">
          ⏰ Oferta especial expira em {mins}:{secs} — Aproveite agora
        </span>
      </div>

      <div style={{
        maxWidth: 448, margin: '0 auto', padding: '0 20px',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}>

        {/* VSL header */}
        <div style={{ paddingTop: 28, paddingBottom: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: PINK, margin: 0 }}>
            💊 Protocolo Efeito Caneta Natural
          </p>
          <h1 style={{ color: '#111', fontWeight: 900, fontSize: 22, lineHeight: 1.3, margin: 0 }}>
            Assista ao vídeo e descubra como ativar o{' '}
            <span style={{ color: PINK }}>Efeito Caneta Natural</span>{' '}
            em 21 dias, sem remédio e sem sofrimento
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Treinos curtos, plano alimentar inteligente, shot metabólico natural e desafio diário para acelerar o metabolismo, controlar a fome e desinchar.
          </p>
        </div>

        {/* Vídeo vertical 9:16 */}
        <div style={{
          position: 'relative',
          borderRadius: 24, overflow: 'hidden', marginBottom: 20,
          background: '#000', border: `1px solid #FCE7F3`,
          aspectRatio: '9/16', maxWidth: 320, width: '100%',
          margin: '0 auto 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <video
            ref={videoRef}
            src="/vsl.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            controls={!muted}
            onClick={muted ? unmuteVideo : undefined}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: muted ? 'pointer' : 'default' }}
          />
          {muted && (
            <button
              onClick={unmuteVideo}
              style={{
                ...BTN,
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 12, padding: 16,
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
              }}
              aria-label="Ativar som do vídeo"
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
                boxShadow: `0 6px 24px ${PINK}88`,
                fontSize: 30,
              }}>
                🔊
              </div>
              <span style={{
                fontWeight: 900, fontSize: 15, textAlign: 'center',
                background: 'rgba(0,0,0,0.55)', padding: '8px 14px', borderRadius: 999,
              }}>
                Toque para ativar o som
              </span>
            </button>
          )}
        </div>

        <button onClick={scrollToOferta} style={{
          ...BTN,
          width: '100%', color: '#fff', fontWeight: 900, fontSize: 18,
          padding: '18px 0', borderRadius: 16, marginBottom: 32,
          background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
          boxShadow: `0 4px 20px ${PINK}55`,
        }}>
          💊 Quero começar meu protocolo hoje →
        </button>

        {/* Benefícios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', color: PINK, margin: 0 }}>✨ O protocolo age em 4 frentes</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 8,
                border: '1px solid #FCE7F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 22 }}>{b.icon}</span>
                <p style={{ color: '#111', fontWeight: 900, fontSize: 13, lineHeight: 1.3, margin: 0 }}>{b.title}</p>
                <p style={{ color: '#9ca3af', fontSize: 12, lineHeight: 1.4, margin: 0 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* O que você recebe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: PINK, margin: 0 }}>📦 O que você recebe</p>
          {ENTREGAVEIS.map((e, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 16,
              display: 'flex', alignItems: 'flex-start', gap: 14,
              border: '1px solid #FCE7F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
                background: '#FFF0F7', border: `1px solid ${PINK}25`,
              }}>
                {e.icon}
              </div>
              <div>
                <p style={{ color: '#111', fontWeight: 900, fontSize: 14, margin: '0 0 4px' }}>{e.title}</p>
                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.4, margin: 0 }}>{e.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Antes e depois */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', color: PINK, margin: 0 }}>📸 Resultados reais de alunas</p>
          {['/ante - e - depois -1.jpg', '/antes - e - depois -2.jpg'].map((src, i) => (
            <div key={i} style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #FCE7F3', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', lineHeight: 0 }}>
              <img src={src} alt="Antes e depois" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
          ))}
          <p style={{ color: '#9ca3af', fontSize: 11, textAlign: 'center', margin: 0 }}>Resultados individuais podem variar</p>
        </div>

        {/* Depoimentos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', color: PINK, margin: 0 }}>💬 O que nossas alunas dizem</p>

          {[
            { img: '/dep1.jpg', nome: 'Camila R.', resultado: 'Perdeu 4kg em 21 dias', texto: '"Segui o protocolo certinho e em 7 dias já senti diferença no inchaço. Em 3 semanas minha roupa estava folgada!"' },
            { img: '/dep2.jpg', nome: 'Fernanda A.', resultado: 'Controlou a fome em 6 dias', texto: '"A fome fora de hora sumiu na primeira semana. O shot metabólico é incrível. Me arrependo de não ter começado antes!"' },
            { img: '/dep3.jpg', nome: 'Juliana M.', resultado: 'Desinchada e mais leve', texto: '"Nunca pensei que ia funcionar sem academia pesada. Os treinos curtos encaixaram na minha rotina e o resultado veio!"' },
          ].map((d, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
              border: '1px solid #FCE7F3', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={d.img} alt={d.nome} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${PINK}40` }} />
                <div>
                  <p style={{ color: '#111', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{d.nome}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: PINK, margin: '0 0 3px' }}>{d.resultado}</p>
                  <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_, j) => <span key={j} style={{ color: PINK, fontSize: 11 }}>★</span>)}</div>
                </div>
              </div>
              <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{d.texto}</p>
            </div>
          ))}

          {['/depoimento 1.1.jpg', '/depoimento 2.2.jpg'].map((src, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #FCE7F3', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', lineHeight: 0 }}>
              <img src={src} alt="Depoimento" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Para quem é */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: PINK, margin: 0 }}>🎯 Para quem é esse protocolo</p>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid #FCE7F3' }}>
            {[
              'Para quem quer emagrecer de forma natural e sem remédios',
              'Para quem sente fome fora de hora e não consegue controlar',
              'Para quem vive inchada e quer se sentir mais leve',
              'Para quem não consegue manter dietas restritivas',
              'Para quem quer um plano simples, guiado e prático',
              'Para quem quer começar hoje sem depender de academia pesada',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: PINK, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.45, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Oferta */}
        <div ref={ofertaRef} style={{
          background: '#fff', borderRadius: 24, padding: 24, marginBottom: 24,
          display: 'flex', flexDirection: 'column', gap: 20,
          border: `2px solid ${PINK}`, boxShadow: `0 4px 24px ${PINK}22`,
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: PINK, margin: 0 }}>🔥 Oferta Especial por Tempo Limitado</p>
            <h2 style={{ color: '#111', fontWeight: 900, fontSize: 20, lineHeight: 1.3, margin: 0 }}>Protocolo Efeito Caneta Natural — 21 Dias</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <p style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'line-through', margin: 0 }}>De R$197,00</p>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Por apenas</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <p style={{ fontWeight: 900, fontSize: 64, lineHeight: 1, color: PINK, margin: 0 }}>R$67</p>
              <p style={{ fontWeight: 900, fontSize: 28, lineHeight: 1, marginBottom: 8, color: PINK, margin: '0 0 8px' }}>,00</p>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>ou 12x de R$6,80 · acesso imediato</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0', borderTop: '1px solid #fce7f3', borderBottom: '1px solid #fce7f3' }}>
            {['Protocolo completo de 21 dias', 'Treinos estratégicos', 'Plano alimentar inteligente', 'Receita do shot metabólico natural', 'Desafio diário guiado', 'Acesso imediato', 'Garantia de 7 dias'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: PINK, fontSize: 14 }}>✓</span>
                <p style={{ color: '#374151', fontSize: 14, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, background: '#fefce8', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🛡️</span>
            <div>
              <p style={{ color: '#92400e', fontWeight: 900, fontSize: 13, margin: '0 0 4px' }}>Garantia de 7 dias risco zero</p>
              <p style={{ color: '#b45309', fontSize: 12, lineHeight: 1.4, margin: 0 }}>
                Não gostou? Devolvemos <strong>100% do dinheiro</strong>. Sem perguntas.
              </p>
            </div>
          </div>

          <button onClick={goToCheckout} style={{
            ...BTN,
            width: '100%', color: '#fff', fontWeight: 900, fontSize: 20,
            padding: '18px 0', borderRadius: 16,
            background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
            boxShadow: `0 4px 20px ${PINK}55`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span>COMECE HOJE MESMO</span>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>⚡ Acesso imediato após o pagamento</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['💳 Cartão', '📱 PIX', '🔒 SSL', '⚡ Imediato'].map((s, i) => (
              <span key={i} style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Garantia */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 20, marginBottom: 32,
          display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center',
          border: '1px solid #FDE68A', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <span style={{ fontSize: 48 }}>🛡️</span>
          <h3 style={{ color: '#111', fontWeight: 900, fontSize: 18, margin: 0 }}>7 dias de garantia risco zero</h3>
          <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Você pode acessar o protocolo, conhecer o conteúdo e testar com tranquilidade. Se sentir que não é para você, basta solicitar o reembolso dentro do prazo e devolvemos 100% do valor — sem burocracia.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: PINK, margin: '0 0 8px' }}>❓ Perguntas frequentes</p>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #FCE7F3' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  ...BTN,
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', textAlign: 'left', gap: 12, background: 'transparent',
                }}
              >
                <span style={{ color: '#111', fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ fontWeight: 900, fontSize: 20, flexShrink: 0, color: PINK }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 16px 16px' }}>
                  <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={goToCheckout} style={{
            ...BTN,
            width: '100%', color: '#fff', fontWeight: 900, fontSize: 20,
            padding: '18px 0', borderRadius: 16,
            background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
            boxShadow: `0 4px 20px ${PINK}55`,
          }}>
            💊 COMECE HOJE MESMO
          </button>
          <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', margin: 0 }}>
            ⏰ Expira em {mins}:{secs} · 🔒 Seguro · 🛡️ Garantia 7 dias
          </p>
        </div>

      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: '#fff', borderTop: '1px solid #fce7f3',
        paddingTop: 12, paddingLeft: 20, paddingRight: 20,
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', justifyContent: 'center',
      }}>
        <button onClick={goToCheckout} style={{
          ...BTN,
          color: '#fff', fontWeight: 900, fontSize: 16,
          padding: '16px 24px', borderRadius: 16, width: '100%', maxWidth: 430,
          background: `linear-gradient(135deg, ${PINK2}, ${PINK})`,
          boxShadow: `0 4px 16px ${PINK}55`,
        }}>
          💊 R$67,00 · Começar Agora · Garantia 7 dias
        </button>
      </div>

    </div>
  )
}

export default function ECNSales() {
  return <Suspense fallback={null}><ECNSalesInner /></Suspense>
}
