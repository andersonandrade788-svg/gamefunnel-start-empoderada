'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

const PASSWORD = 'SISTEMA747'
const TOTAL_SECONDS = 10 * 60 // 10 minutos

export default function AcessoPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [glitch, setGlitch] = useState(false)

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Efeito glitch periódico
  useEffect(() => {
    const trigger = () => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 400)
    }
    const interval = setInterval(trigger, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PASSWORD)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const isExpired = timeLeft === 0
  const urgency = timeLeft < 120 // últimos 2 min

  return (
    <div className="mobile-frame bg-[#0A0A0A] flex flex-col items-center justify-between py-10 px-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-50">
        <StatusBar dark={true} />
      </div>

      {/* Spacing after status bar */}
      <div className="pt-6" />

      {/* Fundo animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/60 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/60 animate-pulse" />
      </div>

      {/* Topo */}
      <div className="w-full flex flex-col items-center gap-2 mt-4">
        <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/50 rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span className="text-red-400 text-sm font-bold tracking-widest uppercase">Acesso Restrito</span>
        </div>

        <h1 className={`text-white text-2xl font-black text-center leading-tight mt-3 ${glitch ? 'opacity-60 translate-x-0.5' : ''} transition-all duration-75`}>
          use a senha para<br />
          <span className="text-[#E91E8C]">desbloquear o método</span>
        </h1>

        <p className="text-white/50 text-sm text-center mt-1">
          cole a senha que você anotou no WhatsApp
        </p>
      </div>

      {/* Card central */}
      <div className="w-full flex flex-col items-center gap-4">

        {/* Senha */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3">
          <p className="text-white/40 text-sm tracking-wider uppercase">sua senha</p>
          <div
            className={`bg-black border-2 ${urgency ? 'border-red-500 animate-pulse' : 'border-[#E91E8C]/60'} rounded-xl py-4 px-6 w-full text-center`}
          >
            <span className={`font-black text-2xl md:text-3xl tracking-wider ${glitch ? 'text-red-400' : 'text-[#E91E8C]'} transition-colors duration-75`}>
              {PASSWORD}
            </span>
          </div>

          {/* Botão copiar */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
            }`}
          >
            {copied ? (
              <>✓ Copiado!</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copiar senha
              </>
            )}
          </button>
        </div>

        {/* Countdown */}
        <div className={`w-full rounded-xl p-4 flex flex-col items-center gap-1 border ${
          isExpired
            ? 'bg-red-900/30 border-red-500'
            : urgency
            ? 'bg-red-900/20 border-red-500/50 animate-pulse'
            : 'bg-white/5 border-white/10'
        }`}>
          {isExpired ? (
            <p className="text-red-400 font-bold text-sm text-center">⛔ tempo esgotado — o acesso foi encerrado</p>
          ) : (
            <>
              <p className="text-white/40 text-xs uppercase tracking-wider">esse acesso expira em</p>
              <div className="flex items-center gap-1">
                <span className={`font-black text-4xl tabular-nums ${urgency ? 'text-red-400' : 'text-white'}`}>
                  {minutes}
                </span>
                <span className={`font-black text-2xl ${urgency ? 'text-red-400' : 'text-white/60'}`}>:</span>
                <span className={`font-black text-4xl tabular-nums ${urgency ? 'text-red-400' : 'text-white'}`}>
                  {seconds}
                </span>
              </div>
              <p className="text-white/30 text-xs text-center">após esse tempo o conteúdo é removido</p>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-3">
        {!isExpired && (
          <button
            onClick={() => router.push('/imc')}
            className="w-full btn-gradient text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 relative overflow-hidden"
          >
            <span className="relative z-10">ACESSAR O MÉTODO →</span>
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />
          </button>
        )}
        {isExpired && (
          <div className="w-full bg-red-900/40 border border-red-500/50 rounded-2xl py-5 px-4 text-center">
            <p className="text-red-400 font-bold">acesso encerrado</p>
            <p className="text-red-400/60 text-xs mt-1">volte ao início para gerar um novo acesso</p>
          </div>
        )}
        <p className="text-white/20 text-xs text-center">
          conteúdo exclusivo • acesso monitorado
        </p>
      </div>
    </div>
  )
}
