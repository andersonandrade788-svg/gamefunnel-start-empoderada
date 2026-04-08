'use client'

import { useState, useEffect } from 'react'

interface StatusBarProps {
  dark?: boolean // true = texto branco (fundo escuro), false = texto escuro (fundo claro)
}

export default function StatusBar({ dark = true }: StatusBarProps) {
  const [time, setTime] = useState('')
  const [battery, setBattery] = useState(82)
  const [charging, setCharging] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Tenta pegar bateria real do dispositivo
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBattery(Math.round(bat.level * 100))
        setCharging(bat.charging)
        bat.addEventListener('levelchange', () => {
          setBattery(Math.round(bat.level * 100))
        })
        bat.addEventListener('chargingchange', () => {
          setCharging(bat.charging)
        })
      }).catch(() => {})
    }
  }, [])

  const color = dark ? 'text-white' : 'text-gray-900'
  const fillColor = dark ? 'bg-white' : 'bg-gray-900'
  const borderColor = dark ? 'border-white/70' : 'border-gray-700'
  const tipColor = dark ? 'bg-white/70' : 'bg-gray-700'

  const batteryFill = Math.max(0, Math.min(100, battery))
  const batteryColor = batteryFill <= 20
    ? (dark ? 'bg-red-400' : 'bg-red-500')
    : charging
    ? 'bg-green-400'
    : fillColor

  return (
    <div className={`flex items-center justify-between px-4 py-2 w-full ${color}`} style={{ fontSize: '14px' }}>
      {/* Horário */}
      <span className="font-semibold font-bold tabular-nums" style={{ fontSize: '15px' }}>{time}</span>

      {/* Direita: sinal + wifi + bateria */}
      <div className="flex items-center gap-1.5">
        {/* Sinal de celular (4 barras) */}
        <div className="flex items-end gap-[2px] h-[13px]">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              className={`w-[3px] rounded-sm ${i < 3 ? fillColor : `${fillColor} opacity-30`}`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {/* WiFi */}
        <svg width="18" height="14" viewBox="0 0 24 18" fill="currentColor" className="opacity-90">
          <path d="M12 6.5C9.1 6.5 6.5 7.6 4.5 9.4L2.8 7.7C5.2 5.5 8.5 4.1 12 4.1s6.8 1.4 9.2 3.6l-1.7 1.7C17.5 7.6 14.9 6.5 12 6.5z"/>
          <path d="M12 10.8c-1.7 0-3.2.7-4.3 1.8L6 11c1.5-1.5 3.6-2.5 6-2.5s4.5 1 6 2.5l-1.7 1.6C15.2 11.5 13.7 10.8 12 10.8z"/>
          <circle cx="12" cy="16" r="2"/>
        </svg>

        {/* Bateria */}
        <div className="flex items-center gap-[2px]">
          <div className={`relative border ${borderColor} rounded-[3px] flex items-center`} style={{ width: '22px', height: '12px', padding: '1px' }}>
            <div
              className={`h-full rounded-[2px] transition-all duration-1000 ${batteryColor}`}
              style={{ width: `${batteryFill}%` }}
            />
            {charging && (
              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold" style={{ color: dark ? '#000' : '#fff' }}>⚡</span>
            )}
          </div>
          {/* Tampa da bateria */}
          <div className={`rounded-r-[1px] w-[2px] h-[5px] ${tipColor}`} />
        </div>

        {/* Percentual */}
        <span className="font-medium" style={{ fontSize: '12px' }}>{batteryFill}%</span>
      </div>
    </div>
  )
}
