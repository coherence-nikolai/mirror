import { NextRequest, NextResponse } from 'next/server'
import { FeedbackRequestSchema }      from '@/lib/mirror/schema'

// Feedback is stored client-side; this endpoint exists for future server-side sync
export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = FeedbackRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  // Future: persist to server-side store here
  return NextResponse.json({ ok: true })
}
