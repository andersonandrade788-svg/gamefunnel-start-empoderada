'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useRef } from 'react'
import { trackStep } from '@/lib/analytics'
import { initiateCheckout } from '@/lib/pixel'

const CHECKOUT_URL = 'https://pay.cakto.com.br/bumbum' // TODO: trocar pelo link real

const PROFILE_LABELS: Record<string, string> = {
  iniciante: 'Iniciante Determinada',
  intermediario: 'Guerreira Estagnada',
  avancado: 'Atleta de Alta Performance',
}

const FAQ = [
  {
    q: 'Funciona para quem nunca treinou?',
    a: 'Sim! O protocolo tem versão para iniciantes completas. Você recebe treinos adaptados ao seu nível, começando do zero com exercícios simples e progredindo no ritmo certo.',
  },
  {
    q: 'Precisa de academia ou equipamento?',
    a: 'Não! O método funciona em casa, sem equipamento. Se tiver elástico ou haltere, ainda melhor — mas não é obrigatório.',
  },
  {
    q: 'Em quanto tempo vejo resultado?',
    a: 'A maioria das alunas sente diferença na firmeza entre 7 e 10 dias. Resultado visual mais evidente aparece entre a 2ª e 3ª semana seguindo o protocolo.',
  },
  {
    q: 'Como funciona o cancelamento?',
    a: 'Cancele quando quiser, sem burocracia. Basta enviar uma mensagem para o suporte e cancelamos na hora, sem perguntas.',
  },
]

function BumbumSalesInner() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(900)
  const [showExit, setShowExit] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [buyers, setBuyers] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const exitTriggered = useRef(false)

  const perfil = searchParams.get('perfil') ?? 'intermediario'
  const profileLabel = PROFILE_LABELS[perfil] ?? PROFILE_LABELS.intermediario

  useEffect(() => {
    trackStep('Bumbum_Vendas', 4)
    setViewers(Math.floor(Math.random() * 30) + 40)
    setBuyers(Math.floor(Math.random() * 12) + 18)
    const iv = setInterval(() => {
      setViewers(v => Math.max(30, v + Math.floor(Math.random() * 5) - 2))
      if (Math.random() > 0.7) setBuyers(v => v + 1)
    }, 6000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 10 && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    function handleVisibility() {
      if (document.visibilityState === 'hidden' && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    let lastY = window.scrollY
    let lastTime = Date.now()
    function handleScroll() {
      const now = Date.now()
      const dy = window.scrollY - lastY
      const dt = now - lastTime
      if (dy < -60 && dt < 200 && window.scrollY < 200 && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
      lastY = window.scrollY
      lastTime = now
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function handleCheckout() {
    initiateCheckout()
    const params = searchParams.toString()
    const url = params ? `${CHECKOUT_URL}?${params}` : CHECKOUT_URL
    window.location.href = url
  }

  return (
    <div className="bumbum-page" style={{ background: '#0D0005' }}>

      {/* Exit popup */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div style={{ background: '#1A0010', border: '2px solid #E91E8C' }} className="rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4">
            <button onClick={() => setShowExit(false)} className="self-end text-white/40 text-xl font-bold leading-none">✕</button>
            <div className="text-center flex flex-col gap-3">
              <span className="text-5xl">🍑</span>
              <h3 className="text-white font-black text-xl leading-tight">Espera! Oferta especial só para você</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Porque você fez o diagnóstico, temos um desconto exclusivo reservado.
              </p>
              <div style={{ background: '#E91E8C15', border: '1px solid #E91E8C50' }} className="rounded-2xl p-4 flex flex-col gap-1">
                <p className="text-white/40 text-xs line-through">De R$197,00</p>
                <p style={{ color: '#FFD700' }} className="font-black text-4xl leading-none">R$57,00</p>
                <p className="text-white/40 text-xs">primeiro mês · cancele quando quiser</p>
              </div>
              <button
                onClick={handleCheckout}
                style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                className="w-full text-white font-black text-base py-4 rounded-2xl active:scale-95 transition-all"
              >
                🔥 QUERO COM DESCONTO AGORA
              </button>
              <button onClick={() => setShowExit(false)} className="text-white/25 text-xs">
                Não, prefiro perder essa chance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra topo urgência */}
      <div style={{ background: 'linear-gradient(90deg, #E91E8C, #C2185B)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Oferta especial expira em {mins}:{secs} — Vagas limitadas
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Header */}
        <div className="pt-6 pb-4 text-center flex flex-col gap-3">
          {/* Prova social ao vivo */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-white/40 text-xs">{viewers} vendo agora</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🛒</span>
              <span className="text-white/40 text-xs">{buyers} compraram hoje</span>
            </div>
          </div>

          <span className="text-5xl">🍑</span>
          <div>
            <p style={{ color: '#E91E8C' }} className="font-black text-xs uppercase tracking-wide">Protocolo para {profileLabel}</p>
            <h1 className="text-white font-black text-2xl leading-tight mt-1">
              Desafio do <span style={{ color: '#FFD700' }}>Bumbum Turbinado</span> em 4 Semanas
            </h1>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            O método completo da Geo com treinos específicos para o seu perfil — em casa ou na academia.
          </p>
        </div>

        {/* Bloco de preço */}
        <div
          style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #E91E8C' }}
          className="rounded-3xl p-5 mb-5 text-center flex flex-col gap-3"
        >
          <p style={{ color: '#FFD700' }} className="font-black text-xs uppercase tracking-wider">🔥 Oferta especial por diagnóstico</p>

          <div className="flex flex-col items-center gap-0.5">
            <p className="text-white/40 text-sm line-through">De R$197,00</p>
            <p className="text-white/60 text-sm">Por apenas</p>
            <div className="flex items-end gap-1">
              <p style={{ color: '#FFD700' }} className="font-black text-5xl leading-none">R$57</p>
              <p style={{ color: '#FFD700' }} className="font-black text-xl leading-none mb-1">,00</p>
            </div>
            <p className="text-white/40 text-xs">no primeiro mês · cancele quando quiser</p>
          </div>

          {/* Botão CTA */}
          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 QUERO COMEÇAR AGORA
          </button>

          {/* Selos de pagamento */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['💳 Cartão', '📱 Pix', '🔒 SSL Seguro'].map((s, i) => (
              <span key={i} className="text-white/30 text-[10px] font-bold flex items-center gap-1">{s}</span>
            ))}
          </div>
        </div>

        {/* O que está incluído */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider">✨ O que você recebe:</p>
          {[
            { icon: '📱', title: 'Protocolo de 4 Semanas', desc: 'Treinos diários com vídeos explicativos, passo a passo para o seu nível' },
            { icon: '🍑', title: 'Método Geo de Ativação Glútea', desc: 'A técnica exclusiva que faz o bumbum crescer de verdade, sem truques' },
            { icon: '🏠', title: 'Casa ou Academia', desc: 'Adaptações para qualquer ambiente — com ou sem equipamento' },
            { icon: '📊', title: 'Treino para Seu Perfil', desc: `Protocolo específico para ${profileLabel} — não é genérico, é feito para você` },
            { icon: '💬', title: 'Suporte no Grupo VIP', desc: 'Comunidade exclusiva com outras alunas + acompanhamento direto' },
            { icon: '🎯', title: 'Plano de Alimentação', desc: 'Guia nutricional para potencializar o crescimento muscular' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-xl p-3 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-white font-black text-sm">{item.title}</p>
                <p className="text-white/50 text-xs leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carrossel de depoimentos */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm text-center">RESULTADOS REAIS DAS NOSSAS ALUNAS:</p>

          {/* Container do carrossel — sangra nas bordas para aproveitar a tela toda */}
          <div className="-mx-5">
            <div
              className="flex gap-3 overflow-x-auto px-5 pb-2"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {['/dep-a.jpg', '/dep-b.jpg'].map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl overflow-hidden"
                  style={{
                    width: 'calc(85vw - 20px)',
                    maxWidth: '340px',
                    scrollSnapAlign: 'center',
                    border: '1px solid #E91E8C40',
                    background: '#1A0010',
                  }}
                >
                  <img
                    src={src}
                    alt={`Resultado aluna ${i + 1}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de ponto */}
          <div className="flex justify-center gap-1.5">
            {[0, 1].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#E91E8C' : '#E91E8C30' }} />
            ))}
          </div>
        </div>

        {/* Prova social */}
        <div style={{ background: '#1A0010', border: '1px solid #FFD70030' }} className="rounded-2xl p-4 flex items-center gap-3 mb-6">
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-white font-black text-sm">+3.200 mulheres transformadas</p>
            <p className="text-white/40 text-xs">já seguiram o protocolo e mudaram o corpo</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="flex flex-col gap-2 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider mb-1">❓ Perguntas frequentes</p>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{ background: '#1A0010', border: `1px solid ${openFaq === i ? '#E91E8C60' : '#E91E8C20'}` }}
              className="rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-4 py-4 flex items-center justify-between gap-3"
              >
                <span className="text-white font-bold text-sm leading-snug">{item.q}</span>
                <span className="font-black text-lg flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', color: '#E91E8C' }}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Garantia — ACIMA do CTA final */}
        <div style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #FFD70060' }} className="rounded-2xl p-4 mb-5 flex items-center gap-4">
          <span className="text-5xl flex-shrink-0">🛡️</span>
          <div>
            <p style={{ color: '#FFD700' }} className="font-black text-sm">Garantia Total de 7 Dias</p>
            <p className="text-white/60 text-xs leading-relaxed mt-1">
              Se em 7 dias você não estiver satisfeita, devolvemos <strong className="text-white">100% do seu dinheiro</strong>. Sem perguntas, sem burocracia.
            </p>
          </div>
        </div>

        {/* CTA final */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 GARANTIR MINHA VAGA POR R$57
          </button>
          <p className="text-white/30 text-xs text-center">
            ⏰ Expira em {mins}:{secs} · 🔒 Pagamento seguro · Cancele quando quiser
          </p>
        </div>

      </div>
    </div>
  )
}

export default function BumbumSales() {
  return (
    <Suspense>
      <BumbumSalesInner />
    </Suspense>
  )
}
