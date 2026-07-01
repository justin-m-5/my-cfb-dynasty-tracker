// components/dynasty/sections/game/recap-tab.tsx

'use client'

import { TextArea } from '@/components/ui/form/text-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import type { Game } from '@/dal/features/games'

interface RecapTabProps {
    game: Game
    updateGame: (field: keyof Game, value: unknown) => void
}

export function RecapTab({ game, updateGame }: RecapTabProps) {
    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Game Recap</CardTitle></CardHeader>
            <CardContent>
                <TextArea
                    value={game.recap ?? ''}
                    onChange={(e) => updateGame('recap', e.target.value)}
                    rows={8}
                    placeholder="Write a summary of the game..."
                />
            </CardContent>
        </Card>
    )
}
