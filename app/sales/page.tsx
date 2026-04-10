'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import StatusBar from '@/components/StatusBar'
import { initiateCheckout } from '@/lib/pixel'
import { trackStep } from '@/lib/analytics'

const FAQS = [
  {
    q: 'Quanto tempo leva pra ver resultado?',
    a: 'A maioria das alunas relata sentir diferença já nas primeiras 2 semanas. Resultados visíveis no corpo geralmente aparecem entre 30 e 60 dias seguindo o método.',
  },
  {
    q: 'Preciso de equipamentos ou academia?',
    a: 'Não. Temos treinos completos para fazer em casa, sem equipamentos. Também temos versões para academia, você escolhe o que funciona melhor pra sua rotina.',
  },
  {
    q: 'Funciona pra qualquer idade?',
    a: 'Sim. O programa foi desenvolvido para mulheres de todas as idades e níveis. Os treinos são adaptáveis e o acompanhamento é personalizado.',
  },
  {
    q: 'E se eu não conseguir seguir?',
    a: 'É exatamente pra isso que existe o acompanhamento e a comunidade. Você nunca vai estar sozinha. Quando travar, tem alguém pra te apoiar e te colocar de volta nos trilhos.',
  },
  {
    q: 'Tem garantia?',
    a: 'Sim. 7 dias de garantia incondicional. Se por qualquer motivo você não gostar, devolvemos 100% do seu dinheiro sem perguntas.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Vandeilma',
    result: 'Perdeu 14kg em 90 dias',
    text: 'Nunca imaginei que conseguiria. Tentei de tudo antes e nada funcionava. Com o método da Giovanna foi diferente — finalmente entendi o que estava fazendo de errado.',
    initials: 'VA',
    color: 'bg-green-600',
  },
  {
    name: 'Aluna Start',
    result: 'Eliminou 7,2kg e ganhou 3kg de massa magra',
    text: 'O que me surpreendeu foi o suporte. Qualquer dúvida, qualquer trava, sempre tinha alguém pra me ajudar. Me senti parte de algo maior.',
    initials: 'AS',
    color: 'bg-green-500',
  },
  {
    name: 'Josi',
    result: 'Perdeu 6,2kg seguindo o método',
    text: 'Comecei sem acreditar muito. Em 3 semanas já sentia diferença nas roupas. O treino de 20 minutos cabe direitinho na minha rotina de mãe.',
    initials: 'JO',
    color: 'bg-emerald-500',
  },
]

const FEATURES = [
  { icon: '📋', title: 'Plano Personalizado', desc: 'Treinos adaptados ao seu nível e objetivo' },
  { icon: '⏱️', title: '15–30 min por dia', desc: 'Rotinas que cabem em qualquer agenda' },
  { icon: '👯', title: 'Comunidade Exclusiva', desc: 'Milhares de mulheres juntas no mesmo caminho' },
  { icon: '📅', title: 'Acompanhamento 6 meses', desc: 'Você nunca mais vai se sentir sozinha' },
]

const PAINS = [
  'Começa motivada... e para em 2 semanas',
  'Já tentou todas as dietas e nenhuma funcionou',
  'Perdeu peso e ganhou tudo de volta',
  'Sente que algo está errado com você',
]

function sendServerEvent(eventName: string) {
  fetch('/api/pixel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventSourceUrl: window.location.href,
      clientUserAgent: navigator.userAgent,
      fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] ?? '',
      fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] ?? '',
    }),
  }).catch(() => {})
}

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SalesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [vagas, setVagas] = useState(7)

  useEffect(() => { trackStep('Vendas', 6) }, [])

  useEffect(() => {
    const TIMER_KEY = '_funnel_timer'
    const VAGAS_KEY = '_funnel_vagas'

    // Timer — persiste por 24h desde a primeira visita
    const saved = localStorage.getItem(TIMER_KEY)
    let expiry: number
    if (saved) {
      const parsed = parseInt(saved)
      expiry = (!isNaN(parsed) && parsed > Date.now()) ? parsed : Date.now() + 24 * 60 * 60 * 1000
    } else {
      expiry = Date.now() + 24 * 60 * 60 * 1000
    }
    localStorage.setItem(TIMER_KEY, String(expiry))

    // Vagas — fixo por sessão, começa em número entre 5-8
    const savedVagas = localStorage.getItem(VAGAS_KEY)
    if (savedVagas) {
      setVagas(parseInt(savedVagas))
    } else {
      const initial = Math.floor(Math.random() * 4) + 5 // 5–8
      localStorage.setItem(VAGAS_KEY, String(initial))
      setVagas(initial)
    }

    const tick = () => setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const [showExitPopup, setShowExitPopup] = useState(false)
  const exitShownRef = useRef(false)

  useEffect(() => {
    const SHOWN_KEY = '_exit_popup_shown'
    if (localStorage.getItem(SHOWN_KEY)) return

    // Desktop: mouse sai pelo topo (indo fechar a aba)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShownRef.current) {
        exitShownRef.current = true
        localStorage.setItem(SHOWN_KEY, '1')
        setShowExitPopup(true)
      }
    }

    // Mobile: visibilidade perdida (troca de aba / minimiza)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && !exitShownRef.current) {
        exitShownRef.current = true
        localStorage.setItem(SHOWN_KEY, '1')
        setShowExitPopup(true)
      }
    }

    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const handleCheckout = useCallback(() => {
    initiateCheckout()
    sendServerEvent('InitiateCheckout')
  }, [])

  return (
    <div className="mobile-frame bg-[#0A0A0A] overflow-y-auto" style={{ minHeight: '100dvh' }}>

      {/* Status bar */}
      <div className="sticky top-0 z-50 bg-[#0A0A0A]">
        <StatusBar dark={true} />
      </div>

      {/* ── URGÊNCIA STICKY ───────────────────────────────────────── */}
      <div className="sticky top-[28px] z-40 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-sm border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-red-400 text-base flex-shrink-0 animate-pulse">🔥</span>
          <div className="min-w-0">
            <p className="text-white text-[11px] font-semibold leading-tight truncate">Oferta expira em:</p>
            <p className="text-red-300 font-black text-base leading-tight tabular-nums">{formatCountdown(timeLeft)}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-red-500/30 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-yellow-400 text-base">⚠️</span>
          <div className="text-right">
            <p className="text-white text-[11px] font-semibold leading-tight">Restam apenas</p>
            <p className="text-yellow-300 font-black text-base leading-tight">{vagas} vagas</p>
          </div>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-5 pt-6 pb-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#22C55E]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
            🔓 Acesso Liberado
          </span>

          <h1 className="text-white text-3xl font-black leading-tight break-words">
            O sistema que faz você <span className="text-[#22C55E]">manter o resultado</span>
          </h1>

          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Chega de começar e parar. Descubra o método que milhares de mulheres usam para transformar o corpo sem sofrer.
          </p>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 mt-2">
            <div className="flex -space-x-2">
              {['VA', 'JO', 'AS', 'CA'].map((init, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] border-2 border-[#0A0A0A] flex items-center justify-center text-white text-[9px] font-bold">
                  {init}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">+2.847 mulheres</p>
              <p className="text-white/50 text-xs">já transformaram suas vidas</p>
            </div>
          </div>

          <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" onClick={handleCheckout} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base py-4 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mt-2 text-center block">
            QUERO COMEÇAR AGORA
          </a>
        </div>
      </section>

      {/* ── PAIN POINTS ───────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-black text-xl mb-4 text-center">Você se identifica?</h2>
          <div className="flex flex-col gap-3">
            {PAINS.map((pain, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">✗</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVELATION ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="relative bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/10 border border-[#22C55E]/30 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 blur-2xl rounded-full pointer-events-none" />
          <h2 className="text-white font-black text-xl mb-3 relative z-10">
            O problema nunca foi <span className="text-[#22C55E]">você</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4 relative z-10">
            Você foi colocada num sistema impossível de manter: treinos genéricos, dietas extremas, sem acompanhamento.
          </p>
          <div className="bg-black/40 rounded-xl px-4 py-3 relative z-10">
            <p className="text-white text-sm font-semibold text-center leading-relaxed">
              O que separa quem consegue de quem desiste é ter um{' '}
              <span className="text-[#22C55E] font-black">SISTEMA.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCT ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="flex flex-col items-center gap-1 mb-6 text-center">
          <div className="flex items-center gap-2 mb-1 w-full">
            <div className="h-px flex-1 bg-[#22C55E]/30" />
            <span className="text-[#22C55E] text-xs font-bold tracking-widest uppercase whitespace-nowrap">O Programa</span>
            <div className="h-px flex-1 bg-[#22C55E]/30" />
          </div>
          <h2 className="text-white font-black text-2xl">START EMPODERADA</h2>
          <p className="text-white/50 text-sm">O programa que transforma seu corpo de forma sustentável</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-white font-bold text-sm leading-tight">{f.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEMBERS AREA ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <h2 className="text-white font-black text-xl mb-2 text-center">Acesso Imediato à Área de Membros</h2>
        <p className="text-white/50 text-sm text-center mb-5">Veja o que você vai receber assim que entrar</p>

        <div className="bg-gradient-to-br from-[#0a160a] to-[#0a0a0a] border border-[#22C55E]/30 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/80" />
            <p className="text-white text-xs font-bold tracking-wide">Área de Membros — Start Empoderada</p>
          </div>
          {/* Screenshot real da área de membros */}
          <div className="relative w-full">
            <img
              src="/area-membros.jpg"
              alt="Área de membros Start Empoderada"
              className="w-full object-cover"
            />
            {/* Fade inferior para transição suave */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#16213e] to-transparent" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#22C55E] font-black text-2xl">5+</p>
              <p className="text-white/50 text-xs">Módulos Completos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#22C55E] font-black text-2xl">14+</p>
              <p className="text-white/50 text-xs">Aulas Práticas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <h2 className="text-white font-black text-xl mb-1 text-center">Depoimentos das Empoderadas</h2>
        <p className="text-white/40 text-sm text-center mb-5">Resultados reais de alunas reais</p>

        <div className="flex flex-col gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Imagem do depoimento */}
              <img
                src={`/${i + 1}.jpg`}
                alt={`Depoimento de ${t.name}`}
                className="w-full object-cover"
              />
              {/* Info abaixo da imagem */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-[#22C55E] text-xs font-semibold">{t.result}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <span className="text-[#22C55E] text-lg">🏆</span>
          <p className="text-white/70 text-sm font-medium">+2.847 mulheres já transformaram suas vidas</p>
        </div>
      </section>

      {/* ── OFFER ─────────────────────────────────────────────────── */}
      <section id="oferta" className="px-4 sm:px-6 pb-10">
        <div className="relative bg-gradient-to-br from-[#0a160a] to-[#0a0a0a] border-2 border-[#22C55E]/50 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />

          <div className="p-5 flex flex-col gap-5">
            <div className="text-center">
              <span className="bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold px-3 py-1 rounded-full">
                ⚡ Oferta Especial
              </span>
              <h2 className="text-white font-black text-2xl mt-3">Start Empoderada</h2>
              <p className="text-white/40 text-sm line-through mt-1">De R$ 997,00</p>
              <p className="text-white/60 text-base font-semibold mt-1">Por apenas</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-white/60 text-xl font-bold self-start mt-3">R$</span>
                <span className="text-white font-black text-6xl leading-none">397</span>
              </div>
              <p className="text-white/50 text-sm mt-1">ou 12x de <strong className="text-white">R$41,01</strong></p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                'Acesso completo ao sistema',
                'Treinos para fazer em casa',
                'Treinos para fazer na academia',
                'Guia alimentar prático',
                'Comunidade exclusiva',
                'Acompanhamento por 6 meses',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#22C55E] text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
              {['Bônus: Lives em grupo', 'Bônus: Desafios mensais'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 text-[10px] font-bold">★</span>
                  </div>
                  <span className="text-yellow-300/80 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Urgência inline */}
            <div className="bg-red-950/60 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-red-400 animate-pulse">🔥</span>
                <div>
                  <p className="text-white/60 text-[10px]">Oferta expira em</p>
                  <p className="text-red-300 font-black text-base tabular-nums leading-none">{formatCountdown(timeLeft)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px]">Vagas restantes</p>
                <p className="text-yellow-300 font-black text-base leading-none">{vagas} vagas</p>
              </div>
            </div>

            <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 text-center block">
              QUERO COMEÇAR AGORA
            </a>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🔒', label: 'Compra segura' },
                { icon: '↩️', label: '7 dias de garantia' },
                { icon: '💬', label: 'Suporte no WhatsApp' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{b.icon}</span>
                  <p className="text-white/40 text-xs text-center leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-10">
        <a
          href="https://wa.me/5511915306467?text=Ol%C3%A1%20Geo%2C%20quero%20mais%20informa%C3%A7%C3%B5es%20dos%20seus%20m%C3%A9todos..."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-[#15803D] font-bold text-sm py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Dúvidas? Me chama no WhatsApp
        </a>

        <h2 className="text-white font-black text-xl mb-5 text-center">Dúvidas Frequentes</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-white text-sm font-semibold pr-3 leading-snug">{faq.q}</span>
                <span className={`text-[#22C55E] text-xl font-light flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-white/60 text-sm leading-relaxed border-t border-white/10 pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-14">
        <div className="relative bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5 border border-[#22C55E]/30 rounded-2xl p-6 flex flex-col items-center gap-5 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#22C55E20_0%,_transparent_70%)] pointer-events-none" />
          <p className="text-white/60 text-sm leading-relaxed relative z-10">
            Você chegou até aqui por um motivo.<br />
            <strong className="text-white">Não deixa essa oportunidade passar.</strong>
          </p>
          <a href="https://pay.cakto.com.br/36sdo2o_810308" target="_blank" rel="noopener noreferrer" className="relative z-10 w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 text-center block">
            QUERO COMEÇAR AGORA
          </a>
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
            <p className="text-white/40 text-xs">+2.847 mulheres transformadas</p>
          </div>
        </div>
      </section>

      {/* ── BOTÃO FLUTUANTE WHATSAPP ──────────────────────────────── */}
      <a
        href="https://wa.me/5511915306467?text=Ol%C3%A1%20Geo%2C%20quero%20mais%20informa%C3%A7%C3%B5es%20dos%20seus%20m%C3%A9todos..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-4 py-3 rounded-full shadow-2xl shadow-green-500/40 active:scale-95 transition-all duration-200 hover:bg-[#1ebe5d]"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Falar com a Giovanna</span>
      </a>

      {/* ── EXIT INTENT POPUP ─────────────────────────────────────── */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#0f1f0f] border border-[#22C55E]/40 rounded-3xl overflow-hidden shadow-2xl shadow-green-900/50">

            {/* Linha de destaque topo */}
            <div className="h-1 w-full bg-gradient-to-r from-[#22C55E] via-[#4ade80] to-[#22C55E]" />

            <div className="p-6 flex flex-col gap-4">
              {/* Ícone + título */}
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl">🚨</span>
                <h2 className="text-white font-black text-xl leading-tight">
                  Espera! Antes de ir...
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Você está saindo sem garantir sua vaga. As vagas estão acabando rápido.
                </p>
              </div>

              {/* Oferta em destaque */}
              <div className="bg-black/40 border border-[#22C55E]/20 rounded-2xl px-4 py-4 flex flex-col items-center gap-1 text-center">
                <p className="text-white/50 text-xs line-through">De R$ 997,00</p>
                <div className="flex items-end gap-1">
                  <span className="text-white/60 text-base font-bold self-start mt-1">R$</span>
                  <span className="text-white font-black text-5xl leading-none">397</span>
                </div>
                <p className="text-white/50 text-xs mt-1">ou 12x de <strong className="text-white">R$41,01</strong></p>
                <div className="flex items-center gap-2 mt-2 bg-red-950/60 border border-red-500/30 rounded-xl px-3 py-2">
                  <span className="text-red-400 animate-pulse text-sm">🔥</span>
                  <p className="text-red-300 font-black text-sm tabular-nums">{formatCountdown(timeLeft)}</p>
                  <span className="text-white/30 text-xs">restando</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <a
                  href="https://pay.cakto.com.br/36sdo2o_810308"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCheckout}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 text-center block"
                >
                  QUERO GARANTIR MINHA VAGA
                </a>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="w-full text-white/30 text-xs py-2 hover:text-white/50 transition-colors"
                >
                  Não, prefiro perder essa oportunidade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
