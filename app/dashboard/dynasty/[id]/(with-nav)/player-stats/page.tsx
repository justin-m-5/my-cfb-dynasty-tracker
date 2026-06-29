// app/dashboard/dynasty/[id]/(with-nav)/player-stats/page.tsx

import { PlayerStats } from '@/components/dynasty/sections/player-stats'

interface PlayerStatsPageProps {
    params: Promise<{ id: string }>
}

export default async function PlayerStatsPage({ params }: PlayerStatsPageProps) {
    const { id } = await params
    return <PlayerStats dynastyId={id} />
}
