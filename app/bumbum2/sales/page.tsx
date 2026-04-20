'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useRef } from 'react'
import { trackStep } from '@/lib/analytics'
import { initiateCheckout } from '@/lib/pixel'

const CHECKOUT_URL_PIX  = 'https://pay.cakto.com.br/3bur66c'
const CHECKOUT_URL_CARD = 'https://pay.cakto.com.br/orhu3er_850513'

const PROFILE_LABELS: Record<string, string> = {
  iniciante:    'Iniciante Determinada',
  intermediario:'Guerreira Estagnada',
  avancado:     'Atleta em Plateau',
}

const STEPS = [
  { icon: '📧', title: 'Acesso no e-mail', desc: 'Link de acesso imediatamente após a compra' },
  { icon: '📱', title: 'Abre no celular', desc: 'Um clique — videoaulas direto no seu celular' },
  { icon: '▶️', title: 'Começa hoje', desc: 'Primeira aula em minutos, protocolo começa agora' },
  { icon: '🍑', title: 'Resultado em 4 semanas', desc: 'Bumbum mais firme, empinado e volumoso', highlight: true },
]

const FAQ = [
  { q: 'Funciona sem academia?', a: 'Sim! Os treinos foram feitos para quem está em casa. Você não precisa de nenhum equipamento.' },
  { q: 'Tenho pouco tempo. Consigo encaixar?', a: 'Os treinos duram de 20 a 30 minutos, 3x por semana. Direto ao ponto, sem enrolação.' },
  { q: 'Já tentei outros métodos. Por que esse é diferente?', a: 'Aqui você recebe um protocolo baseado no SEU perfil, não um treino genérico. Isso evita os erros que causam estagnação.' },
  { q: 'Funciona para quem tem mais de 40 anos?', a: 'Sim. O método foi desenvolvido pensando em mulheres acima dos 30 e 40 anos, com foco em ativação correta do glúteo.' },
  { q: 'É seguro comprar?', a: 'Totalmente. Pagamento via plataforma certificada com SSL. Garantia de 7 dias — se não gostar, devolvemos 100% do seu dinheiro.' },
  { q: 'Em quanto tempo vejo resultado?', a: 'A maioria sente diferença na firmeza entre 7 e 10 dias. Resultado visual mais evidente na 2ª e 3ª semana.' },
]

function B2SalesInner() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(900)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const priceRef = useRef<HTMLDivElement>(null)

  const perfil = searchParams.get('perfil') ?? 'intermediario'
  const profileLabel = PROFILE_LABELS[perfil] ?? PROFILE_LABELS.intermediario

  useEffect(() => {
    trackStep('B2_Vendas', 4)
    // Persist countdown
    const KEY = 'b2_sales_expire'
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

  function buildQs() {
    const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    const p = new URLSearchParams()
    UTM_KEYS.forEach(k => { const v = searchParams.get(k); if (v) p.set(k, v) })
    return p.toString()
  }

  function handlePix() {
    trackStep('B2_CheckoutClick', 5)
    initiateCheckout()
    const qs = buildQs()
    window.location.href = qs ? `${CHECKOUT_URL_PIX}?${qs}` : CHECKOUT_URL_PIX
  }

  function handleCard() {
    trackStep('B2_CheckoutClick', 5)
    initiateCheckout()
    const qs = buildQs()
    window.location.href = qs ? `${CHECKOUT_URL_CARD}?${qs}` : CHECKOUT_URL_CARD
  }

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100svh' }}>

      {/* Urgência */}
      <div style={{ background: 'linear-gradient(90deg, #F43F75, #E91E8C)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Oferta especial expira em {mins}:{secs}
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Hero */}
        <div className="pt-6 pb-5 text-center flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#E91E8C' }}>
            Protocolo personalizado para {profileLabel}
          </p>
          <h1 className="text-gray-900 font-black text-2xl leading-tight">
            Seu bumbum pode ser completamente diferente em{' '}
            <span style={{ color: '#E91E8C' }}>4 semanas</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Método da Geo com as técnicas, séries e repetições exatas para o seu perfil
          </p>
        </div>

        {/* Foto */}
        <div className="rounded-3xl overflow-hidden mb-5 shadow-md" style={{ border: '2px solid #FCE7F3' }}>
          <img src="/depoimento 1.1.jpg" alt="Resultado real" className="w-full object-cover" />
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <span key={i} className="text-pink-400 text-sm">★</span>)}
            <span className="text-gray-400 text-xs font-bold ml-1">3.200+ alunas</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-gray-400 text-xs font-bold">🛡️ Garantia 7 dias</span>
        </div>

        {/* O que você recebe */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#E91E8C' }}>✨ O que você recebe:</p>
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
            {[
              { icon: '🤫', text: 'Os exercícios que muitas artistas usam e nunca ensinam' },
              { icon: '💪', text: 'A diferença do glúteo começando a endurecer de verdade' },
              { icon: '🪞', text: 'Olhar no espelho e ver o bumbum mais alto e mais firme' },
              { icon: '👙', text: 'Confiança de colocar biquíni sem se esconder' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-gray-700 text-sm leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: '#F0FDF4', border: '1px solid #86EFAC' }}>
            <p className="text-green-800 text-xs leading-relaxed font-medium">
              ✅ Funciona em casa ou academia &nbsp;·&nbsp; ✅ Sem equipamento necessário &nbsp;·&nbsp; ✅ 20-30 min por treino
            </p>
          </div>
        </div>

        {/* Bloco de preço */}
        <div ref={priceRef} className="bg-white rounded-3xl p-5 mb-5 flex flex-col gap-4 shadow-md" style={{ border: '2px solid #F43F75' }}>
          <div className="text-center flex flex-col gap-1">
            <p className="font-black text-xs uppercase tracking-wider" style={{ color: '#E91E8C' }}>🔥 Oferta especial</p>
            <h2 className="text-gray-900 font-black text-lg leading-tight">Acesso completo ao método Geo</h2>
            <p className="text-gray-400 text-xs">7 videoaulas · protocolo personalizado · acesso imediato</p>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <p className="text-gray-400 text-sm line-through">De R$197,00</p>
            <p className="text-gray-500 text-sm">Por apenas</p>
            <div className="flex items-end gap-1">
              <p className="font-black text-5xl leading-none" style={{ color: '#E91E8C' }}>R$47</p>
              <p className="font-black text-xl leading-none mb-1" style={{ color: '#E91E8C' }}>,00</p>
            </div>
            <p className="text-gray-400 text-xs">no PIX · acesso imediato</p>
          </div>

          {/* Garantia */}
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <span className="text-2xl flex-shrink-0">🛡️</span>
            <div>
              <p className="text-yellow-800 font-black text-xs">Garantia de 7 dias sem risco</p>
              <p className="text-yellow-700 text-[11px] leading-snug mt-0.5">
                Não gostou? Devolvemos <strong>100% do dinheiro</strong>. Sem perguntas.
              </p>
            </div>
          </div>

          {/* PIX — principal */}
          <button onClick={handlePix}
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 flex flex-col items-center gap-0.5">
            <span>💚 PAGAR COM PIX — R$47</span>
            <span className="text-xs font-bold opacity-80">Aprovação imediata · Mais barato</span>
          </button>

          {/* Cartão */}
          <button onClick={handleCard}
            style={{ background: 'white', border: '1px solid #F43F7560' }}
            className="w-full text-gray-700 font-bold text-base py-4 rounded-2xl active:scale-95 transition-all duration-200">
            💳 Pagar no cartão — R$57
          </button>

          <div className="flex items-center justify-center gap-3">
            {['📱 PIX', '💳 Cartão', '🔒 SSL'].map((s, i) => (
              <span key={i} className="text-gray-400 text-[10px] font-bold">{s}</span>
            ))}
          </div>
        </div>

        {/* Como funciona */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#E91E8C' }}>🚀 O que acontece depois que você compra</p>
          <div className="flex flex-col" style={{ paddingLeft: 8 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center" style={{ width: 36, flexShrink: 0 }}>
                  <div className="flex items-center justify-center rounded-full text-base font-black z-10"
                    style={{
                      width: 36, height: 36, flexShrink: 0,
                      background: step.highlight ? '#E91E8C' : 'white',
                      border: step.highlight ? 'none' : '2px solid #F43F75',
                      boxShadow: step.highlight ? '0 0 16px rgba(233,30,140,0.3)' : 'none',
                    }}>
                    {step.icon}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 28, background: 'linear-gradient(to bottom, #F43F75, #F43F7530)' }} />
                  )}
                </div>
                <div className="pb-5 flex flex-col gap-0.5 pt-1.5">
                  <p className="font-black text-sm" style={{ color: step.highlight ? '#E91E8C' : '#1f2937' }}>{step.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor */}
        <div className="bg-white rounded-2xl p-5 flex items-start gap-4 mb-6 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
          <img src="/mentora.jpg" alt="Geo" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" style={{ border: '2px solid #E91E8C' }} />
          <div className="flex flex-col gap-1">
            <p className="text-gray-900 font-black text-sm">Geovana Bueno</p>
            <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>Personal especialista em glúteos</p>
            <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
              Especialista em hipertrofia glútea com mais de 3.200 alunas transformadas. Método baseado em ciência e resultados reais.
            </p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="font-black text-sm uppercase tracking-wider text-center" style={{ color: '#E91E8C' }}>O QUE NOSSAS ALUNAS DIZEM:</p>
          {[
            { nome: 'Camila R.', res: 'Bumbum cresceu 4cm em 28 dias', txt: '"Segui o protocolo da Geo e em 10 dias já senti diferença. Em 4 semanas meu bumbum estava irreconhecível!"' },
            { nome: 'Jéssica M.', res: 'Firmeza e volume em 3 semanas', txt: '"O diagnóstico identificou exatamente o meu problema. Nunca tinha visto resultado assim mesmo treinando há anos."' },
            { nome: 'Renata P.', res: 'Quebrou plateau após 2 anos', txt: '"Treino há 3 anos e estava estagnada. Só com o método da Geo eu voltei a crescer — em 2 semanas já deu pra notar."' },
          ].map((d, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm">{d.nome}</p>
                  <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>{d.res}</p>
                </div>
                <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <span key={j} className="text-pink-400 text-sm">★</span>)}</div>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed italic">{d.txt}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#E91E8C' }}>❓ Perguntas frequentes</p>
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
              <button className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-gray-900 font-bold text-sm">{item.q}</span>
                <span style={{ color: '#E91E8C' }} className="font-black text-lg flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="flex flex-col gap-2">
          <button onClick={handlePix}
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 flex flex-col items-center gap-0.5">
            <span>💚 PAGAR COM PIX — R$47</span>
            <span className="text-xs font-bold opacity-80">Aprovação imediata · Mais barato</span>
          </button>
          <button onClick={handleCard}
            style={{ background: 'white', border: '1px solid #F43F7560' }}
            className="w-full text-gray-700 font-bold text-base py-4 rounded-2xl active:scale-95 transition-all duration-200">
            💳 Pagar no cartão — R$57
          </button>
          <p className="text-gray-400 text-xs text-center">
            ⏰ Expira em {mins}:{secs} · 🔒 Pagamento seguro · Garantia 7 dias
          </p>
        </div>

      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white border-t border-pink-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)', paddingTop: 12, paddingLeft: 20, paddingRight: 20 }}>
        <button onClick={handlePix}
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', maxWidth: 430 }}
          className="w-full text-white font-black text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-200">
          💚 PIX — R$47 · Acesso Imediato
        </button>
      </div>

    </div>
  )
}

export default function B2Sales() {
  return <Suspense><B2SalesInner /></Suspense>
}
