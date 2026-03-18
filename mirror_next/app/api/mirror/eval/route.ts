import { NextRequest, NextResponse } from 'next/server'
import { safetyScan }    from '@/lib/mirror/engine/safetyScan'
import { classify }      from '@/lib/mirror/engine/classifier'
import { compileState }  from '@/lib/mirror/engine/stateCompiler'
import { EVAL_CASES }    from '@/lib/mirror/eval/evalCases'
import { scoreCase }     from '@/lib/mirror/eval/scoring'
import type { EvalScore } from '@/lib/mirror/types'

export async function GET() {
  const results: EvalScore[] = []

  for (const ec of EVAL_CASES) {
    const safety = safetyScan(ec.input)
    const classification = classify(ec.input)
    const state = compileState({
      rawInput: ec.input,
      classification,
      safetyTier: safety.tier,
      source: 'deterministic',
    })
    results.push(scoreCase(ec, state))
  }

  const passed  = results.filter(r => r.passed).length
  const total   = results.length
  const summary = { passed, total, rate: `${Math.round(passed / total * 100)}%` }

  return NextResponse.json({ ok: true, summary, results, cases: EVAL_CASES })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { input } = body as { input?: string }
  if (!input) return NextResponse.json({ ok: false, error: 'input required' }, { status: 400 })

  const safety = safetyScan(input)
  const classification = classify(input)
  const state = compileState({
    rawInput: input,
    classification,
    safetyTier: safety.tier,
    source: 'deterministic',
  })

  return NextResponse.json({ ok: true, safety, classification, state })
}
