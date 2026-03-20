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
        seen: 'Something feels off.',
        permission: 'It does not need to be solved right now.',
        witnessLine: 'Stay with one breath and let it be here.',
      }
    case 'unclear':
      return {
        seen: 'This is not clear yet.',
        permission: 'You do not need to force clarity.',
        witnessLine: 'Let not-knowing stay open for one breath.',
      }
    case 'mixed':
      return {
        seen: 'Two pulls may be here at once.',
        permission: 'Both can be here without being resolved yet.',
        witnessLine: 'Notice one, then the other.',
      }
    case 'tender':
      return {
        seen: 'Something tender is here.',
        permission: 'It does not need to harden to be held.',
        witnessLine: 'Soften around it for one breath.',
      }
    case 'threshold':
      return {
        seen: 'What used to fit may not fit right now.',
        permission: 'You do not need to decide what this is yet.',
        witnessLine: 'Let this stay unfinished for one breath.',
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
      seen,
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
