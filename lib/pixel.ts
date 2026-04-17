export const PIXEL_ID = '1100861306437148'

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    _fbq: any
  }
}

export function pageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export function initiateCheckout() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      currency: 'BRL',
      value: 57.00,
    })
  }
}

export function viewContent(stepName: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: stepName,
      content_category: 'Funil',
    })
  }
}
