'use client'

import { useEffect, useRef, useState } from 'react'
import type { MirrorVisualState, MirrorBreathProfile } from '@/lib/mirror/types'
import styles from './Orb.module.css'

type OrbProps = {
  visualState?:   MirrorVisualState
  breathProfile?: MirrorBreathProfile
  processing?:    boolean
  reducedMotion?: boolean
}

type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

const DEFAULT_VISUAL: MirrorVisualState = {
  pulseSpeed: 5.5, pulseDepth: 0.05, glowStrength: 0.30,
  contraction: 0.35, grain: 0.30, blur: 0.20,
}

const DEFAULT_BREATH: MirrorBreathProfile = {
  inhale: 4000, holdIn: 1000, exhale: 5000, holdOut: 1000,
}

export default function Orb({
  visualState   = DEFAULT_VISUAL,
  breathProfile = DEFAULT_BREATH,
  processing    = false,
  reducedMotion = false,
}: OrbProps) {
  const [phase, setPhase]   = useState<BreathPhase>('inhale')
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive orb glow color from visual state
  const glowRgba = `rgba(200,185,138,${(visualState.glowStrength * 0.18).toFixed(3)})`
  const glowOuter = `rgba(200,185,138,${(visualState.glowStrength * 0.06).toFixed(3)})`
  const borderOpacity = 0.12 + visualState.glowStrength * 0.12
  const orbScale  = 1.0 - visualState.contraction * 0.18

  // Breath cycle
  useEffect(() => {
    if (processing || reducedMotion) return
    const bp = breathProfile

    function run(ph: BreathPhase) {
      setPhase(ph)
      const durations: Record<BreathPhase, number> = {
        inhale:  bp.inhale,
        holdIn:  bp.holdIn  || 1,
        exhale:  bp.exhale,
        holdOut: bp.holdOut || 1,
      }
      const next: Record<BreathPhase, BreathPhase> = {
        inhale:  'holdIn',
        holdIn:  'exhale',
        exhale:  'holdOut',
        holdOut: 'inhale',
      }
      timerRef.current = setTimeout(() => run(next[ph]), durations[ph])
    }

    run('inhale')
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [breathProfile, processing, reducedMotion])

  const phaseLabel: Record<BreathPhase, string> = {
    inhale: 'inhale', holdIn: '·', exhale: 'exhale', holdOut: '·',
  }
  const phaseOpacity: Record<BreathPhase, number> = {
    inhale: 0.45, holdIn: 0.18, exhale: 0.35, holdOut: 0.14,
  }

  const totalMs = breathProfile.inhale + (breathProfile.holdIn || 0) +
                  breathProfile.exhale + (breathProfile.holdOut || 0)
  const animDuration = processing ? '1.8s' : `${(totalMs / 1000).toFixed(2)}s`

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div
        className={`${styles.orb} ${processing ? styles.processing : ''}`}
        style={{
          '--pulse-speed':   animDuration,
          '--orb-scale':     String(orbScale),
          boxShadow: `0 0 28px ${glowRgba}, 0 0 56px ${glowOuter}, inset 0 0 18px ${glowOuter}`,
          borderColor: `rgba(200,185,138,${borderOpacity.toFixed(3)})`,
        } as React.CSSProperties}
      />
      <div className={styles.ring} style={{ '--pulse-speed': animDuration } as React.CSSProperties} />
      <div
        className={styles.breathLabel}
        style={{ opacity: processing ? 0.15 : phaseOpacity[phase] }}
      >
        {processing ? '·' : phaseLabel[phase]}
      </div>
    </div>
  )
}
