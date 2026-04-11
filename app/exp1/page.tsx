'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

type Screen =
  | { type: 'hook' }
  | { type: 'identification' }
  | { type: 'question'; index: number }
  | { type: 'belief' }
  | { type: 'result' }
  | { type: 'transition' }

const QUESTIONS = [
  {
    question: 'Quando você vê alguém tendo resultado… o que você sente de verdade?',
    options: [
      'Inspiração… mas também frustração',
      'Comparação — por que ela e não eu?',
      'Raiva. Tipo: por que não eu?',
      'Indiferença… já desisti um pouco',
    ],
  },
  {
    question: 'Qual dessas frases descreve melhor sua relação com disciplina?',
    options: [
      'Começo forte e apago depois de 2 semanas',
      'Só mantenho quando vejo resultado rápido',
      'Dependo muito do humor do dia',
      'Tenho disciplina, mas não vejo resultado',
    ],
  },
  {
    question: 'O que você acredita que ainda está te impedindo?',
    options: [
      'Falta de tempo real na minha rotina',
      'Não sei o que funciona de verdade pra mim',
      'Já tentei muito e me decepcionei',
      'Falta alguém me guiando de perto',
    ],
  },
  {
    question: 'Se você pudesse mudar uma coisa agora… qual seria?',
    options: [
      'Ter um corpo que me deixe orgulhosa',
      'Ter energia de verdade no dia a dia',
      'Parar de começar e parar',
      'Me sentir confiante de novo',
    ],
  },
]

const TOTAL_STEPS = 9 // hook + ident + 4 questions + belief + result + transition

function progressFor(screen: Screen): number {
  if (screen.type === 'hook') return 5
  if (screen.type === 'identification') return 15
  if (screen.type === 'question') return 25 + screen.index * 15
  if (screen.type === 'belief') return 82
  if (screen.type === 'result') return 92
  return 100
}

export default function QuizPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>({ type: 'hook' })
  const [animating, setAnimating] = useState(false)

  useEffect(() => { trackStep('Quiz', 1) }, [])

  function next(nextScreen: Screen) {
    setAnimating(true)
    setTimeout(() => {
      setScreen(nextScreen)
      setAnimating(false)
    }, 350)
  }

  function handleOption() {
    if (screen.type === 'identification') {
      next({ type: 'question', index: 0 })
    } else if (screen.type === 'question') {
      if (screen.index < QUESTIONS.length - 1) {
        next({ type: 'question', index: screen.index + 1 })
      } else {
        next({ type: 'belief' })
      }
    }
  }

  const progress = progressFor(screen)

  return (
    <div className="mobile-frame bg-white flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="bg-white flex-shrink-0">
        <StatusBar dark={false} />
      </div>

      {/* Barra de progresso — oculta no hook */}
      {screen.type !== 'hook' && (
        <div className="px-5 pt-3 pb-1 flex-shrink-0">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className={`flex-1 flex flex-col transition-all duration-350 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

        {/* ── TELA 1: HOOK ── */}
        {screen.type === 'hook' && (
          <div className="flex-1 flex flex-col relative">
            {/* Imagem ocupando metade superior da tela */}
            <div className="relative w-full flex-shrink-0" style={{ height: '55vh' }}>
              <img
                src="/tela%20inicial.jpg"
                alt="Start Empoderada"
                className="w-full h-full object-cover object-center"
              />
              {/* Gradiente inferior suave para branco */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Card de conteúdo colado na imagem */}
            <div className="flex flex-col px-6 gap-5 pb-8 pt-1">
              {/* Texto */}
              <div className="flex flex-col gap-3 text-center">
                <h1 className="text-gray-900 font-black text-[1.6rem] leading-tight">
                  Posso ser direta<br />com você?
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Em <strong className="text-gray-800">2 minutos</strong> eu consigo te mostrar por que você ainda não conseguiu o corpo que quer…
                </p>
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <p className="text-[#22C55E] font-black text-base px-2">
                    E não é culpa sua.
                  </p>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
              </div>

              {/* Prova social compacta */}
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex -space-x-1.5">
                  {['VA', 'JO', 'CA'].map((init, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[#22C55E] border-2 border-white flex items-center justify-center text-white text-[8px] font-black">
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs"><strong className="text-gray-800">+2.847 mulheres</strong> já descobriram</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => next({ type: 'identification' })}
                className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all"
              >
                👉 Quero descobrir
              </button>
              <p className="text-gray-300 text-xs text-center">Teste gratuito · 2 minutos · sem compromisso</p>
            </div>
          </div>
        )}

        {/* ── TELA 2: IDENTIFICAÇÃO ── */}
        {screen.type === 'identification' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-6">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Antes de tudo…</p>
              <h2 className="text-gray-900 font-black text-xl leading-snug">
                Qual dessas frases mais parece com você hoje?
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { emoji: '😔', text: 'Eu tento, mas parece que não sai do lugar' },
                { emoji: '💸', text: 'Já investi tempo e dinheiro e não tive retorno' },
                { emoji: '🌀', text: 'Sinto que tô perdida, sem saber por onde começar' },
                { emoji: '🔥', text: 'Sei que tenho potencial, mas sempre trava na hora' },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={handleOption}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm text-left bg-[#22C55E]/8 border-2 border-[#22C55E]/25 text-gray-800 active:bg-[#22C55E] active:text-white active:border-[#22C55E] transition-all duration-150"
                >
                  <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                  <span className="leading-snug">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TELAS 3–6: PERGUNTAS ── */}
        {screen.type === 'question' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-6">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-[#22C55E] text-xs font-black uppercase tracking-widest">
                Pergunta {screen.index + 1} de {QUESTIONS.length}
              </p>
              <h2 className="text-gray-900 font-black text-xl leading-snug">
                {QUESTIONS[screen.index].question}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {QUESTIONS[screen.index].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={handleOption}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm text-left bg-[#22C55E]/8 border-2 border-[#22C55E]/25 text-gray-800 active:bg-[#22C55E] active:text-white active:border-[#22C55E] transition-all duration-150"
                >
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
                  <span className="leading-snug">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TELA 7: QUEBRA DE CRENÇA ── */}
        {screen.type === 'belief' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center py-10">
            <div className="flex flex-col gap-5">
              <span className="text-5xl">💡</span>
              <div className="flex flex-col gap-3">
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Com base no que você respondeu…</p>
                <h2 className="text-gray-900 font-black text-2xl leading-snug">
                  O problema <span className="text-[#22C55E]">NÃO</span> é falta de esforço.
                </h2>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-5 flex flex-col gap-3 text-left">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Você já tentou bastante. Já se esforçou. Já recomeçou mais de uma vez.
                </p>
                <p className="text-gray-900 font-bold text-sm leading-relaxed">
                  O que está travando não é força de vontade.
                </p>
                <p className="text-[#22C55E] font-black text-base leading-relaxed">
                  É que você está tentando do jeito errado — sem um sistema feito pra você.
                </p>
              </div>
            </div>
            <button
              onClick={() => next({ type: 'result' })}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              Entender meu resultado →
            </button>
          </div>
        )}

        {/* ── TELA 8: RESULTADO ── */}
        {screen.type === 'result' && (
          <div className="flex-1 flex flex-col px-5 py-6 gap-5 overflow-y-auto">
            <div className="text-center flex flex-col gap-1">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Seu perfil</p>
              <h2 className="text-gray-900 font-black text-2xl leading-tight">
                Você é do tipo:<br />
                <span className="text-[#22C55E]">"Potencial Travado"</span>
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Identidade */}
              <div className="bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-2xl px-4 py-4">
                <p className="text-[#22C55E] text-xs font-black uppercase tracking-wider mb-2">🔥 Quem você é</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você sabe mais do que a média. Já pesquisou, já tentou, já começou várias vezes. O problema não é conhecimento — é execução com método.
                </p>
              </div>

              {/* Explicação emocional */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                <p className="text-gray-500 text-xs font-black uppercase tracking-wider mb-2">😔 Por que você trava</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você entra motivada, mas sem estrutura. Quando bate o cansaço ou a vida aperta — sem suporte — é natural parar. E isso te frustra mais do que deveria.
                </p>
              </div>

              {/* Futuro medo */}
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                <p className="text-red-400 text-xs font-black uppercase tracking-wider mb-2">⚠️ Se continuar assim…</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Você vai continuar no ciclo de começar, parar e se culpar. E cada vez que isso acontece, a crença de "isso não é pra mim" fica mais forte.
                </p>
              </div>

              {/* Futuro esperança */}
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-2xl px-4 py-4">
                <p className="text-[#22C55E] text-xs font-black uppercase tracking-wider mb-2">✨ Mas quando você ajusta isso…</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Com o sistema certo, o suporte certo e um plano que respeita sua rotina — você vira uma máquina de resultado. E dessa vez, mantém.
                </p>
              </div>
            </div>

            <button
              onClick={() => next({ type: 'transition' })}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all mt-2"
            >
              Ver o meu caminho →
            </button>
          </div>
        )}

        {/* ── TELA 9: MICRO TRANSIÇÃO ── */}
        {screen.type === 'transition' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center py-10">
            <div className="flex flex-col gap-5">
              <span className="text-5xl">🎯</span>
              <div className="flex flex-col gap-4">
                <h2 className="text-gray-900 font-black text-2xl leading-snug">
                  Existe um caminho específico para o seu perfil…
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  E é exatamente o que eu vou te mostrar agora.
                </p>
                <div className="bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-2xl px-5 py-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Mulheres com o seu perfil que seguiram esse método transformaram o corpo em <strong className="text-[#22C55E]">30 dias</strong> — sem academia cara, sem dieta impossível.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/exp3')}
              className="w-full bg-[#22C55E] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              👉 Eu preciso desse caminho
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
