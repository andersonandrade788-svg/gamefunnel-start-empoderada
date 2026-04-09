export const PIXEL_ID = '1419488449427767'

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
      value: 397.00,
    })
  }
}
