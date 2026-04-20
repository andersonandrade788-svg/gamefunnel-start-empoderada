'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { trackStep } from '@/lib/analytics'

const SLIDES = [
  { src: '/depoimento 1.1.jpg', name: 'Camila R.', result: '+4cm em 28 dias' },
  { src: '/depoimento 2.2.jpg', name: 'Jéssica M.', result: 'Firmeza em 3 semanas' },
]

function B2LandingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [slide, setSlide] = useState(0)
  const [viewers, setViewers] = useState(0)

  useEffect(() => {
    trackStep('B2_Landing', 1)
    setViewers(Math.floor(Math.random() * 60) + 90)
    const iv = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 5) - 2), 5000)
    const sl = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3500)
    return () => { clearInterval(iv); clearInterval(sl) }
  }, [])

  function goToQuiz() {
    const params = searchParams.toString()
    router.push(params ? `/bumbum2/quiz?${params}` : '/bumbum2/quiz')
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100svh', width: '100%' }}>

      {/* Barra topo */}
      <div style={{ background: 'linear-gradient(90deg, #F43F75, #E91E8C)' }} className="px-4 py-2.5 flex items-center justify-center">
        <span className="text-white text-xs font-black text-center animate-pulse">
          ✨ Método gratuito — Resultado em 4 semanas
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-4 pt-5 pb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <span key={i} className="text-pink-400 text-sm">★</span>)}
            <span className="text-gray-400 text-xs font-bold ml-1">3.200+ alunas</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-gray-400 text-xs font-bold">✅ 100% gratuito</span>
        </div>

        {/* Headline */}
        <div className="text-center flex flex-col gap-3 pb-5">
          <h1 className="text-gray-900 font-black text-3xl leading-tight">
            Seu bumbum pode ser{' '}
            <span style={{ color: '#E91E8C' }}>completamente diferente</span>{' '}
            em 4 semanas
          </h1>
          <p className="text-gray-500 text-base leading-snug">
            Descubra o protocolo personalizado que está transformando o corpo de mulheres reais — sem academia cara, sem dieta radical
          </p>
        </div>

        {/* Carrossel */}
        <div className="rounded-3xl overflow-hidden mb-2 shadow-lg relative" style={{ border: '2px solid #F43F7530' }}>
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {SLIDES.map((s, i) => (
              <img key={i} src={s.src} alt={s.name} className="w-full object-cover flex-shrink-0" style={{ minWidth: '100%' }} />
            ))}
          </div>
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
            <p className="text-white font-black text-sm">{SLIDES[slide].name}</p>
            <p className="text-pink-300 text-xs font-bold">{SLIDES[slide].result}</p>
          </div>
          {/* Dots */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className="rounded-full transition-all duration-300"
                style={{ width: slide === i ? 16 : 6, height: 6, background: slide === i ? '#E91E8C' : 'rgba(255,255,255,0.6)' }} />
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-xs text-center mb-5">Resultados reais de alunas do método Geo</p>

        {/* Bullets */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: '🎯', text: 'Diagnóstico 100% personalizado para o seu tipo de corpo' },
            { icon: '⚡', text: 'Protocolo com séries e repetições exatas — sem achismo' },
            { icon: '🔓', text: 'Completamente gratuito, resultado em 2 minutos' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm" style={{ border: '1px solid #F3E8FF' }}>
              <span className="text-xl flex-shrink-0">{b.icon}</span>
              <p className="text-gray-700 text-sm font-medium leading-snug">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Viewers */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="text-gray-400 text-xs">{viewers} mulheres fazendo o diagnóstico agora</span>
        </div>

        {/* CTA */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #F43F75, #E91E8C)' }}
          className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-2"
        >
          👉 QUERO MEU DIAGNÓSTICO GRÁTIS
        </button>
        <p className="text-gray-400 text-xs text-center mb-8">
          🔒 Grátis · Sem cadastro · Resultado imediato
        </p>

        {/* Promessas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🍑', title: 'Volume real', desc: 'Protocolo que realmente cresce' },
            { icon: '💪', title: 'Firmeza rápida', desc: 'Visível em 7 dias' },
            { icon: '🏠', title: 'Casa ou academia', desc: 'Funciona nos dois' },
            { icon: '⚡', title: 'Séries exatas', desc: 'Sem perder tempo' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
              <span className="text-2xl">{p.icon}</span>
              <p className="text-gray-800 font-black text-sm">{p.title}</p>
              <p className="text-gray-400 text-xs">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 2º CTA */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #F43F75, #E91E8C)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-8"
        >
          🍑 DESCOBRIR MEU PROTOCOLO
        </button>

        {/* Credencial */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
          <img src="/mentora.jpg" alt="Geo" className="w-12 h-12 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid #E91E8C' }} />
          <div>
            <p className="text-gray-900 font-black text-sm">Geovana Bueno</p>
            <p className="text-gray-400 text-xs mt-0.5">Personal especialista em glúteos · +3.200 alunas transformadas</p>
          </div>
        </div>

        {/* Depoimentos */}
        <p className="text-gray-500 font-black text-sm text-center mb-3">O QUE NOSSAS ALUNAS DIZEM:</p>
        <div className="flex flex-col gap-3 mb-6">
          {[
            { nome: 'Camila R.', resultado: 'Bumbum cresceu 4cm em 28 dias', texto: '"Segui o protocolo da Geo e em 10 dias já senti diferença. Em 4 semanas meu bumbum estava irreconhecível!"' },
            { nome: 'Jéssica M.', resultado: 'Firmeza e volume em 3 semanas', texto: '"O diagnóstico identificou exatamente o meu problema. Nunca tinha visto resultado assim mesmo treinando há anos."' },
          ].map((d, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm">{d.nome}</p>
                  <p className="text-xs font-semibold" style={{ color: '#E91E8C' }}>{d.resultado}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-pink-400 text-sm">★</span>)}
                </div>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed italic">{d.texto}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm" style={{ border: '1px solid #FCE7F3' }}>
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-gray-900 font-black text-sm">+3.200 mulheres transformadas</p>
            <p className="text-gray-400 text-xs">já fizeram o diagnóstico e mudaram o corpo</p>
          </div>
        </div>

        {/* CTA final */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #F43F75, #E91E8C)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 mb-3"
        >
          🍑 QUERO MEU DIAGNÓSTICO GRÁTIS
        </button>
        <p className="text-gray-400 text-xs text-center">
          🔒 Seus dados estão seguros · Gratuito · Sem compromisso
        </p>

      </div>
    </div>
  )
}

export default function B2Landing() {
  return <Suspense><B2LandingInner /></Suspense>
}
