// app/dashboard/dynasty/[id]/(with-nav)/player-awards/page.tsx

import { PlayerAwards } from '@/components/dynasty/sections/player-awards'

interface PlayerAwardsPageProps {
    params: Promise<{ id: string }>
}

export default async function PlayerAwardsPage({ params }: PlayerAwardsPageProps) {
    const { id } = await params
    return <PlayerAwards dynastyId={id} />
}
