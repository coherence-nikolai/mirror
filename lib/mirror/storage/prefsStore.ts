'use client'

import type { MirrorState } from '../types'
import { lsGet, lsSet, lsDel } from './localStore'

export type MirrorPrefs = {
  useAI: boolean
  reducedMotion: boolean
  privateSession: boolean
  localOnly: boolean
}

export const PREFS_KEY = 'mirror.prefs'
const TEMP_RETURN_KEY = 'mirror.return.current'

export const DEFAULT_PREFS: MirrorPrefs = {
  useAI: true,
  reducedMotion: false,
  privateSession: false,
  localOnly: false,
}

export function getPrefs(): MirrorPrefs {
  return lsGet<MirrorPrefs>(PREFS_KEY, DEFAULT_PREFS)
}

export function setPrefs(next: MirrorPrefs): boolean {
  return lsSet(PREFS_KEY, next)
}

export function clearPrefs(): void {
  lsDel(PREFS_KEY)
}

export function setTempReturnState(state: MirrorState): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(TEMP_RETURN_KEY, JSON.stringify(state))
  } catch {}
}

export function getTempReturnState(): MirrorState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(TEMP_RETURN_KEY)
    return raw ? (JSON.parse(raw) as MirrorState) : null
  } catch {
    return null
  }
}

export function clearTempReturnState(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(TEMP_RETURN_KEY)
  } catch {}
}
