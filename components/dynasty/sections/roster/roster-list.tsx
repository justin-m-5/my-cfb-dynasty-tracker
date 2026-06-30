// components/dynasty/sections/roster/roster-list.tsx

'use client'

import type { RosterPlayer } from '@/dal/features/players'
import { PlayerRow } from './player-row'

interface RosterListProps {
    players: RosterPlayer[]
    totalCount: number
    onEdit: (player: RosterPlayer) => void
    onDelete: (id: string) => void
    onToggleRedshirt: (player: RosterPlayer) => void
}

export function RosterList({ players, totalCount, onEdit, onDelete, onToggleRedshirt }: RosterListProps) {
    if (players.length === 0) {
        return (
            <p className="text-sm text-text/60 py-4 text-center">
                {totalCount === 0 ? 'No players yet. Add your first player.' : 'No players match your filter.'}
            </p>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text/50 border-b border-primary/15">
                <span className="w-6 text-center">#</span>
                <span className="flex-1 min-w-0">Player</span>
                <span className="w-12 text-center hidden sm:block">Year</span>
                <span className="w-7 text-center">OVR</span>
                <span className="w-12 text-center hidden sm:block">Dev</span>
                <span className="w-18 shrink-0" />
            </div>

            {/* Rows */}
            {players.map(player => (
                <PlayerRow
                    key={player.id}
                    player={player}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleRedshirt={onToggleRedshirt}
                />
            ))}
        </div>
    )
}
