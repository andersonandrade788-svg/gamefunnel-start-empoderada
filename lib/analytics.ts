declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function trackStep(stepName: string, stepNumber: number) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'funil_step', {
    event_category: 'Funil',
    event_label: stepName,
    step_number: stepNumber,
  })
}
