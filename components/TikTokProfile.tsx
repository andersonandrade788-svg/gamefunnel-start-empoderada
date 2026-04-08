'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/StatusBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comment {
  user: string
  text: string
  likes: number
}

interface VideoData {
  id: number
  videoSrc: string
  description: string
  song: string
  likes: string
  likesNum: number
  saves: string
  savesNum: number
  comments: Comment[]
  overlayColor: string
  isCTA?: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VIDEOS: VideoData[] = [
  {
    id: 1,
    videoSrc: '/Video TK 01.Mp4',
    description: 'você não falhou… você foi colocada no sistema errado 😮 #emagrecimento #mulher',
    song: 'áudio original - Giovanna Bueno',
    likes: '14.2K',
    likesNum: 14200,
    saves: '3.1K',
    savesNum: 3100,
    overlayColor: 'from-purple-900/60',
    comments: [
      { user: 'ana_fitness',  text: 'isso me descreveu demais 😭',               likes: 234 },
      { user: 'carol.real',   text: 'finalmente alguém falando a verdade',        likes: 189 },
      { user: 'ju_treinos',   text: 'passei anos me culpando e era isso',         likes: 156 },
      { user: 'mari_saude',   text: 'minha terapeuta falou a mesma coisa',        likes: 98  },
      { user: 'paula_fit',    text: 'o sistema foi feito pra gente falhar mesmo', likes: 67  },
    ],
  },
  {
    id: 2,
    videoSrc: '/Video TK 02.Mp4',
    description: 'disciplina não é o problema. nunca foi 👀 #verdade #sistemaerrado',
    song: 'áudio original - Giovanna Bueno',
    likes: '22.7K',
    likesNum: 22700,
    saves: '5.4K',
    savesNum: 5400,
    overlayColor: 'from-pink-900/60',
    comments: [
      { user: 'thais_move',      text: 'eu chorei assistindo isso',                    likes: 412 },
      { user: 'bela.empoderada', text: 'como ninguém nunca disse isso antes??',         likes: 301 },
      { user: 'gio_life',        text: 'compartilhei com minha amiga que tá desistindo', likes: 278 },
      { user: 'renata_m',        text: 'isso é libertador demais',                     likes: 145 },
      { user: 'cris.saude',      text: 'exatamente o que eu precisava ouvir hoje',     likes: 89  },
    ],
  },
  {
    id: 3,
    videoSrc: '/Video Tk 03.Mp4',
    description: 'o que ninguém te ensinou sobre manter o resultado 🔥 #método #transformação',
    song: 'áudio original - Giovanna Bueno',
    likes: '31.5K',
    likesNum: 31500,
    saves: '7.8K',
    savesNum: 7800,
    overlayColor: 'from-blue-900/60',
    comments: [
      { user: 'dani_fit',    text: 'agora faz total sentido!!',                   likes: 523 },
      { user: 'lu_wellness', text: 'sistema > motivação. simples assim',           likes: 445 },
      { user: 'camila.real', text: 'esse vídeo mudou minha cabeça',                likes: 334 },
      { user: 'fer_saude',   text: 'qual é o método dela? alguém sabe?',           likes: 201 },
      { user: 'nina_move',   text: 'link na bio funciona mesmo, entrei ontem',     likes: 178 },
    ],
  },
  {
    id: 4,
    videoSrc: '/Video Tk 04.Mp4',
    description: 'antes eu desistia em menos de 1 semana. hoje é diferente 💪 #resultado #prova',
    song: 'áudio original - Giovanna Bueno',
    likes: '18.9K',
    likesNum: 18900,
    saves: '4.2K',
    savesNum: 4200,
    overlayColor: 'from-emerald-900/60',
    comments: [
      { user: 'aline_t',       text: 'eu era igualzinha! semana passada comecei de novo', likes: 267 },
      { user: 'pri.empoderada', text: 'quero muito esse resultado',                       likes: 198 },
      { user: 'Sandra_oficial', text: 'não tô sozinha nessa luta então rs',               likes: 156 },
      { user: 'bruna_vida',     text: 'isso é real, confirmo. entrei mês passado',        likes: 134 },
      { user: 'tati_fit',       text: 'como começar?',                                    likes: 89  },
    ],
  },
  {
    id: 5,
    videoSrc: '/Video Tk 05.Mp4',
    description: 'se você tá cansada de recomeçar… entra aqui 👇 o link tá na bio #startempoderada',
    song: 'áudio original - Giovanna Bueno',
    likes: '41.3K',
    likesNum: 41300,
    saves: '9.6K',
    savesNum: 9600,
    overlayColor: 'from-red-900/60',
    isCTA: true,
    comments: [
      { user: 'mari_new',    text: 'entrei! primeira semana incrível',       likes: 612 },
      { user: 'ju_start',    text: 'vale muito, recomendo demais',            likes: 534 },
      { user: 'carol_emp',   text: 'faz 3 semanas e já sinto diferença',      likes: 445 },
      { user: 'ana_sistema', text: 'o suporte delas é diferenciado',          likes: 312 },
      { user: 'lara_fit',    text: 'fiz a pergunta no link e já tô dentro',   likes: 267 },
    ],
  },
]

// ─── Per-video state ───────────────────────────────────────────────────────────

interface VideoState {
  liked: boolean
  saved: boolean
  likesCount: number
  savesCount: number
  commentsOpen: boolean
}

function initState(videos: VideoData[]): VideoState[] {
  return videos.map((v) => ({
    liked: false,
    saved: false,
    likesCount: v.likesNum,
    savesCount: v.savesNum,
    commentsOpen: false,
  }))
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function TikTokProfile() {
  const router = useRouter()
  const [states, setStates] = useState<VideoState[]>(() => initState(VIDEOS))

  function toggleLike(idx: number) {
    setStates((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              liked: !s.liked,
              likesCount: s.liked ? s.likesCount - 1 : s.likesCount + 1,
            }
          : s,
      ),
    )
  }

  function toggleSave(idx: number) {
    setStates((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              saved: !s.saved,
              savesCount: s.saved ? s.savesCount - 1 : s.savesCount + 1,
            }
          : s,
      ),
    )
  }

  function openComments(idx: number) {
    setStates((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, commentsOpen: true } : s)),
    )
  }

  function closeComments(idx: number) {
    setStates((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, commentsOpen: false } : s)),
    )
  }

  return (
    <div
      className="mobile-frame tiktok-feed bg-black"
      style={{ height: '100dvh', overflowX: 'hidden' }}
    >
      {VIDEOS.map((video, idx) => (
        <VideoSlide
          key={video.id}
          video={video}
          state={states[idx]}
          onLike={() => toggleLike(idx)}
          onSave={() => toggleSave(idx)}
          onOpenComments={() => openComments(idx)}
          onCloseComments={() => closeComments(idx)}
          onCTA={() => router.push('/sales')}
        />
      ))}
    </div>
  )
}

// ─── VideoSlide ────────────────────────────────────────────────────────────────

interface VideoSlideProps {
  video: VideoData
  state: VideoState
  onLike: () => void
  onSave: () => void
  onOpenComments: () => void
  onCloseComments: () => void
  onCTA: () => void
}

function VideoSlide({
  video,
  state,
  onLike,
  onSave,
  onOpenComments,
  onCloseComments,
  onCTA,
}: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showPauseIcon, setShowPauseIcon] = useState(false)

  // Auto-play/pause based on visibility (IntersectionObserver)
  useEffect(() => {
    const el = containerRef.current
    const vid = videoRef.current
    if (!el || !vid) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {})
          setIsPlaying(true)
        } else {
          vid.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleTap() {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) {
      vid.play().catch(() => {})
      setIsPlaying(true)
    } else {
      vid.pause()
      setIsPlaying(false)
    }
    setShowPauseIcon(true)
    setTimeout(() => setShowPauseIcon(false), 700)
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black overflow-hidden"
      style={{ height: '100dvh', scrollSnapAlign: 'start', flexShrink: 0 }}
      onClick={handleTap}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        src={video.videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
      />

      {/* Tap feedback icon */}
      {showPauseIcon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4 animate-ping-once">
            {isPlaying ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Gradient overlay — color per video + dark bottom vignette */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${video.overlayColor} to-transparent`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <StatusBar dark={true} />
      </div>

      {/* CTA button — last video only, above bottom info */}
      {video.isCTA && (
        <div className="absolute bottom-48 left-0 right-0 z-20 flex justify-center px-10">
          <button
            onClick={(e) => { e.stopPropagation(); onCTA() }}
            className="bg-[#22C55E] text-black font-bold text-base py-4 px-8 rounded-2xl shadow-2xl active:scale-95 transition-all duration-200 animate-greenPulse"
          >
            ACESSAR AGORA →
          </button>
        </div>
      )}

      {/* Bottom-left: profile info + description + song */}
      <div className="absolute bottom-0 left-0 right-16 z-20 px-4 pb-6 flex flex-col gap-2">
        {/* Profile row */}
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
            <Image
              src="/geovana.jpg"
              alt="Giovanna Bueno"
              width={44}
              height={44}
              className="object-cover object-top"
            />
          </div>
          <span className="text-white font-semibold text-sm">Giovanna Bueno</span>
          <button className="border border-white text-white text-xs font-semibold px-5 py-2.5 min-h-[44px] rounded-sm ml-1">
            Seguir
          </button>
        </div>

        {/* Description */}
        <p
          className="text-white text-sm leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.description}
        </p>

        {/* Song ticker */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-white text-xs flex-shrink-0">🎵</span>
          <div className="overflow-hidden flex-1">
            <div className="flex whitespace-nowrap animate-ticker" style={{ width: 'max-content' }}>
              <span className="text-white text-sm pr-8">{video.song}</span>
              <span className="text-white text-sm pr-8">🎵 {video.song}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white">
            <Image
              src="/geovana.jpg"
              alt="Giovanna Bueno"
              width={44}
              height={44}
              className="object-cover object-top"
            />
          </div>
          {/* Follow pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#E91E8C] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        </div>

        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); onLike() }} className="flex flex-col items-center gap-0.5 min-h-[44px] active:scale-90 transition-transform">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill={state.liked ? '#FE2C55' : 'white'}
            className="drop-shadow"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className={`text-xs font-semibold drop-shadow ${state.liked ? 'text-[#FE2C55]' : 'text-white'}`}>
            {formatCount(state.likesCount)}
          </span>
        </button>

        {/* Comments */}
        <button onClick={(e) => { e.stopPropagation(); onOpenComments() }} className="flex flex-col items-center gap-0.5 min-h-[44px] active:scale-90 transition-transform">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white" className="drop-shadow">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
          </svg>
          <span className="text-white text-xs font-semibold drop-shadow">
            {video.comments.length}
          </span>
        </button>

        {/* Save / Bookmark */}
        <button onClick={(e) => { e.stopPropagation(); onSave() }} className="flex flex-col items-center gap-0.5 min-h-[44px] active:scale-90 transition-transform">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={state.saved ? '#FFD60A' : 'white'}
            className="drop-shadow"
          >
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
          <span className={`text-xs font-semibold drop-shadow ${state.saved ? 'text-[#FFD60A]' : 'text-white'}`}>
            {formatCount(state.savesCount)}
          </span>
        </button>

        {/* Share */}
        <div className="flex flex-col items-center gap-0.5 min-h-[44px]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="drop-shadow">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          <span className="text-white text-xs font-semibold drop-shadow">Compartilhar</span>
        </div>
      </div>

      {/* Comments modal */}
      {state.commentsOpen && (
        <CommentsModal
          comments={video.comments}
          onClose={onCloseComments}
        />
      )}
    </div>
  )
}

// ─── CommentsModal ─────────────────────────────────────────────────────────────

function CommentsModal({
  comments,
  onClose,
}: {
  comments: Comment[]
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 bg-[#1C1C1C] rounded-t-2xl flex flex-col animate-slideUpModal"
        style={{ maxHeight: '70dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <span className="text-white font-semibold text-base">Comentários</span>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Comment list */}
        <div className="overflow-y-auto flex-1 px-4 py-2">
          {comments.map((c) => (
            <div key={c.user} className="flex items-start gap-3 py-3 border-b border-white/5">
              {/* Avatar initial */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold uppercase">
                  {c.user.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white/60 text-sm font-semibold">@{c.user}</span>
                <p className="text-white text-sm leading-snug mt-0.5">{c.text}</p>
              </div>
              {/* Like count */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.5">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-white/50 text-[10px]">{c.likes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar — decorative */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/geovana.jpg"
              alt=""
              width={32}
              height={32}
              className="object-cover object-top"
            />
          </div>
          <div className="flex-1 bg-white/10 rounded-full px-4 py-2">
            <span className="text-white/30 text-sm">Adicionar comentário...</span>
          </div>
          <button className="text-[#E91E8C]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
