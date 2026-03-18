import { NextResponse } from 'next/server'

// Export is handled client-side (localStorage → JSON download).
// This stub exists for future server-side sync export.
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Export is handled client-side.' })
}
