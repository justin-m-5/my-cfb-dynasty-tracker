// app/dashboard/dynasty/[id]/(with-nav)/advance-season/page.tsx

import { AdvanceSeason } from '@/components/dynasty/sections/advance-season'

interface AdvanceSeasonPageProps {
    params: Promise<{ id: string }>
}

export default async function AdvanceSeasonPage({ params }: AdvanceSeasonPageProps) {
    const { id } = await params
    return <AdvanceSeason dynastyId={id} />
}
