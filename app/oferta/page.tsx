'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

export default function OfertaPage() {
  const router = useRouter()
  return (
    <div className="mobile-frame bg-[#0A0A0A] flex flex-col items-center justify-center min-h-screen px-5">
      <StatusBar dark={true} />
      <div className="flex flex-col items-center gap-4 text-center mt-8">
        <div className="text-5xl">🚀</div>
        <h1 className="text-white font-black text-2xl">Seu plano está pronto!</h1>
        <p className="text-white/60 text-sm leading-relaxed">Em breve você terá acesso ao método completo.</p>
        <button
          onClick={() => router.push('/sales')}
          className="w-full bg-[#22C55E] text-black font-black text-base py-4 rounded-2xl shadow-xl active:scale-95 transition-all duration-200 mt-4"
        >
          VER OFERTA COMPLETA →
        </button>
      </div>
    </div>
  )
}
