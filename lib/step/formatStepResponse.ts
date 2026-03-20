import type { MirrorState } from '@/lib/mirror/types'

export type StepResponse = {
  stateLine: string
  nextStep: string
  whyLine: string
}

function mapCategoryStep(pattern: string): StepResponse | null {
  switch (pattern) {
    case 'unsettled':
      return {
        stateLine: 'Something feels off.',
        nextStep: 'Name one thing that feels true.',
        whyLine: 'A small truth can reduce drift.',
      }
    case 'unclear':
      return {
        stateLine: 'This is not clear yet.',
        nextStep: 'Write down one question, not an answer.',
        whyLine: 'A good question reduces pressure.',
      }
    case 'mixed':
      return {
        stateLine: 'Two pulls are active.',
        nextStep: 'Write one sentence for each side.',
        whyLine: 'Separation reduces internal crowding.',
      }
    case 'tender':
      return {
        stateLine: 'Something here is easily bruised.',
        nextStep: 'Reduce one demand for the next 10 minutes.',
        whyLine: 'Less pressure protects what is soft.',
      }
    case 'threshold':
      return {
        stateLine: 'Something is shifting.',
        nextStep: 'Take one bridging action without deciding everything.',
        whyLine: 'Small movement helps transition without forcing closure.',
      }
    case 'overwhelm':
    case 'anxiety':
      return {
        stateLine: 'The system is overloaded.',
        nextStep: 'Make the task smaller than you think it should be.',
        whyLine: 'Lowering the threshold restores movement.',
      }
    case 'freeze':
      return {
        stateLine: 'Movement is locked up.',
        nextStep: 'Do one physical action that takes less than 20 seconds.',
        whyLine: 'A tiny movement can restart the system.',
      }
    case 'depletion':
      return {
        stateLine: 'Energy is low.',
        nextStep: 'Choose one lighter version of the task.',
        whyLine: 'Less load protects momentum.',
      }
    default:
      return null
  }
}

export function formatStepResponse(state: MirrorState): StepResponse {
  const mapped = mapCategoryStep(state.primaryPattern)
  if (mapped) return mapped

  return {
    stateLine: 'Something here needs a smaller move.',
    nextStep: 'Choose one action you can finish in under two minutes.',
    whyLine: 'A smaller start is easier to trust.',
  }
}
