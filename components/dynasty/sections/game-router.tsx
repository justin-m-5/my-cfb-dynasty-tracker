// components/dynasty/sections/game-router.tsx

'use client'

import { useEffect, useState } from 'react'

import { GameService } from '@/dal/features/games'
import { YearRecordService } from '@/dal/features/year-records'
import { GameDetail } from './game-detail'
import { GameDetailReadOnly } from './game-detail-readonly'

interface GameRouterProps {
    dynastyId: string
    gameId: string
}

export function GameRouter({ dynastyId, gameId }: GameRouterProps) {
    const [mode, setMode] = useState<'loading' | 'edit' | 'readonly'>('loading')

    useEffect(() => {
        const check = async () => {
            try {
                const [game, currentYr] = await Promise.all([
                    GameService.getGameById(gameId),
                    YearRecordService.getCurrentYearRecord(dynastyId),
                ])
                if (game && currentYr && game.year_record_id === currentYr.id) {
                    setMode('edit')
                } else {
                    setMode('readonly')
                }
            } catch {
                setMode('readonly')
            }
        }
        check()
    }, [dynastyId, gameId])

    if (mode === 'loading') {
        return <div className="text-sm text-text/60">Loading...</div>
    }

    if (mode === 'readonly') {
        return <GameDetailReadOnly dynastyId={dynastyId} gameId={gameId} />
    }

    return <GameDetail dynastyId={dynastyId} gameId={gameId} />
}
