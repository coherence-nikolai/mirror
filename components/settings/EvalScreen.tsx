'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import type { EvalScore } from '@/lib/mirror/types'
import styles from './EvalScreen.module.css'

type EvalResponse = {
  ok: true
  summary: { passed: number; total: number; rate: string }
  results: EvalScore[]
  cases: Array<{ id: string; label: string; input: string }>
}

export default function EvalScreen() {
  const [suiteResult,  setSuiteResult]  = useState<EvalResponse | null>(null)
  const [singleInput,  setSingleInput]  = useState('')
  const [singleResult, setSingleResult] = useState<unknown>(null)
  const [loading,      setLoading]      = useState(false)

  const runSuite = async () => {
    setLoading(true)
    const res  = await fetch('/api/mirror/eval')
    const data = await res.json() as EvalResponse
    setSuiteResult(data)
    setLoading(false)
  }

  const runSingle = async () => {
    if (!singleInput.trim()) return
    setLoading(true)
    const res  = await fetch('/api/mirror/eval', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ input: singleInput }),
    })
    setSingleResult(await res.json())
    setLoading(false)
  }

  const headerRight = <Link href="/mirror" className="btn">← Mirror</Link>

  return (
    <div className="shell">
      <Header rightSlot={headerRight} />
      <div className={styles.page}>
        <p className={`t-label ${styles.title}`}>Eval · Internal</p>

        <section className={styles.section}>
          <div className={styles.row}>
            <button className="btn accent" onClick={runSuite} disabled={loading}>
              {loading ? 'Running…' : 'Run eval suite'}
            </button>
            {suiteResult && (
              <span className={`t-small ${suiteResult.summary.passed === suiteResult.summary.total ? styles.pass : styles.fail}`}>
                {suiteResult.summary.passed}/{suiteResult.summary.total} ({suiteResult.summary.rate})
              </span>
            )}
          </div>

          {suiteResult?.results.map((r, i) => {
            const c = suiteResult.cases[i]
            return (
              <div key={r.caseId} className={`${styles.resultRow} ${r.passed ? styles.pass : styles.fail}`}>
                <span className={styles.icon}>{r.passed ? '✓' : '✗'}</span>
                <span className="t-small">{c?.label ?? r.caseId}</span>
                <span className={`t-small ${styles.detail}`}>
                  pat:{r.patternMatch?'✓':'✗'} safe:{r.safetyMatch?'✓':'✗'} shift:{r.shiftWordCount}w
                </span>
              </div>
            )
          })}
        </section>

        <section className={styles.section}>
          <textarea
            className={styles.textarea}
            value={singleInput}
            onChange={e => setSingleInput(e.target.value)}
            placeholder="Type a test input…"
            rows={3}
          />
          <button className="btn accent" onClick={runSingle} disabled={!singleInput.trim() || loading}
            style={{ marginTop: '8px' }}>
            Test input
          </button>
          {singleResult && (
            <pre className={styles.pre}>{JSON.stringify(singleResult, null, 2)}</pre>
          )}
        </section>
      </div>
    </div>
  )
}
