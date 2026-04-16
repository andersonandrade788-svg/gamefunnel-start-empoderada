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

        {/* Logo */}
        <div className="flex justify-center pt-6 pb-2">
          <img src="/bumbum-logo.png" alt="Desafio Bumbum Turbinado" className="w-full max-w-[220px] object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="text-center" style={{ display: 'none' }} id="logo-fallback">
            <p className="text-white font-black text-2xl leading-tight">
              <span style={{ color: '#E91E8C' }}>Desafio do</span><br />
              <span style={{ color: '#FFD700' }} className="text-4xl">Bumbum</span><br />
              <span style={{ color: '#FF4444' }}>Turbinado</span><br />
              <span className="text-white text-xl">em 4 Semanas</span>
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center flex flex-col gap-2 pt-5 pb-3">
          <h1 className="text-white font-black text-2xl leading-tight">
            Descubra o que está{' '}
            <span style={{ color: '#FFD700' }}>travando o crescimento</span>{' '}
            do seu bumbum — mesmo treinando
          </h1>
        </div>

        {/* Antes e Depois — imagem principal */}
        <div className="relative rounded-3xl overflow-hidden mb-4 shadow-2xl" style={{ border: '2px solid #E91E8C50' }}>
          <img
            src="/tela%20inicial.jpg"
            alt="Resultado real — Antes e Depois Geovana"
            className="w-full object-cover"
          />
          {/* Labels */}
          <div className="absolute top-3 left-3">
            <span className="bg-black/80 text-white text-xs font-black px-3 py-1.5 rounded-full">ANTES</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-white text-xs font-black px-3 py-1.5 rounded-full" style={{ background: '#E91E8C' }}>DEPOIS</span>
          </div>
          {/* Badge resultado */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3">
            <span className="text-white text-xs font-black px-4 py-1.5 rounded-full" style={{ background: 'rgba(13,0,5,0.85)', border: '1px solid #E91E8C60' }}>
              🍑 4 semanas de protocolo
            </span>
          </div>
        </div>

        <p className="text-white/60 text-sm leading-relaxed text-center mb-4">
          Responda <strong className="text-white">5 perguntas rápidas</strong> e receba seu diagnóstico personalizado com o protocolo exato para turbinar seu bumbum em 4 semanas.
        </p>

        {/* Visualizadores */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-xs">{viewers} mulheres fazendo o diagnóstico agora</span>
        </div>

        {/* CTA principal */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-3"
        >
          👉 FAZER O DIAGNÓSTICO GRÁTIS
        </button>
        <p className="text-white/30 text-xs text-center mb-6">
          🔒 Gratuito · 2 minutos · Resultado na hora
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
