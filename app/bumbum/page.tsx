'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { trackStep } from '@/lib/analytics'

function BumbumLandingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewers, setViewers] = useState(0)

  useEffect(() => {
    trackStep('Bumbum_Landing', 1)
    const initial = Math.floor(Math.random() * 80) + 120
    setViewers(initial)
    const interval = setInterval(() => {
      setViewers(v => v + Math.floor(Math.random() * 7) - 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function goToQuiz() {
    const params = searchParams.toString()
    router.push(params ? `/bumbum/quiz?${params}` : '/bumbum/quiz')
  }

  return (
    <div className="bumbum-page" style={{ background: '#0D0005' }}>

      {/* Barra topo */}
      <div style={{ background: 'linear-gradient(90deg, #E91E8C, #C2185B)' }} className="px-4 py-2.5 flex items-center justify-center gap-2">
        <span className="text-white text-xs font-black text-center animate-pulse">
          🔥 VAGAS LIMITADAS — ÚLTIMAS HORAS COM DESCONTO ESPECIAL
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Social proof strip — acima de tudo */}
        <div className="flex items-center justify-center gap-4 pt-4 pb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            <span className="text-white/50 text-xs font-bold ml-1">3.200+ alunas</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/50 text-xs font-bold">✅ Diagnóstico grátis</span>
        </div>

        {/* ── HEADLINE principal ────────────────────────────────────────────── */}
        <div className="text-center flex flex-col gap-3 pt-3 pb-4">
          <h1 className="text-white font-black text-3xl leading-tight">
            Por que seu bumbum{' '}
            <span style={{ color: '#FFD700' }}>não cresce</span>{' '}
            mesmo você treinando?
          </h1>
          <p className="text-white/70 text-base leading-snug">
            Faça o teste de <strong className="text-white">2 minutos</strong> e descubra o{' '}
            <span style={{ color: '#E91E8C' }} className="font-bold">erro exato</span>{' '}
            que está travando o seu resultado
          </p>
        </div>

        {/* Antes e Depois */}
        <div className="relative rounded-3xl overflow-hidden mb-4 shadow-2xl" style={{ border: '2px solid #E91E8C60' }}>
          <img
            src="/bumbum-antes-depois.jpg"
            alt="Resultado real — Antes e Depois Geovana"
            className="w-full object-cover"
          />

          <div className="absolute top-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }} />

          <div className="absolute top-3 left-0 w-1/2 flex justify-center">
            <span className="bg-black/75 text-white font-black px-4 py-1.5 rounded-full text-sm tracking-wide">ANTES</span>
          </div>
          <div className="absolute top-3 right-0 w-1/2 flex justify-center">
            <span className="text-white font-black px-4 py-1.5 rounded-full text-sm tracking-wide" style={{ background: '#E91E8C' }}>DEPOIS</span>
          </div>
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3">
            <span className="text-white font-black px-5 py-2 rounded-full text-xs" style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}>
              ✨ Resultado real em 28 dias — método Geo
            </span>
          </div>
        </div>

        {/* Bullets rápidos — substituem o parágrafo */}
        <div className="flex flex-col gap-2 mb-4">
          {[
            { icon: '🎯', text: 'Diagnóstico 100% personalizado para o SEU corpo' },
            { icon: '⚡', text: 'Protocolo específico pronto em 2 minutos' },
            { icon: '🔓', text: 'Completamente gratuito, sem cadastro' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{b.icon}</span>
              <p className="text-white/80 text-sm leading-snug">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Visualizadores */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="text-white/40 text-xs">{viewers} mulheres fazendo o diagnóstico agora</span>
        </div>

        {/* CTA principal */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-2"
        >
          👉 DESCOBRIR O MEU ERRO AGORA
        </button>
        <p className="text-white/30 text-xs text-center mb-8">
          🔒 Grátis · Sem cadastro · Resultado imediato
        </p>

        {/* Promessas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🍑', title: 'Bumbum maior', desc: 'Protocolo para volume real' },
            { icon: '💪', title: 'Mais firmeza', desc: 'Sem flacidez em 4 semanas' },
            { icon: '🏠', title: 'Casa ou academia', desc: 'Funciona nos dois lugares' },
            { icon: '⚡', title: 'Resultado rápido', desc: 'Veja mudança em 7 dias' },
          ].map((p, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C30' }} className="rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-2xl">{p.icon}</span>
              <p className="text-white font-black text-sm">{p.title}</p>
              <p className="text-white/40 text-xs">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 2º CTA */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-8"
        >
          🍑 QUERO MEU DIAGNÓSTICO GRÁTIS
        </button>

        {/* Depoimentos */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm text-center">O QUE NOSSAS ALUNAS DIZEM:</p>
          {[
            { nome: 'Camila R.', resultado: 'Bumbum cresceu 4cm em 28 dias', texto: '"Nunca acreditei que conseguiria resultado tão rápido. O diagnóstico foi certeiro — ele identificou exatamente meu problema e o protocolo mudou tudo!"' },
            { nome: 'Jéssica M.', resultado: 'Perdeu a flacidez em 3 semanas', texto: '"Treino há anos mas nunca vi resultado assim. O método da Geo é diferente de tudo que já fiz. Bumbum firme, empinado e sem dor!"' },
          ].map((d, i) => (
            <div key={i} style={{ background: '#1A0010', border: '1px solid #E91E8C20' }} className="rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{d.nome}</p>
                  <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>{d.resultado}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
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
            <p className="text-white/40 text-xs">já fizeram o diagnóstico e mudaram o corpo</p>
          </div>
        </div>

        {/* CTA final */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-3"
        >
          🍑 QUERO MEU DIAGNÓSTICO GRÁTIS
        </button>
        <p className="text-white/20 text-xs text-center">
          🔒 Seus dados estão seguros · Gratuito · Sem compromisso
        </p>

      </div>
    </div>
  )
}

export default function BumbumLanding() {
  return (
    <Suspense>
      <BumbumLandingInner />
    </Suspense>
  )
}
