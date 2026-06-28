// app/dashboard/dynasty/[id]/game/[gameId]/page.tsx

import Link from 'next/link'
import { buttonStyles } from '@/components/ui/button'
import { GameDetail } from '@/components/dynasty/sections/game-detail'

interface GamePageProps {
    params: Promise<{ id: string; gameId: string }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { id, gameId } = await params

    return (
        <>
            <div>
                <Link
                    href={`/dashboard/dynasty/${id}/schedule`}
                    {...buttonStyles({ bg: 'var(--blue-500)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
                >
                    ← Back to Schedule
                </Link>
            </div>
            <GameDetail dynastyId={id} gameId={gameId} />
        </>
    )
}
