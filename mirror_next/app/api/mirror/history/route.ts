import { NextResponse } from 'next/server'

// History is stored client-side in localStorage.
// This route exists as a hook for future server-side sync.
export async function GET() {
  return NextResponse.json({ ok: true, message: 'History is stored locally on this device.' })
}
