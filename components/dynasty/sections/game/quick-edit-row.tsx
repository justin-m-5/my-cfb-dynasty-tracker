// components/dynasty/sections/game/quick-edit-row.tsx

'use client'

import { useMemo } from 'react'
import { fbsTeams } from '@/lib/fbs-teams'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Game } from '@/dal/features/games'

interface QuickEditRowProps {
    game: Game
    updateGame: (field: keyof Game, value: unknown) => void
}

export function QuickEditRow({ game, updateGame }: QuickEditRowProps) {
    const opponentTeams = useMemo(
        () => fbsTeams.map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name)),
        []
    )

    return (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
            <div className="col-span-2 sm:min-w-45 sm:flex-1">
                <Label className="text-xs">Opponent</Label>
                <Select
                    value={game.opponent}
                    onChange={(e) => updateGame('opponent', e.target.value)}
                    className="mt-1 h-9 text-sm"
                >
                    <option value="">Select</option>
                    <option value="BYE">BYE</option>
                    {opponentTeams.map((t) => (
                        <option key={t.name} value={t.name}>{t.name} ({t.conference})</option>
                    ))}
                </Select>
            </div>
            <div>
                <Label className="text-xs">Location</Label>
                <Select
                    value={game.location}
                    onChange={(e) => updateGame('location', e.target.value)}
                    className="mt-1 h-9 text-sm"
                >
                    <option value="home">Home</option>
                    <option value="away">Away</option>
                    <option value="neutral">Neutral</option>
                    <option value="none">None</option>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Result</Label>
                <Select
                    value={game.result}
                    onChange={(e) => updateGame('result', e.target.value)}
                    className="mt-1 h-9 text-sm"
                >
                    <option value="N/A">—</option>
                    <option value="W">Win</option>
                    <option value="L">Loss</option>
                    <option value="T">Tie</option>
                    <option value="Bye">Bye</option>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Your Score</Label>
                <Input
                    type="number"
                    min={0}
                    value={game.score?.split('-')[0] ?? ''}
                    onChange={(e) => {
                        const opp = game.score?.split('-')[1] ?? '0'
                        updateGame('score', `${e.target.value}-${opp}`)
                    }}
                    className="mt-1 h-9 w-full text-center text-sm sm:w-20"
                />
            </div>
            <div>
                <Label className="text-xs">Opp Score</Label>
                <Input
                    type="number"
                    min={0}
                    value={game.score?.split('-')[1] ?? ''}
                    onChange={(e) => {
                        const you = game.score?.split('-')[0] ?? '0'
                        updateGame('score', `${you}-${e.target.value}`)
                    }}
                    className="mt-1 h-9 w-full text-center text-sm sm:w-20"
                />
            </div>
        </div>
    )
}
