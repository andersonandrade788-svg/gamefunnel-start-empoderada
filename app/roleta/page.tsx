'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'
import { trackStep } from '@/lib/analytics'

// 8 segmentos, 45° cada. Premio no índice 3.
// Com ponteiro no topo (12h), o centro do segmento 3 está a 3.5 * 45 = 157.5° do topo.
// Rotação final = 5 voltas + (360 - 157.5) = 2002.5°
const FINAL_ROTATION = 2002.5

const SEGMENTS = [
  { lines: ['Acesso', 'VIP'], color: '#7c3aed', text: '#fff' },
  { lines: ['R$ 20', 'de off'], color: '#0369a1', text: '#fff' },
  { lines: ['Bônus', 'Surpresa'], color: '#b45309', text: '#fff' },
  { lines: ['1º mês', 'R$ 37'], color: '#16a34a', text: '#fff', prize: true },
  { lines: ['Consul-', 'toria'], color: '#dc2626', text: '#fff' },
  { lines: ['Material', 'VIP'], color: '#6d28d9', text: '#fff' },
  { lines: ['R$ 10', 'de off'], color: '#0e7490', text: '#fff' },
  { lines: ['Bônus', 'Exclusivo'], color: '#c2410c', text: '#fff' },
]

function toRad(deg: number) { return deg * Math.PI / 180 }

function segmentPath(i: number, cx: number, cy: number, r: number) {
  const startAngle = i * 45
  const endAngle = (i + 1) * 45
  const x1 = cx + r * Math.sin(toRad(startAngle))
  const y1 = cy - r * Math.cos(toRad(startAngle))
  const x2 = cx + r * Math.sin(toRad(endAngle))
  const y2 = cy - r * Math.cos(toRad(endAngle))
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

function textPos(i: number, cx: number, cy: number, r: number) {
  const mid = (i + 0.5) * 45
  return {
    x: cx + r * Math.sin(toRad(mid)),
    y: cy - r * Math.cos(toRad(mid)),
    rotation: mid,
  }
}

export default function RoletaPage() {
  const router = useRouter()
  const [spun, setSpun] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { trackStep('Roleta', 5) }, [])

  function handleSpin() {
    if (spinning || spun) return
    setSpinning(true)
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4.5s cubic-bezier(0.17, 0.67, 0.08, 0.99)'
      wheelRef.current.style.transform = `rotate(${FINAL_ROTATION}deg)`
    }
    setTimeout(() => {
      setSpinning(false)
      setSpun(true)
      setTimeout(() => setWon(true), 500)
    }, 4500)
  }

  const cx = 150, cy = 150, r = 130, textR = 80

  return (
    <div className="mobile-frame bg-[#0D0D0D] flex flex-col items-center" style={{ minHeight: '100dvh' }}>
      <div className="w-full flex-shrink-0 bg-[#0D0D0D]">
        <StatusBar dark />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between w-full px-5 py-6 gap-4">

        {/* Header */}
        <div className="text-center">
          <span className="bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            🎁 Recompensa desbloqueada
          </span>
          <h1 className="text-white font-black text-2xl mt-3 leading-tight">
            Gire a roleta e<br />
            <span className="text-[#22C55E]">conquiste seu prêmio!</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Você tem direito a 1 giro gratuito</p>
        </div>

        {/* Roleta */}
        <div className="relative flex items-center justify-center w-full">
          {/* Ponteiro — fixo no topo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" style={{ marginTop: '-2px' }}>
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '28px solid #facc15',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </div>

          {/* Anel externo */}
          <div className="w-[300px] h-[300px] rounded-full border-4 border-yellow-400/50 shadow-2xl shadow-yellow-400/10 relative overflow-hidden">
            {/* Wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full"
              style={{ willChange: 'transform' }}
            >
              <svg viewBox="0 0 300 300" width="300" height="300">
                {SEGMENTS.map((seg, i) => {
                  const tp = textPos(i, cx, cy, textR)
                  return (
                    <g key={i}>
                      <path
                        d={segmentPath(i, cx, cy, r)}
                        fill={seg.color}
                        stroke="#0D0D0D"
                        strokeWidth="2"
                      />
                      <text
                        x={tp.x}
                        y={tp.y}
                        fill={seg.text}
                        fontSize={seg.prize ? "10" : "9"}
                        fontWeight={seg.prize ? "900" : "700"}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${tp.rotation}, ${tp.x}, ${tp.y})`}
                      >
                        {seg.lines.map((line, li) => (
                          <tspan key={li} x={tp.x} dy={li === 0 ? '-6' : '13'}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )
                })}
                {/* Centro */}
                <circle cx={cx} cy={cy} r="20" fill="#0D0D0D" stroke="#facc15" strokeWidth="3" />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#facc15">★</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Botão de girar */}
        {!won && (
          <button
            onClick={handleSpin}
            disabled={spinning || spun}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 ${
              spinning || spun
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-yellow-500/30'
            }`}
          >
            {spinning ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⟳</span> Girando...
              </span>
            ) : spun ? 'Aguarde...' : '🎰 Girar a Roleta'}
          </button>
        )}

        {/* Premio revelado */}
        {won && (
          <div className="w-full flex flex-col gap-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16a34a]/20 to-[#0D0D0D] border-2 border-[#22C55E]/60 rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E] to-transparent" />
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-[#22C55E] font-bold text-sm uppercase tracking-widest mb-1">Parabéns! Você ganhou</p>
              <p className="text-white font-black text-3xl leading-tight">1º mês por</p>
              <div className="flex items-end justify-center gap-1 mt-1">
                <span className="text-white/60 text-xl font-bold self-start mt-2">R$</span>
                <span className="text-[#22C55E] font-black text-6xl leading-none">37</span>
              </div>
              <p className="text-white/40 text-xs mt-2">depois R$ 67/mês · cancele quando quiser</p>
            </div>

            <a
              href="https://pay.cakto.com.br/36sdo2o_810308"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#22C55E] text-black font-black text-lg py-5 rounded-2xl shadow-2xl shadow-green-500/20 active:scale-95 transition-all text-center block"
            >
              GARANTIR MEU DESCONTO →
            </a>

            <button
              onClick={() => router.push('/sales')}
              className="text-white/30 text-xs text-center py-2 hover:text-white/50 transition-colors"
            >
              Ver todos os detalhes da oferta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
