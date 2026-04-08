'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

export default function DiagnosticoPage() {
  const router = useRouter()
  const [imc, setImc] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('imc')
    const storedNome = localStorage.getItem('nome')
    if (stored) setImc(parseFloat(stored))
    if (storedNome) setNome(storedNome)
    const t = setTimeout(() => {
      setLoading(false)
      setTimeout(() => setVisible(true), 50)
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  const getClassificacao = (v: number) => {
    if (v < 18.5) return { label: 'Abaixo do peso', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    if (v < 25)   return { label: 'Peso normal', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' }
    if (v < 30)   return { label: 'Sobrepeso', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
    return { label: 'Obesidade', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const classe = imc ? getClassificacao(imc) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col">
        <StatusBar dark={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#22C55E] border-t-transparent animate-spin" />
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-lg">Analisando seu diagnóstico…</p>
            <p className="text-gray-400 text-sm mt-1">calculando seu IMC com base nos seus dados</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white overflow-x-hidden">
      <div className="sticky top-0 z-50 bg-[#f8fafc]">
        <StatusBar dark={false} />
      </div>

      <div className={`max-w-md mx-auto px-5 sm:px-6 py-8 flex flex-col gap-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Título */}
        <div className="text-center animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Diagnóstico Corporal</p>
          <h1 className="text-gray-900 text-2xl font-black leading-tight">
            {nome ? `Pronto, ${nome}.` : 'Pronto.'} Esse é o<br />
            <span className="text-[#22C55E]">seu diagnóstico:</span>
          </h1>
        </div>

        {/* Card IMC */}
        <div className={`bg-white shadow-lg rounded-2xl p-6 border ${classe?.border ?? 'border-gray-100'} animate-scaleIn`} style={{ animationDelay: '150ms' }}>
          <p className="text-gray-500 text-sm text-center mb-3">Seu IMC atual é:</p>
          <div className="flex flex-col items-center gap-2">
            <span className={`text-6xl font-black ${classe?.color ?? 'text-gray-800'}`}>
              {imc?.toFixed(1) ?? '--'}
            </span>
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${classe?.bg} ${classe?.color} border ${classe?.border}`}>
              {classe?.label ?? '—'}
            </span>
          </div>

          {/* Barra visual */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1 px-0.5">
              <span>Baixo</span>
              <span>Normal</span>
              <span>Sobrepeso</span>
              <span>Obesidade</span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-yellow-300 via-green-400 via-orange-400 to-red-500">
              {imc && (
                <div
                  className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-700 rounded-full shadow-md -translate-x-1/2"
                  style={{ left: `${Math.min(Math.max(((imc - 15) / 25) * 100, 2), 98)}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>
        </div>

        {/* Interpretação emocional */}
        <div className="bg-white shadow-sm rounded-2xl p-5 border border-red-100 animate-fadeInUp" style={{ animationDelay: '250ms' }}>
          <p className="text-gray-800 text-sm leading-relaxed font-medium">
            Isso indica que seu corpo já está acumulando mais gordura do que deveria…
          </p>
          <p className="text-gray-500 text-sm mt-2 mb-3">e isso explica:</p>
          <div className="flex flex-col gap-2">
            {['dificuldade pra emagrecer', 'flacidez', 'metabolismo lento'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                <span className="text-red-500 font-bold text-sm">❌</span>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projeção de tempo */}
        <div className="bg-white shadow-sm rounded-2xl p-5 border border-gray-100 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Se você continuar como está…</p>
          <p className="text-gray-800 text-sm leading-relaxed">
            Você pode levar de{' '}
            <span className="font-black text-red-500">2 a 5 anos</span>{' '}
            pra chegar no corpo que você quer.
          </p>
          <p className="text-gray-400 text-xs mt-1">(isso SE não desistir antes)</p>
          <div className="mt-4 h-px bg-gray-100" />
          <p className="text-gray-600 text-sm mt-4 font-medium leading-relaxed">
            "E é exatamente por isso que a maioria{' '}
            <span className="font-black text-gray-800">nunca consegue.</span>"
          </p>
        </div>

        {/* Virada */}
        <div className="bg-gradient-to-br from-[#f0fdf4] to-white rounded-2xl p-5 border border-[#22C55E]/30 shadow-sm animate-fadeInUp" style={{ animationDelay: '450ms' }}>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Mas aqui vai a diferença…</p>
          <p className="text-gray-800 text-sm leading-relaxed font-medium">
            Eu não trabalho com tentativa.<br />
            Eu trabalho com <span className="text-[#22C55E] font-black">método.</span>
          </p>
          <div className="mt-4 bg-white rounded-xl p-4 border border-[#22C55E]/20 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed">
              Com base no seu resultado, eu consigo te mostrar um plano específico pra você mudar seu corpo em{' '}
              <span className="font-black text-[#22C55E]">semanas — não anos.</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fadeInUp pb-8" style={{ animationDelay: '550ms' }}>
          <button
            onClick={() => router.push('/exp3')}
            className="w-full min-h-[56px] bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all duration-200 animate-greenPulse break-words px-4"
          >
            DESBLOQUEAR MEU PLANO AGORA
          </button>
          <p className="text-gray-400 text-xs text-center mt-3">🔒 acesso seguro · sem compromisso</p>
        </div>

      </div>
    </div>
  )
}
