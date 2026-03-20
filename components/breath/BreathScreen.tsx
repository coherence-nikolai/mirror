'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Orb from '@/components/orb/Orb'
import { BREATH_PROFILES } from '@/lib/mirror/constants'
import { getPrefs, DEFAULT_PREFS, type MirrorPrefs } from '@/lib/mirror/storage/prefsStore'
import styles from './BreathScreen.module.css'

type BreathMode = {
  id: 'settle' | 'steady' | 'downshift'
  label: string
  inhale: number
  exhale: number
  cycles: number
  note: string
  completeLine: string
}

type Phase = 'inhale' | 'exhale'

const MODES: BreathMode[] = [
  { id: 'settle', label: 'Settle', inhale: 4, exhale: 6, cycles: 6, note: 'Ease the system without forcing it.', completeLine: 'The body can settle without solving everything.' },
  { id: 'steady', label: 'Steady', inhale: 4, exhale: 4, cycles: 8, note: 'Return to evenness and simple rhythm.', completeLine: 'Steadiness grows through repetition.' },
  { id: 'downshift', label: 'Downshift', inhale: 4, exhale: 8, cycles: 5, note: 'Lengthen the exhale and reduce pressure.', completeLine: 'Longer exhales help the system downshift.' },
]

export default function BreathScreen() {
  const [prefs, setPrefs] = useState<MirrorPrefs>(DEFAULT_PREFS)
  const [selectedId, setSelectedId] = useState<BreathMode['id']>('settle')
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cyclesDone, setCyclesDone] = useState(0)
  const [completed, setCompleted] = useState(false)

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    setPrefs(getPrefs())
  }, [])

  const mode = useMemo(() => MODES.find(m => m.id === selectedId) ?? MODES[0], [selectedId])

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!running) return

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1

        if (phase === 'inhale') {
          setPhase('exhale')
          return mode.exhale
        }

        const nextCycles = cyclesDone + 1
        if (nextCycles >= mode.cycles) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setRunning(false)
          setCompleted(true)
          setCyclesDone(nextCycles)
          setPhase('inhale')
          return mode.inhale
        }

        setCyclesDone(nextCycles)
        setPhase('inhale')
        return mode.inhale
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, phase, cyclesDone, mode])

  useEffect(() => {
    setPhase('inhale')
    setSecondsLeft(mode.inhale)
    setCyclesDone(0)
    setCompleted(false)
    setRunning(false)
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  const start = () => {
    if (running) return
    setCompleted(false)
    setRunning(true)
  }

  const pause = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }

  const reset = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
    setCompleted(false)
    setPhase('inhale')
    setSecondsLeft(mode.inhale)
    setCyclesDone(0)
  }

  const headerRight = (
    <>
      <Link href="/mirror" className="btn">Mirror</Link>
      <Link href="/saved" className="btn">Saved</Link>
      <Link href="/settings" className="btn">Settings</Link>
    </>
  )

  const phaseText = phase === 'inhale' ? 'Inhale' : 'Exhale'
  const cyclesLabel = `${Math.min(cyclesDone, mode.cycles)} / ${mode.cycles}`
  const orbWrapClass = [
    styles.orbWrap,
    styles[`mode_${mode.id}`],
    running ? styles.running : '',
    phase === 'inhale' ? styles.phaseInhale : styles.phaseExhale,
  ].filter(Boolean).join(' ')

  return (
    <div className={`shell ${styles.screen}`}>
      <Header rightSlot={headerRight} />

      <div className={styles.modeBar}>
        {MODES.map(item => (
          <button
            key={item.id}
            type="button"
            className={`${styles.modeBtn} ${selectedId === item.id ? styles.active : ''}`}
            onClick={() => setSelectedId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={orbWrapClass}>
        <div className={styles.phaseHalo} aria-hidden="true" />
        <div className={styles.orbArea}>
          <Orb breathProfile={BREATH_PROFILES.default} processing={running} reducedMotion={prefs.reducedMotion} />
        </div>
      </div>

      <div className={styles.centerBlock}>
        <div className="t-label">Breath</div>
        <p className={`t-shift ${styles.phaseLine}`}>{phaseText}</p>
        <p className={`t-small ${styles.countLine}`}>{secondsLeft}s · cycle {cyclesLabel}</p>
        <p className={`t-small ${styles.note}`}>{mode.note}</p>
      </div>

      <div className={styles.actions}>
        {!running ? (
          <button type="button" className="btn accent" onClick={start}>{completed ? 'Begin again' : 'Begin'}</button>
        ) : (
          <button type="button" className="btn accent" onClick={pause}>Pause</button>
        )}
        <button type="button" className="btn" onClick={reset}>Reset</button>
        <Link href="/mirror" className="btn">Return</Link>
      </div>

      {completed && (
        <div className={styles.completeCard}>
          <div className="t-label">Complete</div>
          <p className={`t-shift ${styles.completeLine}`}>{mode.completeLine}</p>
        </div>
      )}

      <div className={styles.detailCard}>
        <div className="t-label">Pattern</div>
        <p className={`t-body ${styles.detailText}`}>{mode.inhale}s inhale · {mode.exhale}s exhale · {mode.cycles} cycles</p>
      </div>
    </div>
  )
}
