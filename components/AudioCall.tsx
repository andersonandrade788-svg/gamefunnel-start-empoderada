'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

type CallState = 'ringing' | 'active' | 'ended'

interface SubtitleEntry {
  time: number
  text: string
}

const SUBTITLES: SubtitleEntry[] = [
  { time: 0, text: 'escuta...' },
  { time: 3, text: 'não desliga' },
  { time: 7, text: 'isso aqui não chegou em você por acaso' },
  { time: 14, text: 'eu só preciso te fazer 3 perguntas' },
  { time: 17, text: 'e você vai entender tudo' },
  { time: 22, text: 'primeira...' },
  { time: 25, text: 'quantas vezes você já começou... e parou?' },
  { time: 30, text: 'uma? duas?' },
  { time: 35, text: 'ou você já perdeu a conta?' },
  { time: 40, text: 'segunda pergunta...' },
  { time: 45, text: 'quanto tempo você consegue manter...' },
  { time: 49, text: 'antes de desistir?' },
  { time: 54, text: 'uma semana? duas?' },
  { time: 59, text: 'até a rotina apertar?' },
  { time: 63, text: 'última...' },
  { time: 67, text: 'você acha que o problema é falta de disciplina?' },
  { time: 74, text: '...é aqui que tudo muda' },
  { time: 79, text: 'não é disciplina' },
  { time: 85, text: 'é o sistema que você tá presa' },
  { time: 92, text: 'você começa motivada' },
  { time: 95, text: 'sem estrutura' },
  { time: 97, text: 'sem acompanhamento' },
  { time: 100, text: 'sem ninguém pra te sustentar' },
  { time: 105, text: 'resultado?' },
  { time: 110, text: 'você tenta, cansa, se culpa, e para' },
  { time: 116, text: 'e toda vez que isso acontece...' },
  { time: 122, text: 'te fazem acreditar que a culpa é sua' },
  { time: 128, text: 'mas não é' },
  { time: 134, text: 'você só foi colocada num sistema... que te faz falhar' },
  { time: 143, text: 'se você continuar assim... vai acontecer de novo' },
  { time: 150, text: 'mas dá pra quebrar isso' },
  { time: 157, text: 'eu vou te mostrar como funciona' },
  { time: 165, text: 'mas você precisa ver agora' },
]

const CALL_END_TIME = 168

export default function AudioCall() {
  const router = useRouter()
  const [callState, setCallState] = useState<CallState>('ringing')
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('')
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [callDuration, setCallDuration] = useState('00:00')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const subtitleIndexRef = useRef(0)
  const audio1Ref = useRef<HTMLAudioElement | null>(null)
  const audio2Ref = useRef<HTMLAudioElement | null>(null)

  // Inicia os dois sons simultaneamente
  useEffect(() => {
    const audio1 = new Audio('/vibrate.mp3')
    const audio2 = new Audio('/vibrate2.mp3')
    audio1.loop = true
    audio2.loop = true
    audio1.volume = 1
    audio2.volume = 1
    audio1Ref.current = audio1
    audio2Ref.current = audio2

    const playBoth = () => {
      audio1.play().catch(() => {})
      audio2.play().catch(() => {})
    }

    const unlock = () => {
      playBoth()
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }

    const p1 = audio1.play()
    const p2 = audio2.play()

    if (p1 !== undefined) {
      p1.catch(() => {
        window.addEventListener('touchstart', unlock, { once: true })
        window.addEventListener('click', unlock, { once: true })
      })
    }
    if (p2 !== undefined) {
      p2.catch(() => {})
    }

    return () => {
      audio1.pause(); audio1.src = ''
      audio2.pause(); audio2.src = ''
    }
  }, [])

  const stopRingtone = () => {
    [audio1Ref, audio2Ref].forEach((ref) => {
      if (ref.current) {
        ref.current.pause()
        ref.current.currentTime = 0
      }
    })
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleAccept = () => {
    stopRingtone()
    setCallState('active')
    subtitleIndexRef.current = 0
    setElapsed(0)
  }

  const handleDecline = () => {
    stopRingtone()
    router.push('/exp2')
  }

  const handleSkip = () => {
    router.push('/exp2')
  }

  const handleSeeNow = () => {
    router.push('/exp2')
  }

  useEffect(() => {
    if (callState !== 'active') return

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1

        if (next >= CALL_END_TIME) {
          clearInterval(timerRef.current!)
          setCallState('ended')
          setSubtitleVisible(false)
          return next
        }

        setCallDuration(formatDuration(next))

        const idx = subtitleIndexRef.current
        if (idx < SUBTITLES.length && SUBTITLES[idx].time <= next) {
          setCurrentSubtitle(SUBTITLES[idx].text)
          setSubtitleVisible(false)
          setTimeout(() => setSubtitleVisible(true), 50)
          subtitleIndexRef.current = idx + 1
        }

        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callState])

  return (
    <div className={`mobile-frame bg-[#1C1C1E] flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden ${callState === 'ringing' ? 'animate-phoneVibrate' : ''}`}>
      <div className="absolute top-0 left-0 right-0 z-50">
        <StatusBar dark={true} />
      </div>
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-12 right-6 text-white/60 text-sm font-medium z-50 hover:text-white transition-colors"
      >
        Pular →
      </button>

      {callState === 'ringing' && (
        <RingingScreen onAccept={handleAccept} onDecline={handleDecline} />
      )}

      {callState === 'active' && (
        <ActiveCallScreen
          callDuration={callDuration}
          onHangUp={handleDecline}
        />
      )}

      {callState === 'ended' && (
        <EndedScreen onSeeNow={handleSeeNow} />
      )}
    </div>
  )
}

function RingingScreen({
  onAccept,
  onDecline,
}: {
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <>
      {/* Top info */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <p className="text-white/60 text-sm font-medium tracking-widest uppercase">
          Ligação recebida
        </p>
        {/* Avatar with ring animation */}
        <div className="relative flex items-center justify-center mt-4">
          <div className="absolute w-32 h-32 rounded-full bg-[#E91E8C]/20 animate-ping" />
          <div className="absolute w-40 h-40 rounded-full bg-[#E91E8C]/10 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl z-10 border-2 border-[#E91E8C]">
            <img src="/geovana.jpg" alt="Geovana Bueno" className="w-full h-full object-cover object-top" />
          </div>
        </div>
        <h1 className="text-white text-3xl font-bold mt-4">Geovana Bueno</h1>
        <p className="text-white/50 text-base">iPhone</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-around w-full px-8 mb-8">
        {/* Decline */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
          </button>
          <span className="text-white text-sm">Recusar</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform animate-callPulse"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
          </button>
          <span className="text-white text-sm">Aceitar</span>
        </div>
      </div>
    </>
  )
}

function ActiveCallScreen({
  callDuration,
  onHangUp,
}: {
  callDuration: string
  onHangUp: () => void
}) {
  return (
    <>
      {/* Top status */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <p className="text-green-400 text-sm font-medium tracking-wider animate-pulse">
          ● Em ligação
        </p>
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl border-2 border-[#E91E8C]">
          <img src="/geovana.jpg" alt="Geovana Bueno" className="w-full h-full object-cover object-top" />
        </div>
        <h1 className="text-white text-2xl font-bold">Geovana Bueno</h1>
        <p className="text-white/50 text-base font-mono">{callDuration}</p>
      </div>

      {/* Controls row */}
      <div className="flex justify-around w-full px-8">
        <CallControl icon="🔇" label="Mudo" />
        <CallControl icon="⌨️" label="Teclado" />
        <CallControl icon="🔊" label="Alto-falante" />
      </div>

      {/* Hang up */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <button
          onClick={onHangUp}
          className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white" style={{ transform: 'rotate(135deg)' }}>
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
          </svg>
        </button>
        <span className="text-white/60 text-sm">Encerrar</span>
      </div>
    </>
  )
}

function CallControl({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <span className="text-white/60 text-xs">{label}</span>
    </div>
  )
}

function EndedScreen({ onSeeNow }: { onSeeNow: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl animate-bounce">🔓</div>
        <h1 className="text-white text-3xl font-bold text-center animate-textGlow">
          acesso liberado
        </h1>
        <p className="text-white/60 text-center text-base leading-relaxed">
          agora você entende por que não funcionou antes
        </p>
      </div>

      <button
        onClick={onSeeNow}
        className="w-full btn-gradient text-white font-bold text-lg py-5 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 animate-accessPulse"
      >
        VER AGORA →
      </button>
    </div>
  )
}
