'use client'

import { lsGet, lsSet } from './localStore'

export type MirrorPrefs = {
  useAI: boolean
  reducedMotion: boolean
  privateSession: boolean
  localOnly: boolean
}

export const MIRROR_PREFS_KEY = 'mirror.prefs'

export const DEFAULT_MIRROR_PREFS: MirrorPrefs = {
  useAI: true,
  reducedMotion: false,
  privateSession: false,
  localOnly: false,
}

export function getMirrorPrefs(): MirrorPrefs {
  return lsGet<MirrorPrefs>(MIRROR_PREFS_KEY, DEFAULT_MIRROR_PREFS)
}

export function setMirrorPrefs(next: MirrorPrefs): boolean {
  return lsSet(MIRROR_PREFS_KEY, next)
}
