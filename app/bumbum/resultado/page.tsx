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
    subheadline: 'Seu corpo está pronto para responder MUITO rápido ao estímulo certo',
    diagnosis: [
      { icon: '✅', text: 'Seu músculo glúteo ainda não foi desafiado corretamente — isso é ótimo!' },
      { icon: '✅', text: 'Sem vícios de treino — você vai aprender o método certo desde o início' },
      { icon: '✅', text: 'Potencial máximo de crescimento: seu corpo vai responder rápido' },
      { icon: '⚠️', text: 'Risco: começar errado e desenvolver padrão de movimento inadequado' },
    ],
    protocol: [
      { week: 'Semana 1-2', title: 'Ativação Glútea', desc: 'Despertar o glúteo adormecido com exercícios de ativação específicos' },
      { week: 'Semana 3-4', title: 'Sobrecarga Progressiva', desc: 'Aumentar a intensidade para forçar o crescimento muscular' },
    ],
    result: 'Primeiros resultados visíveis em 7-10 dias',
    xp: 750,
  },
  intermediario: {
    label: 'Guerreira Estagnada',
    emoji: '💪',
    color: '#E91E8C',
    headline: 'Você treina mas algo está te impedindo de crescer!',
    subheadline: 'Identificamos o bloqueio exato que está travando seu resultado',
    diagnosis: [
      { icon: '⚠️', text: 'Você já treina mas o glúteo não cresce — sinal claro de estímulo incorreto' },
      { icon: '⚠️', text: 'Possível dominância de quadríceps: outras musculaturas roubando o trabalho' },
      { icon: '✅', text: 'Base física boa — você precisa só ajustar a estratégia' },
      { icon: '✅', text: 'Sua consistência vai te colocar na frente de 90% das mulheres' },
    ],
    protocol: [
      { week: 'Semana 1', title: 'Reset e Ativação', desc: 'Corrigir o padrão de movimento e reativar o glúteo como músculo principal' },
      { week: 'Semana 2-3', title: 'Hipertrofia Específica', desc: 'Exercícios com ângulos e tensão máxima no glúteo' },
      { week: 'Semana 4', title: 'Choque Metabólico', desc: 'Protocolo intenso para selar os ganhos e definir a forma' },
    ],
    result: 'Resultados visíveis em 5-7 dias com o protocolo correto',
    xp: 875,
  },
  avancado: {
    label: 'Atleta de Alta Performance',
    emoji: '🔥',
    color: '#FFD700',
    headline: 'Você treina pesado mas falta o protocolo especializado!',
    subheadline: 'Seu nível exige uma abordagem mais sofisticada para quebrar o plateau',
    diagnosis: [
      { icon: '⚠️', text: 'Plateau muscular: seu glúteo se adaptou ao estímulo atual e parou de crescer' },
      { icon: '⚠️', text: 'Possível fadiga acumulada — o músculo precisa de estímulos variados' },
      { icon: '✅', text: 'Você tem a base ideal para resultados extraordinários' },
      { icon: '✅', text: 'Com o método certo, você pode crescer 2x mais rápido do que imagina' },
    ],
    protocol: [
      { week: 'Semana 1', title: 'Quebra de Plateau', desc: 'Técnicas avançadas de variação de estímulo para chocar o músculo' },
      { week: 'Semana 2', title: 'Tensão Mecânica Máxima', desc: 'Protocolos de alta tensão com foco em hipertrofia acelerada' },
      { week: 'Semana 3-4', title: 'Volume e Frequência', desc: 'Aumentar volume de treino de forma estratégica para crescimento máximo' },
    ],
    result: 'Quebra de plateau em 3-5 dias, crescimento acelerado nas semanas seguintes',
    xp: 1000,
  },
}

function BumbumResultadoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFull, setShowFull] = useState(false)
  const [countdown, setCountdown] = useState(900) // 15 min

  const perfil = (searchParams.get('perfil') ?? 'intermediario') as keyof typeof PROFILES
  const profile = PROFILES[perfil] ?? PROFILES.intermediario
  const nome = searchParams.get('nome') ?? ''

  useEffect(() => {
    trackStep('Bumbum_Resultado', 3)
    const timer = setTimeout(() => setShowFull(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function goToSales() {
    const params = searchParams.toString()
    router.push(`/bumbum/sales?perfil=${perfil}${params ? `&${params}` : ''}`)
  }

  if (!showFull) {
    return (
      <div className="bumbum-page flex flex-col items-center justify-center px-8 gap-6" style={{ background: '#0D0005' }}>
        <span className="text-6xl animate-bounce">🍑</span>
        <p className="text-white font-black text-lg text-center">Seu diagnóstico está pronto!</p>
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bumbum-page" style={{ background: '#0D0005' }}>

      {/* Urgência topo */}
      <div style={{ background: 'linear-gradient(90deg, #E91E8C, #C2185B)' }} className="px-4 py-2.5 flex items-center justify-center gap-2">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ⏰ Oferta expira em {mins}:{secs} — Protocolo personalizado disponível agora
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Resultado header */}
        <div className="pt-6 pb-4 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${profile.color}20`, border: `2px solid ${profile.color}` }}
            >
              {profile.emoji}
            </div>
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">
                {nome ? `${nome}, seu perfil é` : 'Seu perfil'}
              </p>
              <h2 style={{ color: profile.color }} className="font-black text-xl leading-tight">{profile.label}</h2>
            </div>
          </div>

          <div style={{ background: '#1A0010', border: `1px solid ${profile.color}40` }} className="rounded-2xl p-4 text-center flex flex-col gap-2">
            <h1 className="text-white font-black text-xl leading-tight">{profile.headline}</h1>
            <p className="text-white/60 text-sm leading-relaxed">{profile.subheadline}</p>
          </div>

          {/* XP conquistado */}
          <div style={{ background: '#1A0010', border: '1px solid #FFD70040' }} className="rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-white/60 text-xs font-bold">XP Conquistado</span>
            </div>
            <span style={{ color: '#FFD700' }} className="font-black text-lg">{profile.xp} XP</span>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider">📋 Seu Diagnóstico</p>
          {profile.diagnosis.map((d, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-xl p-3 flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
              <p className="text-white/80 text-sm leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>

        {/* Protocolo */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm uppercase tracking-wider">🗓️ Seu Protocolo de 4 Semanas</p>
          {profile.protocol.map((p, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C30' }} className="rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${profile.color}20`, color: profile.color }}
                >
                  {p.week}
                </span>
              </div>
              <p className="text-white font-black text-sm">{p.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Resultado esperado */}
        <div style={{ background: 'linear-gradient(135deg, #1A0010, #2D0020)', border: '1px solid #E91E8C50' }} className="rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-3xl flex-shrink-0">🎯</span>
          <div>
            <p className="text-white font-black text-sm">Resultado esperado para você</p>
            <p style={{ color: '#E91E8C' }} className="text-xs font-bold mt-0.5">{profile.result}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-white/60 text-xs text-center leading-relaxed">
            Seu protocolo personalizado está pronto. Para acessar o método completo da Geo com os treinos específicos para o seu perfil:
          </p>
          <button
            onClick={goToSales}
            style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
            className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200"
          >
            🍑 QUERO MEU PROTOCOLO COMPLETO
          </button>
          <p className="text-white/30 text-xs text-center">
            ⏰ Oferta especial expira em {mins}:{secs}
          </p>
        </div>

        {/* Depoimento do perfil */}
        <div style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-2xl p-4 flex flex-col gap-2 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-xs uppercase tracking-wider">RESULTADO DE QUEM TEM SEU PERFIL:</p>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white font-bold text-sm">
                {perfil === 'iniciante' ? 'Thais L.' : perfil === 'avancado' ? 'Renata P.' : 'Fernanda C.'}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>
                {perfil === 'iniciante' ? 'Cresceu 5cm em 28 dias partindo do zero' : perfil === 'avancado' ? 'Quebrou o plateau após 2 anos estagnada' : 'Bumbum firme e empinado em 3 semanas'}
              </p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
          </div>
          <p className="text-white/50 text-xs leading-relaxed italic">
            {perfil === 'iniciante'
              ? '"Nunca tinha treinado antes e achei que ia demorar muito. Com o protocolo da Geo, em 10 dias já senti diferença e em 4 semanas meu bumbum estava irreconhecível!"'
              : perfil === 'avancado'
              ? '"Treino há 3 anos, já fiz de tudo. Só com o método da Geo eu finalmente quebrei o plateau e voltei a crescer. Em 2 semanas as pessoas já notaram a diferença."'
              : '"Treinava há meses sem resultado. O diagnóstico mostrou exatamente o que estava errado. Segui o protocolo e em 21 dias meu bumbum cresceu e ficou muito mais firme!"'}
          </p>
        </div>

        {/* CTA final */}
        <button
          onClick={goToSales}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-3"
        >
          👉 ACESSAR MEU PROTOCOLO AGORA
        </button>
        <p className="text-white/20 text-xs text-center">
          🔒 Acesso imediato · Garantia 7 dias · Sem risco
        </p>

      </div>
    </div>
  )
}

export default function BumbumResultado() {
  return (
    <Suspense>
      <BumbumResultadoInner />
    </Suspense>
  )
}
