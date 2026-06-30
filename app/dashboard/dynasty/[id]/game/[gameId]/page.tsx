// app/dashboard/dynasty/[id]/game/[gameId]/page.tsx

import { GameDetail } from '@/components/dynasty/sections/game-detail'
import { GameDetailReadOnly } from '@/components/dynasty/sections/game-detail-readonly'

interface GamePageProps {
    params: Promise<{ id: string; gameId: string }>
    searchParams: Promise<{ readonly?: string }>
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
    const { id, gameId } = await params
    const { readonly: ro } = await searchParams

    if (ro === '1') {
        return <GameDetailReadOnly dynastyId={id} gameId={gameId} />
    }

    return <GameDetail dynastyId={id} gameId={gameId} />
}
