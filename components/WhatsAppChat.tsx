'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

interface Message {
  id: number
  text: string
  delay: number
  isOutgoing?: boolean
  isAlert?: boolean
}

const MESSAGES: Message[] = [
  { id: 1,  text: 'vi que você entrou agora', delay: 1000 },
  { id: 2,  text: 'depois daquela ligação...', delay: 1000 },
  { id: 3,  text: 'deixa eu te explicar o que ninguém te explicou antes', delay: 2000 },
  { id: 4,  text: 'ok, tô aqui', delay: 1500, isOutgoing: true },
  { id: 5,  text: 'você não tem problema com disciplina', delay: 2000 },
  { id: 6,  text: 'você só tá tentando do jeito errado', delay: 3000 },
  { id: 7,  text: 'como assim? 😕', delay: 1500, isOutgoing: true },
  { id: 8,  text: 'olha isso com calma', delay: 2000 },
  { id: 9,  text: 'te ensinaram que pra emagrecer você precisa:', delay: 1000 },
  { id: 10, text: 'treinar', delay: 500 },
  { id: 11, text: 'fechar dieta', delay: 500 },
  { id: 12, text: 'ter disciplina', delay: 2000 },
  { id: 13, text: 'sim... sempre fiz isso tudo', delay: 1500, isOutgoing: true },
  { id: 14, text: 'parece certo né', delay: 2000 },
  { id: 15, text: 'mas não funciona', delay: 3000 },
  { id: 16, text: 'verdade 😔 já tentei várias vezes', delay: 1500, isOutgoing: true },
  { id: 17, text: 'e não é pq você não consegue', delay: 2000 },
  { id: 18, text: 'é pq isso não foi feito pra ser sustentável', delay: 4000 },
  { id: 19, text: 'pensa comigo', delay: 1000 },
  { id: 20, text: 'se dependesse só de motivação...', delay: 1000 },
  { id: 21, text: 'você já teria conseguido', delay: 2000 },
  { id: 22, text: 'se dependesse só de força de vontade...', delay: 1000 },
  { id: 23, text: 'você não teria recomeçado tantas vezes', delay: 3000 },
  { id: 24, text: 'nossa... nunca pensei assim 😮', delay: 1500, isOutgoing: true },
  { id: 25, text: 'o problema não é começar', delay: 1000 },
  { id: 26, text: 'é manter', delay: 3000 },
  { id: 27, text: 'e ninguém te ensinou a manter', delay: 2000 },
  { id: 28, text: 'te jogaram em treino aleatório\nem dieta impossível\ne falaram: se vira', delay: 2000 },
  { id: 29, text: 'e quando você não consegue...', delay: 1000 },
  { id: 30, text: 'adivinha?', delay: 2000 },
  { id: 31, text: 'a culpa é minha né 😞', delay: 1500, isOutgoing: true },
  { id: 32, text: 'a culpa vira sua', delay: 3000 },
  { id: 33, text: 'mas não é', delay: 2000 },
  { id: 34, text: 'nunca foi', delay: 3000 },
  { id: 35, text: 'o que sustenta resultado não é disciplina', delay: 2000 },
  { id: 36, text: 'é sistema', delay: 3000 },
  { id: 37, text: 'sistema? como assim? 🤔', delay: 1500, isOutgoing: true },
  { id: 38, text: 'quando você tem um sistema...', delay: 1000 },
  { id: 39, text: 'você não depende de motivação', delay: 1000 },
  { id: 40, text: 'você não decide todo dia', delay: 1000 },
  { id: 41, text: 'você só segue', delay: 2000 },
  { id: 42, text: 'faz sentido!! quero entender mais', delay: 1500, isOutgoing: true },
  { id: 43, text: 'é por isso que você não precisa tentar mais', delay: 1000 },
  { id: 44, text: 'você precisa parar de tentar sozinha', delay: 4000 },
  { id: 45, text: 'deixa eu te mostrar como isso funciona na prática', delay: 2000 },
  { id: 46, text: 'entra aqui ↓', delay: 3000 },
  { id: 47, text: '⚠️ ATENÇÃO', delay: 1000, isAlert: true },
  { id: 48, text: 'estão tentando hackear esse chat e bloquear o compartilhamento do meu método', delay: 2000, isAlert: true },
  { id: 49, text: 'não consigo garantir por quanto tempo essa conversa vai ficar no ar', delay: 2000, isAlert: true },
  { id: 50, text: 'anota AGORA essa senha antes que eu seja tirada do ar 👇', delay: 2000 },
]

export const ACCESS_PASSWORD = 'SISTEMA747'

// Typing indicator shows before certain incoming messages
const TYPING_BEFORE: number[] = [6, 18, 34]

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function WhatsAppChat() {
  const router = useRouter()
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentTime = useRef(formatTime())

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [visibleMessages, isTyping, showCTA])

  useEffect(() => {
    let cancelled = false
    let totalDelay = 0

    const showMessage = async (index: number) => {
      const msg = MESSAGES[index]
      if (!msg) return

      // Show typing indicator before certain incoming messages (not outgoing)
      if (TYPING_BEFORE.includes(msg.id) && !msg.isOutgoing) {
        const typingDelay = msg.id === 18 ? 4000 : 3000
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            if (!cancelled) setIsTyping(true)
            resolve()
          }, 500)
        })
        await new Promise<void>((resolve) => setTimeout(resolve, typingDelay))
        if (cancelled) return
        setIsTyping(false)
        await new Promise<void>((resolve) => setTimeout(resolve, 300))
      }

      if (cancelled) return
      setVisibleMessages((prev) => [...prev, msg.id])

      if (msg.id === 50) {
        setTimeout(() => {
          if (!cancelled) setShowCTA(true)
        }, 800)
        return
      }

      await new Promise<void>((resolve) => setTimeout(resolve, msg.delay || 1000))

      if (!cancelled && index + 1 < MESSAGES.length) {
        showMessage(index + 1)
      }
    }

    setTimeout(() => showMessage(0), 1000)

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mobile-frame bg-white flex flex-col" style={{ height: '100dvh' }}>
      {/* Status Bar */}
      <div className="bg-[#128C7E] flex-shrink-0">
        <StatusBar dark={true} />
      </div>

      {/* Header */}
      <div className="bg-[#128C7E] pb-3 px-3 flex items-center gap-3 shadow-md flex-shrink-0">
        <button
          onClick={() => router.push('/exp1')}
          className="text-white p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img src="/geovana.jpg" alt="Geovana Bueno" className="w-full h-full object-cover object-top" />
        </div>

        {/* Contact info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base leading-tight">Geovana Bueno</p>
          <p className="text-green-200 text-xs">
            {isTyping ? 'digitando...' : 'online'}
          </p>
        </div>

        {/* Icons */}
        <div className="flex gap-4 text-white">
          <button>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
          </button>
          <button>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Skip button */}
      <div className="absolute top-16 right-4 z-50">
        <button
          onClick={() => router.push('/exp3')}
          className="text-white/70 text-xs font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"
        >
          Pular →
        </button>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 whatsapp-bg"
        style={{ paddingBottom: '16px' }}
      >
        {/* Date badge */}
        <div className="flex justify-center mb-4">
          <span className="bg-white/80 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
            Hoje
          </span>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-1">
          {MESSAGES.filter((m) => visibleMessages.includes(m.id)).map((msg) => (
            msg.isAlert
              ? <AlertBubble key={msg.id} text={msg.text} time={currentTime.current} />
              : <MessageBubble key={msg.id} text={msg.text} time={currentTime.current} isOutgoing={!!msg.isOutgoing} />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Senha + CTA */}
          {showCTA && (
            <div className="flex flex-col items-center gap-3 mt-4 animate-fadeIn px-2">
              {/* Card da senha */}
              <div className="w-full bg-[#FFF9C4] border-2 border-yellow-400 rounded-xl p-4 shadow-md">
                <p className="text-gray-700 text-xs font-medium mb-2 text-center">🔐 sua senha de acesso exclusivo:</p>
                <div className="bg-white border border-yellow-300 rounded-lg py-3 px-4 text-center">
                  <span className="text-[#E91E8C] font-black text-2xl tracking-widest">SISTEMA747</span>
                </div>
                <p className="text-gray-500 text-[10px] text-center mt-2">anota ou tira print — você vai precisar</p>
              </div>
              {/* Botão */}
              <button
                onClick={() => router.push('/acesso')}
                className="w-full btn-gradient text-white font-bold text-base py-4 rounded-2xl shadow-xl active:scale-95 transition-all duration-200"
              >
                ANOTEI A SENHA →
              </button>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input bar (decorative) */}
      <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2 flex-shrink-0 border-t border-gray-200">
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-gray-400 text-sm shadow-sm">
          Mensagem
        </div>
        <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  text,
  time,
  isOutgoing,
}: {
  text: string
  time: string
  isOutgoing: boolean
}) {
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm relative ${
          isOutgoing
            ? 'bg-[#DCF8C6] rounded-tr-none'
            : 'bg-white rounded-tl-none'
        }`}
      >
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{text}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isOutgoing ? 'justify-end' : 'justify-end'}`}>
          <span className="text-gray-400 text-[10px]">{time}</span>
          {isOutgoing && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#4FC3F7">
              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

function AlertBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="max-w-[85%] px-3 py-2 rounded-lg shadow-sm bg-red-50 border border-red-300 rounded-tl-none">
        <p className="text-red-700 text-sm leading-relaxed font-medium whitespace-pre-line">{text}</p>
        <div className="flex justify-end mt-0.5">
          <span className="text-red-400 text-[10px]">{time}</span>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 dot-1 inline-block" />
        <span className="w-2 h-2 rounded-full bg-gray-400 dot-2 inline-block" />
        <span className="w-2 h-2 rounded-full bg-gray-400 dot-3 inline-block" />
      </div>
    </div>
  )
}
