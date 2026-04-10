'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

type Step = 'nome' | 'idade' | 'peso' | 'altura' | 'calculando'

export default function ImcPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('nome')

  useEffect(() => { trackStep('IMC', 4) }, [])
  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [error, setError] = useState('')

  const progress = { nome: 25, idade: 50, peso: 75, altura: 100, calculando: 100 }

  const validar = () => {
    setError('')
    if (step === 'nome' && nome.trim().length < 2) { setError('Digite seu nome completo.'); return false }
    if (step === 'idade') {
      const v = parseInt(idade)
      if (!v || v < 10 || v > 99) { setError('Digite uma idade válida.'); return false }
    }
    if (step === 'peso') {
      const v = parseFloat(peso.replace(',', '.'))
      if (!v || v < 30 || v > 300) { setError('Digite um peso válido (kg).'); return false }
    }
    if (step === 'altura') {
      const v = parseFloat(altura.replace(',', '.'))
      if (!v || v < 1.0 || v > 2.5) { setError('Digite sua altura em metros (ex: 1.65)'); return false }
    }
    return true
  }

  const avancar = () => {
    if (!validar()) return
    if (step === 'nome')   { setStep('idade'); return }
    if (step === 'idade')  { setStep('peso'); return }
    if (step === 'peso')   { setStep('altura'); return }
    if (step === 'altura') {
      setStep('calculando')
      const h = parseFloat(altura.replace(',', '.'))
      const p = parseFloat(peso.replace(',', '.'))
      const imc = p / (h * h)
      localStorage.setItem('imc', imc.toFixed(2))
      localStorage.setItem('nome', nome.trim().split(' ')[0])
      setTimeout(() => router.push('/diagnostico'), 2500)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') avancar()
  }

  if (step === 'calculando') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col overflow-x-hidden">
        <StatusBar dark={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-[#22C55E] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-black text-xl">Calculando seu IMC…</p>
            <p className="text-gray-400 text-sm mt-2">analisando seus dados com o método</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {['Coletando dados…', 'Calculando IMC…', 'Gerando diagnóstico…'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100" style={{ animationDelay: `${i * 0.6}s` }}>
                <div className="w-4 h-4 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
                <span className="text-gray-600 text-sm">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col overflow-x-hidden">
      <StatusBar dark={false} />

      <div className="max-w-md mx-auto w-full px-5 sm:px-6 py-6 flex flex-col gap-6">

        {/* Barra de progresso */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Diagnóstico corporal</span>
            <span>{progress[step]}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${progress[step]}%` }}
            />
          </div>
        </div>

        {/* Cabeçalho */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#16A34A] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            🔬 Diagnóstico Corporal Gratuito
          </div>
          <h1 className="text-gray-900 text-2xl font-black leading-tight">
            {step === 'nome'   && 'Como posso te chamar?'}
            {step === 'idade'  && 'Quantos anos você tem?'}
            {step === 'peso'   && `Qual é o seu peso, ${nome.split(' ')[0]}?`}
            {step === 'altura' && 'Qual é a sua altura?'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {step === 'nome'   && 'Vou personalizar seu diagnóstico pra você'}
            {step === 'idade'  && 'A idade influencia no cálculo do IMC ideal'}
            {step === 'peso'   && 'Informe seu peso atual em quilos'}
            {step === 'altura' && 'Informe sua altura em metros (ex: 1.65)'}
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-3">
          {step === 'nome' && (
            <input
              type="text"
              value={nome}
              onChange={e => { setNome(e.target.value); setError('') }}
              onKeyDown={handleKey}
              placeholder="Seu nome completo"
              autoFocus
              className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-2xl px-4 py-4 text-gray-800 text-base font-medium outline-none transition-colors bg-white shadow-sm"
            />
          )}

          {step === 'idade' && (
            <input
              type="number"
              value={idade}
              onChange={e => { setIdade(e.target.value); setError('') }}
              onKeyDown={handleKey}
              placeholder="Ex: 32"
              autoFocus
              min={10} max={99}
              className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-2xl px-4 py-4 text-gray-800 text-base font-medium outline-none transition-colors bg-white shadow-sm text-center text-2xl font-black"
            />
          )}

          {step === 'peso' && (
            <div className="relative">
              <input
                type="number"
                value={peso}
                onChange={e => { setPeso(e.target.value); setError('') }}
                onKeyDown={handleKey}
                placeholder="Ex: 72"
                autoFocus
                min={30} max={300}
                className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-2xl px-4 py-4 pr-16 text-gray-800 text-base font-medium outline-none transition-colors bg-white shadow-sm text-center text-2xl font-black"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">kg</span>
            </div>
          )}

          {step === 'altura' && (
            <div className="relative">
              <input
                type="number"
                value={altura}
                onChange={e => { setAltura(e.target.value); setError('') }}
                onKeyDown={handleKey}
                placeholder="Ex: 1.65"
                autoFocus
                step="0.01" min={1.0} max={2.5}
                className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-2xl px-4 py-4 pr-4 text-gray-800 text-base font-medium outline-none transition-colors bg-white shadow-sm text-center text-2xl font-black"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">m</span>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            onClick={avancar}
            className="w-full min-h-[56px] bg-[#22C55E] hover:bg-[#16A34A] text-black font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all duration-200"
          >
            {step === 'altura' ? 'VER MEU DIAGNÓSTICO →' : 'CONTINUAR →'}
          </button>

          {/* Indicador de etapa */}
          <div className="flex justify-center gap-2 mt-1">
            {(['nome', 'idade', 'peso', 'altura'] as Step[]).map((s, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#22C55E]' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Rodapé de confiança */}
        <div className="flex items-center justify-center gap-4 text-gray-400 text-xs pb-4">
          <span>🔒 100% privado</span>
          <span>·</span>
          <span>📊 Cálculo gratuito</span>
          <span>·</span>
          <span>⚡ Resultado na hora</span>
        </div>

      </div>
    </div>
  )
}
