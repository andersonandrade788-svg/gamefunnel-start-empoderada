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

      {/* Banner urgência */}
      <div className="bg-[#c0392b] px-4 py-3 flex items-center justify-center gap-2">
        <span className="text-white text-sm font-black tracking-wide text-center">
          ⚠️ ATENÇÃO — LEIA ANTES DE CONTINUAR
        </span>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">

        {/* Headline */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-gray-900 font-black text-2xl leading-tight">
            O MÉTODO DE 30 DIAS QUE ESTÁ{' '}
            <span className="text-[#22C55E]">TRANSFORMANDO CORPOS</span>,{' '}
            DEVOLVENDO ENERGIA E{' '}
            <span className="bg-yellow-300 px-1">EMPONDERANDO MULHERES</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Descubra por que você não emagrece, não tem energia e não mantém resultado — mesmo tentando de tudo.
          </p>
        </div>

        {/* Antes e depois — foto de perfil */}
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
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>Corpo sem resultado</span>
            <span>Corpo definido e empoderado</span>
          </div>
        </div>

        {/* Card dado científico */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📊</span>
          <div>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-wider mb-1">Dado comprovado</p>
            <p className="text-white text-sm leading-relaxed">
              Mulheres que seguem um sistema estruturado de treino + acompanhamento têm <strong className="text-[#22C55E]">3x mais chance</strong> de manter o resultado por mais de 6 meses.
            </p>
          </div>
        </div>

        {/* Prova social rápida */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
          <div className="flex -space-x-2 flex-shrink-0">
            {['VA', 'JO', 'AS', 'CA'].map((init, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                {init}
              </div>
            ))}
          </div>
          <div>
            <p className="text-gray-800 font-black text-sm">+2.847 mulheres</p>
            <p className="text-gray-400 text-xs">já transformaram seus corpos com o método</p>
          </div>
        </div>

        {/* Depoimento */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-bold text-sm">Vandeilma S.</p>
              <p className="text-[#22C55E] text-xs font-semibold">Perdeu 14kg em 90 dias</p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed italic">
            "Nunca imaginei que conseguiria. Tentei tudo antes e nada funcionava. Com o método da Giovanna foi diferente — finalmente entendi o que estava fazendo de errado."
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pb-8">
          <button
            onClick={goToQuiz}
            className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200"
          >
            FAZER O TESTE GRATUITO AGORA
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
