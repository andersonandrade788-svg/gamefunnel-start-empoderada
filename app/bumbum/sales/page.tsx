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

function BumbumSalesInner() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(900)
  const [showExit, setShowExit] = useState(false)
  const [viewers, setViewers] = useState(0)
  const exitTriggered = useRef(false)

  const perfil = searchParams.get('perfil') ?? 'intermediario'
  const profileLabel = PROFILE_LABELS[perfil] ?? PROFILE_LABELS.intermediario

  useEffect(() => {
    trackStep('Bumbum_Vendas', 4)
    setViewers(Math.floor(Math.random() * 30) + 40)
    const iv = setInterval(() => setViewers(v => Math.max(30, v + Math.floor(Math.random() * 5) - 2)), 5000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Desktop: mouse sai pelo topo
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 10 && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    // Mobile: usuário troca de aba ou minimiza
    function handleVisibility() {
      if (document.visibilityState === 'hidden' && !exitTriggered.current) {
        exitTriggered.current = true
        setShowExit(true)
      }
    }
    // Mobile: scroll rápido para cima (gesto de saída)
    let lastY = window.scrollY
    let lastTime = Date.now()
    function handleScroll() {
      const now = Date.now()
      const dy = window.scrollY - lastY
      const dt = now - lastTime
      // velocidade negativa rápida = scrollando para cima com força
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
    <div className="w-full overflow-x-hidden" style={{ background: '#0D0005', minHeight: '100dvh' }}>

      {/* Exit popup */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div style={{ background: '#1A0010', border: '2px solid #E91E8C' }} className="rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4">
            <button onClick={() => setShowExit(false)} className="self-end text-white/40 text-xl font-bold">✕</button>
            <div className="text-center flex flex-col gap-3">
              <span className="text-5xl">🍑</span>
              <h3 className="text-white font-black text-xl leading-tight">Espera! Temos uma oferta especial para você</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Porque você fez o diagnóstico, temos um desconto exclusivo reservado para você.
              </p>
              <div style={{ background: '#E91E8C20', border: '1px solid #E91E8C50' }} className="rounded-2xl p-3">
                <p className="text-white/50 text-xs line-through">De R$197,00</p>
                <p className="text-white font-black text-sm">Por apenas</p>
                <p style={{ color: '#FFD700' }} className="font-black text-3xl">R$37,00</p>
                <p className="text-white/50 text-xs">primeiro mês</p>
              </div>
              <button
                onClick={handleCheckout}
                style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
                className="w-full text-white font-black text-base py-4 rounded-2xl active:scale-95 transition-all"
              >
                🔥 QUERO COM DESCONTO AGORA
              </button>
              <button onClick={() => setShowExit(false)} className="text-white/30 text-xs">
                Não, prefiro pagar mais caro depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Urgência topo */}
      <div style={{ background: 'linear-gradient(90deg, #E91E8C, #C2185B)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Oferta especial expira em {mins}:{secs} — Vagas limitadas
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Header */}
        <div className="pt-6 pb-4 text-center flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs">{viewers} mulheres vendo essa oferta agora</span>
          </div>

          <span className="text-6xl">🍑</span>
          <div>
            <p style={{ color: '#E91E8C' }} className="font-black text-sm uppercase tracking-wider">Protocolo personalizado para {profileLabel}</p>
            <h1 className="text-white font-black text-2xl leading-tight mt-2">
              Desafio do <span style={{ color: '#FFD700' }}>Bumbum Turbinado</span> em 4 Semanas
            </h1>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            O método completo da Geo com treinos específicos para o seu perfil, do seu jeito, no seu lugar.
          </p>
        </div>

        {/* Preço destaque */}
        <div
          style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '2px solid #E91E8C' }}
          className="rounded-3xl p-6 mb-5 text-center flex flex-col gap-2"
        >
          <p style={{ color: '#FFD700' }} className="font-black text-xs uppercase tracking-wider">🔥 Oferta especial por diagnóstico</p>
          <p className="text-white/40 text-sm line-through">De R$197,00</p>
          <div className="flex flex-col items-center">
            <p className="text-white/60 text-sm">Por apenas</p>
            <p style={{ color: '#FFD700' }} className="font-black text-5xl leading-none">R$37</p>
            <p style={{ color: '#FFD700' }} className="font-black text-lg">,00</p>
            <p className="text-white/40 text-xs mt-1">no primeiro mês · cancele quando quiser</p>
          </div>
          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mt-2"
          >
            🍑 QUERO COMEÇAR AGORA
          </button>
          <p className="text-white/30 text-xs">🔒 Pagamento seguro · Acesso imediato</p>
        </div>

        {/* O que está incluído */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider">✨ O que você recebe:</p>
          {[
            { icon: '📱', title: 'Protocolo de 4 Semanas', desc: 'Treinos diários com vídeos explicativos, passo a passo para o seu nível' },
            { icon: '🍑', title: 'Método Geo de Ativação Glútea', desc: 'A técnica exclusiva que faz o bumbum crescer de verdade, sem truques' },
            { icon: '🏠', title: 'Casa ou Academia', desc: 'Adaptações para qualquer ambiente — com ou sem equipamento' },
            { icon: '📊', title: 'Protocolo para Seu Perfil', desc: `Treinos específicos para ${profileLabel} — não é genérico, é feito para você` },
            { icon: '💬', title: 'Suporte no Grupo VIP', desc: 'Acesso à comunidade exclusiva com outras alunas e acompanhamento' },
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

        {/* Garantia */}
        <div style={{ background: '#1A0010', border: '2px solid #FFD70050' }} className="rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-4xl flex-shrink-0">🛡️</span>
          <div>
            <p style={{ color: '#FFD700' }} className="font-black text-sm">Garantia Total de 7 Dias</p>
            <p className="text-white/50 text-xs leading-relaxed mt-1">
              Se em 7 dias você não estiver satisfeita, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
            </p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm text-center">O QUE NOSSAS ALUNAS DIZEM:</p>
          {[
            { nome: 'Camila R.', resultado: 'Bumbum cresceu 4cm em 28 dias', texto: '"Nunca acreditei que conseguiria resultado tão rápido. O protocolo foi certeiro — ele identificou exatamente meu problema e mudou tudo!"' },
            { nome: 'Jéssica M.', resultado: 'Perdeu a flacidez em 3 semanas', texto: '"Treino há anos mas nunca vi resultado assim. O método da Geo é diferente de tudo que já fiz. Bumbum firme, empinado e perfeito!"' },
            { nome: 'Patrícia V.', resultado: 'Resultado visível em 10 dias', texto: '"Estava desanimada depois de tantas tentativas. Com o diagnóstico e o protocolo certo, em menos de 2 semanas já senti a diferença!"' },
          ].map((d, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{d.nome}</p>
                  <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>{d.resultado}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
              </div>
              <p className="text-white/50 text-xs leading-relaxed italic">{d.texto}</p>
            </div>
          ))}
        </div>

        {/* Prova social */}
        <div style={{ background: '#1A0010', border: '1px solid #FFD70030' }} className="rounded-2xl p-4 flex items-center gap-3 mb-6">
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-white font-black text-sm">+3.200 mulheres transformadas</p>
            <p className="text-white/40 text-xs">já seguiram o protocolo e mudaram o corpo</p>
          </div>
        </div>

        {/* CTA final */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 GARANTIR MINHA VAGA POR R$37
          </button>
          <p className="text-white/30 text-xs text-center">
            ⏰ Oferta expira em {mins}:{secs} · 🔒 Pagamento 100% seguro · Cancele quando quiser
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
