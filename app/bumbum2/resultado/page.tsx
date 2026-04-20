'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { trackStep } from '@/lib/analytics'

const PROFILES = {
  iniciante: {
    label: 'Iniciante Determinada',
    emoji: '🌱',
    color: '#22C55E',
    headline: 'Você tem tudo para transformar seu bumbum do zero!',
    subheadline: 'Seu corpo está pronto para responder rapidamente ao estímulo certo',
    items: [
      { ok: true,  text: 'Potencial máximo de crescimento — músculo glúteo ainda não foi desafiado' },
      { ok: true,  text: 'Sem vícios de treino — você aprende o método certo desde o início' },
      { ok: false, text: 'Risco: começar errado e não ativar o glúteo corretamente' },
    ],
    result: 'Primeiros resultados visíveis em 7-10 dias',
  },
  intermediario: {
    label: 'Guerreira Estagnada',
    emoji: '💪',
    color: '#E91E8C',
    headline: 'Você treina mas algo está te impedindo de crescer!',
    subheadline: 'Identificamos o bloqueio exato que está travando o seu resultado',
    items: [
      { ok: false, text: 'Glúteo não cresce por estímulo incorreto — muito comum' },
      { ok: true,  text: 'Base física boa — só precisa ajustar a estratégia' },
      { ok: true,  text: 'Sua consistência vai te colocar à frente de 90% das mulheres' },
    ],
    result: 'Resultados visíveis em 5-7 dias com o protocolo correto',
  },
  avancado: {
    label: 'Atleta em Plateau',
    emoji: '🔥',
    color: '#F59E0B',
    headline: 'Você treina pesado mas precisa de um novo estímulo!',
    subheadline: 'Seu nível exige uma abordagem mais sofisticada para quebrar o plateau',
    items: [
      { ok: false, text: 'Plateau muscular: glúteo adaptado ao estímulo atual' },
      { ok: true,  text: 'Base ideal para resultados extraordinários' },
      { ok: true,  text: 'Com o método certo, você cresce 2x mais rápido' },
    ],
    result: 'Quebra de plateau em 3-5 dias',
  },
}

function B2ResultadoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [countdown, setCountdown] = useState(900)

  const perfil = (searchParams.get('perfil') ?? 'intermediario') as keyof typeof PROFILES
  const profile = PROFILES[perfil] ?? PROFILES.intermediario
  const nome = searchParams.get('nome') ?? ''

  useEffect(() => {
    trackStep('B2_Resultado', 3)
    const t = setTimeout(() => setShow(true), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(iv)
  }, [])

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function goToSales() {
    const params = searchParams.toString()
    router.push(`/bumbum2/sales?perfil=${perfil}${params ? `&${params}` : ''}`)
  }

  if (!show) {
    return (
      <div className="flex flex-col items-center justify-center px-8 gap-5" style={{ background: '#FFF0F5', minHeight: '100svh' }}>
        <span className="text-6xl animate-bounce">🍑</span>
        <p className="text-gray-900 font-black text-lg text-center">Seu diagnóstico está pronto!</p>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#E91E8C', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100svh' }}>

      {/* Urgência */}
      <div style={{ background: 'linear-gradient(90deg, #F43F75, #E91E8C)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Protocolo disponível por {mins}:{secs}
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Perfil */}
        <div className="pt-6 pb-4 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-white shadow-md"
              style={{ border: `2px solid ${profile.color}` }}>
              {profile.emoji}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {nome ? `${nome}, seu perfil é` : 'Seu perfil'}
              </p>
              <h2 className="font-black text-xl leading-tight" style={{ color: profile.color }}>{profile.label}</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center flex flex-col gap-2 shadow-sm" style={{ border: `1px solid ${profile.color}30` }}>
            <h1 className="text-gray-900 font-black text-xl leading-tight">{profile.headline}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{profile.subheadline}</p>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="font-black text-sm uppercase tracking-wider" style={{ color: '#E91E8C' }}>📋 Seu Diagnóstico</p>
          {profile.items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
              <span className="text-base flex-shrink-0 mt-0.5">{item.ok ? '✅' : '⚠️'}</span>
              <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Resultado esperado */}
        <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
          <span className="text-3xl flex-shrink-0">🎯</span>
          <div>
            <p className="text-gray-900 font-black text-sm">Resultado esperado para você</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: '#E91E8C' }}>{profile.result}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-gray-500 text-xs text-center leading-relaxed">
            Seu protocolo personalizado está pronto. Para acessar o método completo da Geo:
          </p>
          <button onClick={goToSales}
            style={{ background: 'linear-gradient(135deg, #F43F75, #E91E8C)' }}
            className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200">
            🍑 QUERO MEU PROTOCOLO COMPLETO
          </button>
          <p className="text-gray-400 text-xs text-center">⏰ Oferta especial expira em {mins}:{secs}</p>
        </div>

        {/* Depoimento */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 mb-6 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
          <p className="font-black text-xs uppercase tracking-wider" style={{ color: '#E91E8C' }}>RESULTADO DE QUEM TEM SEU PERFIL:</p>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-gray-900 font-bold text-sm">
                {perfil === 'iniciante' ? 'Thais L.' : perfil === 'avancado' ? 'Renata P.' : 'Fernanda C.'}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>
                {perfil === 'iniciante' ? 'Cresceu 5cm em 28 dias' : perfil === 'avancado' ? 'Quebrou o plateau em 2 semanas' : 'Bumbum firme em 3 semanas'}
              </p>
            </div>
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-pink-400 text-sm">★</span>)}</div>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed italic">
            {perfil === 'iniciante'
              ? '"Nunca tinha treinado antes. Com o protocolo da Geo, em 10 dias já senti diferença e em 4 semanas meu bumbum estava irreconhecível!"'
              : perfil === 'avancado'
              ? '"Treino há 3 anos e estava estagnada. Só com o método da Geo eu voltei a crescer. Em 2 semanas as pessoas já notaram."'
              : '"Treinava há meses sem resultado. O protocolo mostrou exatamente o que estava errado. Em 21 dias meu bumbum cresceu e ficou muito mais firme!"'}
          </p>
        </div>

        <button onClick={goToSales}
          style={{ background: 'linear-gradient(135deg, #F43F75, #E91E8C)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-3">
          👉 ACESSAR MEU PROTOCOLO AGORA
        </button>
        <p className="text-gray-400 text-xs text-center">🔒 Acesso imediato · Garantia 7 dias · Sem risco</p>

      </div>
    </div>
  )
}

export default function B2Resultado() {
  return <Suspense><B2ResultadoInner /></Suspense>
}
