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

export function trackStep(stepName: string, stepNumber: number) {
  if (typeof window === 'undefined') return

  // GA4
  if (window.gtag) {
    window.gtag('event', 'funil_step', {
      event_category: 'Funil',
      event_label: stepName,
      step_number: stepNumber,
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
    }),
  }).catch(() => {})
}
