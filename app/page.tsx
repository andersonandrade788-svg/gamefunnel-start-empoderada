'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import StatusBar from '@/components/StatusBar'

function LandingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToQuiz() {
    const params = searchParams.toString()
    router.push(params ? `/exp1?${params}` : '/exp1')
  }

  return (
    <div className="mobile-frame bg-white overflow-y-auto" style={{ minHeight: '100dvh' }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar dark={false} />
      </div>

      <div className="px-5 pt-5 pb-8 flex flex-col gap-5">

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#22C55E]/15 text-[#22C55E] text-xs font-black px-3 py-1 rounded-full">✅ Teste gratuito</span>
            <span className="bg-yellow-400/15 text-yellow-600 text-xs font-black px-3 py-1 rounded-full">⚡ 2 minutos</span>
          </div>
          <h1 className="text-gray-900 font-black text-2xl leading-tight">
            Descubra <span className="text-[#22C55E]">por que você não emagrece</span> mesmo fazendo dieta e exercício
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Mais de 2.847 mulheres já descobriram o que estava travando o resultado delas. Agora é a sua vez.
          </p>
        </div>

        {/* CTA acima do fold */}
        <button
          onClick={goToQuiz}
          className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200"
        >
          👉 DESCOBRIR MEU PROBLEMA AGORA
        </button>
        <p className="text-gray-400 text-xs text-center -mt-3">
          🔒 100% gratuito · Resultado na hora · Sem compromisso
        </p>

        {/* Antes e depois */}
        <div className="flex flex-col gap-2">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/antes%20-%20e%20-%20depois%20-2.jpg"
              alt="Resultado aluna Start Empoderada"
              className="w-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#c0392b] text-white text-xs font-black px-3 py-1 rounded-full">ANTES</div>
            <div className="absolute top-3 right-3 bg-[#22C55E] text-white text-xs font-black px-3 py-1 rounded-full">DEPOIS</div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3">
              <span className="bg-black/70 text-white text-xs font-bold px-4 py-1.5 rounded-full">→ 30 dias →</span>
            </div>
          </div>
        </div>

        {/* Depoimento */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">Vandeilma S.</p>
              <p className="text-[#22C55E] text-xs font-semibold">Perdeu 14kg em 30 dias</p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed italic">
            "Tentei tudo antes e nada funcionava. Com o método da Giovanna foi diferente — finalmente entendi o que estava fazendo de errado e perdi 14kg em 30 dias."
          </p>
        </div>

        {/* Dores */}
        <div className="flex flex-col gap-2">
          <p className="text-gray-700 font-black text-sm">Você se identifica com alguma dessas situações?</p>
          {[
            'Faz dieta mas o peso não sai',
            'Começa e para várias vezes',
            'Sente que o corpo não responde mais',
            'Está sempre cansada e sem energia',
          ].map((dor, i) => (
            <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <span className="text-red-400 text-base flex-shrink-0">😔</span>
              <p className="text-gray-700 text-sm">{dor}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="flex flex-col gap-3 pb-4">
          <button
            onClick={goToQuiz}
            className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200"
          >
            👉 QUERO DESCOBRIR MEU PROBLEMA
          </button>
          <p className="text-gray-400 text-xs text-center">
            🔒 100% gratuito · Resultado na hora · Sem compromisso
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  )
}
