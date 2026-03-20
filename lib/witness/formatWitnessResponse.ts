import type { MirrorState } from '@/lib/mirror/types'

export type WitnessResponse = {
  seen: string
  permission: string
  witnessLine: string
}

function categoryWitness(pattern: string): WitnessResponse | null {
  switch (pattern) {
    case 'unsettled':
      return {
        seen: 'Something here feels hard to place.',
        permission: 'Nothing needs to be solved in this moment.',
        witnessLine: 'Stay with one breath and let it be known.',
      }
    case 'unclear':
      return {
        seen: 'This does not need to become clear right away.',
        permission: 'You are allowed to let this stay open.',
        witnessLine: 'Let not-knowing rest in awareness for one breath.',
      }
    case 'mixed':
      return {
        seen: 'More than one thing may be asking for space.',
        permission: 'It does not need to become simpler right now.',
        witnessLine: 'Notice one, then the other, without choosing yet.',
      }
    case 'tender':
      return {
        seen: 'Something here is asking to be held gently.',
        permission: 'This can be here without hardening around it.',
        witnessLine: 'Soften around it for one breath.',
      }
    case 'threshold':
      return {
        seen: 'This may still be unfolding.',
        permission: 'You do not need to settle it yet.',
        witnessLine: 'Let this stay unfinished for one moment more.',
      }
    case 'overwhelm':
    case 'anxiety':
    case 'freeze':
    case 'despair':
    case 'depletion':
      return {
        seen: 'A strained state is here.',
        permission: 'You do not need to do more right now.',
        witnessLine: 'Stay with one slower breath.',
      }
    default:
      return null
  }
}

export function formatWitnessResponse(state: MirrorState): WitnessResponse {
  const category = categoryWitness(state.primaryPattern)
  if (category) return category

  const seen = (state.seen ?? '').trim()
  if (seen) {
    return {
      seen: 'Something here wants simple attention.',
      permission: 'It does not need to be resolved right now.',
      witnessLine: 'Stay with one breath and let it be known.',
    }
  }

  return {
    seen: 'Something is here.',
    permission: 'It does not need to be changed right now.',
    witnessLine: 'Stay with one breath and let it be here.',
  }
}
