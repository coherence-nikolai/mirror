import { Suspense } from 'react'
import ReturnScreen from '@/components/return/ReturnScreen'

export const metadata = { title: 'Mirror — Return' }

export default function ReturnPage() {
  return (
    <Suspense fallback={null}>
      <ReturnScreen />
    </Suspense>
  )
}
