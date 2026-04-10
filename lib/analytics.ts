declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('_funnel_session')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('_funnel_session', id)
  }
  return id
}

function detectSource(): 'ad' | 'organic' {
  if (typeof window === 'undefined') return 'organic'

  // Verifica se veio de anúncio agora (URL tem fbclid)
  const params = new URLSearchParams(window.location.search)
  if (params.get('fbclid')) {
    localStorage.setItem('_funnel_source', 'ad')
    return 'ad'
  }

  // Verifica se já veio de anúncio nessa sessão
  const saved = localStorage.getItem('_funnel_source')
  return saved === 'ad' ? 'ad' : 'organic'
}

export function trackStep(stepName: string, stepNumber: number) {
  if (typeof window === 'undefined') return

  // Garante que cada step é registrado apenas uma vez por sessão
  const dedupeKey = `_tracked_${getSessionId()}_${stepName}`
  if (localStorage.getItem(dedupeKey)) return
  localStorage.setItem(dedupeKey, '1')

  const source = detectSource()

  // GA4
  if (window.gtag) {
    window.gtag('event', 'funil_step', {
      event_category: 'Funil',
      event_label: stepName,
      step_number: stepNumber,
      source,
    })
  }

  // Supabase via API
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stepName,
      stepNumber,
      sessionId: getSessionId(),
      source,
    }),
  }).catch(() => {})
}
