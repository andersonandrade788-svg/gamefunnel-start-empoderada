import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID!
const ACCESS_TOKEN = process.env.META_PIXEL_TOKEN!
const API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

function hash(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventName, eventSourceUrl, clientIp, clientUserAgent, fbc, fbp } = body

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: eventSourceUrl,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp || req.headers.get('x-forwarded-for') || '',
            client_user_agent: clientUserAgent || req.headers.get('user-agent') || '',
            ...(fbc ? { fbc } : {}),
            ...(fbp ? { fbp } : {}),
          },
          ...(eventName === 'InitiateCheckout' ? {
            custom_data: {
              currency: 'BRL',
              value: 397.00,
            },
          } : {}),
        },
      ],
    }

    const response = await fetch(`${API_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.ok ? 200 : 500 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
