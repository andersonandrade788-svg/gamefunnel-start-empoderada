import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          primary: '#E91E8C',
        },
        dark: '#0A0A0A',
        whatsapp: '#25D366',
        tiktok: '#010101',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        dotTyping: {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
        pingOnce: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(1.3)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        ring: 'ring 1.5s ease-out infinite',
        slideUp: 'slideUp 0.5s ease-out forwards',
        blink: 'blink 1s step-end infinite',
        dotTyping: 'dotTyping 1.4s infinite ease-in-out',
        'ping-once': 'pingOnce 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
