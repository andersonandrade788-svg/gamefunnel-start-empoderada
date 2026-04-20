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
          🔥 MÉTODO REVELADO — Técnicas que famosas usam e nunca ensinam
        </span>
      </div>

      <div className="max-w-md mx-auto px-5" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Badge de autoridade */}
        <div className="flex items-center justify-center gap-4 pt-4 pb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            <span className="text-white/50 text-xs font-bold ml-1">3.200+ alunas</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/50 text-xs font-bold">✅ Acesso grátis</span>
        </div>

        {/* HEADLINE */}
        <div className="text-center flex flex-col gap-3 pt-3 pb-4">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">A Geo revela</p>
          <h1 className="text-white font-black text-3xl leading-tight">
            Os exercícios que{' '}
            <span style={{ color: '#FFD700' }}>famosas usam</span>{' '}
            para ter bumbum empinado — e que ninguém ensina
          </h1>
          <p className="text-white/70 text-base leading-snug">
            Descubra em <strong className="text-white">2 minutos</strong> quais técnicas,{' '}
            <span style={{ color: '#E91E8C' }} className="font-bold">séries e repetições exatas</span>{' '}
            se encaixam no seu corpo
          </p>
        </div>

        {/* Foto resultado */}
        <div className="rounded-3xl overflow-hidden mb-4 shadow-2xl" style={{ border: '2px solid #E91E8C60' }}>
          <img
            src="/dep-a.jpg"
            alt="Resultado real — método Geo"
            className="w-full object-cover"
          />
        </div>

        {/* O que você vai descobrir */}
        <div className="flex flex-col gap-2 mb-4">
          {[
            { icon: '🎯', text: 'As séries e repetições exatas que geram volume real no glúteo' },
            { icon: '⚡', text: 'Por que a maioria treina errado — e como corrigir em 1 semana' },
            { icon: '🔓', text: 'Protocolo personalizado pro SEU corpo, de graça' },
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
          <span className="text-white/40 text-xs">{viewers} mulheres acessando agora</span>
        </div>

        {/* CTA principal */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-xl py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-2"
        >
          👉 QUERO VER O PROTOCOLO AGORA
        </button>
        <p className="text-white/30 text-xs text-center mb-8">
          🔒 Grátis · Sem cadastro · Resultado imediato
        </p>

        {/* Credencial da Geo */}
        <div style={{ background: '#1A0010', border: '1px solid #E91E8C40' }} className="rounded-2xl p-4 flex items-center gap-3 mb-6">
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div>
            <p className="text-white font-black text-sm">Geovana Bueno — Personal especialista em glúteos</p>
            <p className="text-white/40 text-xs mt-0.5">Treinou influenciadoras e celebridades · +3.200 alunas transformadas</p>
          </div>
        </div>

        {/* Promessas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🍑', title: 'Volume real', desc: 'As técnicas que realmente crescem' },
            { icon: '💪', title: 'Firmeza rápida', desc: 'Resultado visível em 7 dias' },
            { icon: '🏠', title: 'Casa ou academia', desc: 'Funciona nos dois lugares' },
            { icon: '⚡', title: 'Séries exatas', desc: 'Sem achismo, só o que funciona' },
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
          🍑 QUERO O MEU PROTOCOLO GRÁTIS
        </button>

        {/* Depoimentos */}
        <div className="flex flex-col gap-3 mb-6">
          <p style={{ color: '#FFD700' }} className="font-black text-sm text-center">QUEM JÁ APLICOU O MÉTODO:</p>
          {[
            { nome: 'Camila R.', resultado: 'Bumbum cresceu 4cm em 28 dias', texto: '"Achei que era só para quem tem corpo de famosa. Mas o protocolo da Geo funcionou igual — meu bumbum cresceu de verdade, sem academia cara!"' },
            { nome: 'Jéssica M.', resultado: 'Firmeza e volume em 3 semanas', texto: '"Ela explica exatamente as séries e repetições. Segui certinho e em 21 dias já estava diferente. As pessoas começaram a perguntar o que eu fiz!"' },
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

        {/* CTA final */}
        <button
          onClick={goToQuiz}
          style={{ background: 'linear-gradient(135deg, #E91E8C, #C2185B)' }}
          className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 mb-3"
        >
          🍑 QUERO O MEU PROTOCOLO GRÁTIS
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
