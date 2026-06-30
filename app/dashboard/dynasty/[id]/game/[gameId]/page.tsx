// app/dashboard/dynasty/[id]/game/[gameId]/page.tsx

import { GameRouter } from '@/components/dynasty/sections/game-router'

interface GamePageProps {
    params: Promise<{ id: string; gameId: string }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { id, gameId } = await params

    return <GameRouter dynastyId={id} gameId={gameId} />
}
