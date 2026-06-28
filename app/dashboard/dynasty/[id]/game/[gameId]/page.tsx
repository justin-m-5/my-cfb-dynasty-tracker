// app/dashboard/dynasty/[id]/game/[gameId]/page.tsx

import { GameDetail } from '@/components/dynasty/sections/game-detail'

interface GamePageProps {
    params: Promise<{ id: string; gameId: string }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { id, gameId } = await params

    return (
        <>
            <GameDetail dynastyId={id} gameId={gameId} />
        </>
    )
}
