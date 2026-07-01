// components/dynasty/sections/game/quick-edit-row.tsx

'use client'

import { useMemo, useEffect } from 'react'
import { fbsTeams } from '@/lib/fbs-teams'
import { neutralStadiums } from '@/lib/neutral-stadiums'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Game } from '@/dal/features/games'
import type { Dynasty } from '@/dal/features/dynasty'

interface QuickEditRowProps {
    game: Game
    dynasty: Dynasty
    updateGame: (field: keyof Game, value: unknown) => void
}

export function QuickEditRow({ game, dynasty, updateGame }: QuickEditRowProps) {
    const opponentTeams = useMemo(
        () => fbsTeams.map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name)),
        []
    )

    // Handle stadium auto-selection
    useEffect(() => {
        if (game.location === 'home') {
            // Use dynasty's stadium from fbsTeams lookup
            const dynastyTeam = fbsTeams.find(t => t.name === dynasty.school_name)
            updateGame('stadium', dynastyTeam?.stadium || null)
        } else if (game.location === 'away') {
            // Use opponent's stadium
            const oppTeam = fbsTeams.find(t => t.name === game.opponent)
            updateGame('stadium', oppTeam?.stadium || null)
        } else if (game.location === 'neutral' && !game.stadium) {
            // Leave null for neutral, user will pick
            updateGame('stadium', null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.location, game.opponent, dynasty.school_name])

    return (
        <div className="space-y-4">
            {/* Quick edit fields */}
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
                
                {/* Stadium field: auto-filled or dropdown for neutral */}
                {game.location === 'neutral' ? (
                    <div className="col-span-2 sm:flex-1">
                        <Label className="text-xs">Stadium</Label>
                        <Select
                            value={game.stadium || ''}
                            onChange={(e) => updateGame('stadium', e.target.value || null)}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select Neutral Site</option>
                            {neutralStadiums.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Select>
                    </div>
                ) : (
                    <div className="col-span-2 sm:flex-1">
                        <Label className="text-xs">Stadium</Label>
                        <Input
                            value={game.stadium || '—'}
                            readOnly
                            className="mt-1 h-9 text-sm bg-background/50"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
