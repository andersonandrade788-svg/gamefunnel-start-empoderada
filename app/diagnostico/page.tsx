'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

// ─── Classificação ────────────────────────────────────────────────────────────

type Categoria = 'abaixo' | 'normal' | 'sobrepeso' | 'ob1' | 'ob2' | 'ob3'

interface Classificacao {
  categoria: Categoria
  label: string
  grau?: string
  color: string
  bg: string
  border: string
  emoji: string
  texto: string
  pergunta: string
  btn1: string
  btn2: string
}

function getClassificacao(imc: number): Classificacao {
  if (imc < 18.5) return {
    categoria: 'abaixo',
    label: 'Abaixo do peso',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    emoji: '⚠️',
    texto: 'Mas presta atenção:\nisso não significa, automaticamente, um corpo bonito ou firme.\nMuitas mulheres estão magras…\nmas sem estrutura, sem forma e sem definição.\nO seu foco não é emagrecer.\nO seu foco é construir corpo.',
    pergunta: 'Quer que eu te mostre como ganhar forma, firmeza e curvas do jeito certo?',
    btn1: 'Quero ganhar forma',
    btn2: 'Ver como funciona',
  }
  if (imc < 25) return {
    categoria: 'normal',
    label: 'Peso normal',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-300',
    emoji: '✅',
    texto: 'Agora vem a verdade que ninguém te fala:\nTer IMC normal não significa ter o corpo que você quer.\nVocê pode estar no peso…\ne ainda assim ter barriga, flacidez, culote ou falta de definição.\nOu seja: o problema pode não ser o peso.\nPode ser que seu corpo esteja sem modelagem.',
    pergunta: 'Quer que eu te mostre como afinar cintura, levantar bumbum e dar forma ao corpo?',
    btn1: 'Quero modelar meu corpo',
    btn2: 'Me mostra',
  }
  if (imc < 30) return {
    categoria: 'sobrepeso',
    label: 'Sobrepeso',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    emoji: '🔶',
    texto: 'Isso mostra que seu corpo provavelmente está acumulando mais gordura do que deveria.\nE isso costuma aparecer em forma de:\nbarriga persistente, roupa apertando, corpo sem definição e dificuldade de se sentir bem no espelho.\nA boa notícia?\nIsso tem solução quando você para de fazer tudo aleatoriamente.',
    pergunta: 'Quer que eu te mostre o caminho mais rápido para destravar isso?',
    btn1: 'Quero destravar',
    btn2: 'Me mostra o sistema',
  }
  if (imc < 35) return {
    categoria: 'ob1',
    label: 'Obesidade',
    grau: 'Grau I',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-300',
    emoji: '🔴',
    texto: 'Esse resultado mostra que seu corpo precisa de uma estratégia séria e direcionada.\nNão é sobre passar fome.\nNão é sobre treinar até se acabar.\nÉ sobre ter um sistema que faça seu corpo responder com constância.',
    pergunta: 'Quer que eu te mostre como começar de forma prática e possível?',
    btn1: 'Quero começar',
    btn2: 'Me mostra o plano',
  }
  if (imc < 40) return {
    categoria: 'ob2',
    label: 'Obesidade',
    grau: 'Grau II',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-400',
    emoji: '🔴',
    texto: 'Esse resultado mostra que seu corpo precisa de uma estratégia séria e direcionada.\nNão é sobre passar fome.\nNão é sobre treinar até se acabar.\nÉ sobre ter um sistema que faça seu corpo responder com constância.',
    pergunta: 'Quer que eu te mostre como começar de forma prática e possível?',
    btn1: 'Quero começar',
    btn2: 'Me mostra o plano',
  }
  return {
    categoria: 'ob3',
    label: 'Obesidade',
    grau: 'Grau III',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-500',
    emoji: '🔴',
    texto: 'Esse resultado mostra que seu corpo precisa de uma estratégia séria e direcionada.\nNão é sobre passar fome.\nNão é sobre treinar até se acabar.\nÉ sobre ter um sistema que faça seu corpo responder com constância.',
    pergunta: 'Quer que eu te mostre como começar de forma prática e possível?',
    btn1: 'Quero começar',
    btn2: 'Me mostra o plano',
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiagnosticoPage() {
  const router = useRouter()
  const [imc, setImc] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => { trackStep('Diagnostico', 5) }, [])

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

  const classe = imc != null ? getClassificacao(imc) : null

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

  if (!classe || imc == null) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white overflow-x-hidden">
      <div className="sticky top-0 z-50 bg-[#f8fafc]">
        <StatusBar dark={false} />
      </div>

      <div
        className={`max-w-md mx-auto px-5 sm:px-6 py-8 flex flex-col gap-6 transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Título */}
        <div className="text-center animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Diagnóstico Corporal</p>
          <h1 className="text-gray-900 text-2xl font-black leading-tight">
            {nome ? `Pronto, ${nome}.` : 'Pronto.'} Esse é o<br />
            <span className="text-[#22C55E]">seu diagnóstico:</span>
          </h1>
        </div>

        {/* Card IMC + classificação */}
        <div
          className={`bg-white shadow-lg rounded-2xl p-6 border ${classe.border} animate-scaleIn`}
          style={{ animationDelay: '150ms' }}
        >
          <p className="text-gray-500 text-sm text-center mb-3">Seu IMC atual é:</p>
          <div className="flex flex-col items-center gap-2">
            <span className={`text-6xl font-black ${classe.color}`}>
              {imc.toFixed(1)}
            </span>
            <div className="flex flex-col items-center gap-1">
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${classe.bg} ${classe.color} border ${classe.border}`}>
                {classe.emoji} {classe.label}{classe.grau ? ` — ${classe.grau}` : ''}
              </span>
            </div>
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
              <div
                className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-700 rounded-full shadow-md -translate-x-1/2"
                style={{ left: `${Math.min(Math.max(((imc - 15) / 25) * 100, 2), 98)}%` }}
              />
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

        {/* Texto da classificação */}
        <div
          className={`bg-white shadow-sm rounded-2xl p-5 border ${classe.border} animate-fadeInUp`}
          style={{ animationDelay: '250ms' }}
        >
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${classe.color}`}>
            Classificação: {classe.label}{classe.grau ? ` — ${classe.grau}` : ''}
          </p>
          {classe.texto.split('\n').map((linha, i) => (
            linha.trim() === '' ? null : (
              <p key={i} className="text-gray-700 text-sm leading-relaxed mb-2">
                {linha}
              </p>
            )
          ))}
        </div>

        {/* Pergunta + botões */}
        <div
          className="bg-gradient-to-br from-[#f0fdf4] to-white rounded-2xl p-5 border border-[#22C55E]/30 shadow-sm animate-fadeInUp flex flex-col gap-4"
          style={{ animationDelay: '380ms' }}
        >
          <p className="text-gray-800 text-base font-bold leading-snug text-center">
            {classe.pergunta}
          </p>

          <button
            onClick={() => router.push('/sales')}
            className="w-full min-h-[56px] bg-[#22C55E] text-black font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all duration-200 animate-greenPulse px-4"
          >
            {classe.btn1}
          </button>

          <button
            onClick={() => router.push('/sales')}
            className="w-full min-h-[52px] bg-white border-2 border-[#22C55E] text-[#16A34A] font-bold text-base rounded-2xl active:scale-95 transition-all duration-200 px-4"
          >
            {classe.btn2}
          </button>
        </div>

        <p className="text-gray-400 text-xs text-center pb-6 animate-fadeInUp" style={{ animationDelay: '480ms' }}>
          🔒 acesso seguro · sem compromisso
        </p>
      </div>
    </div>
  )
}
