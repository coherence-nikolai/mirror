import SavedDetail from '@/components/saved/SavedDetail'

export const metadata = { title: 'Mirror — Saved detail' }

export default function SavedDetailPage({ params }: { params: { id: string } }) {
  return <SavedDetail id={params.id} />
}
