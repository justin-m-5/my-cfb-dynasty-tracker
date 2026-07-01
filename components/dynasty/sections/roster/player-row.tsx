// components/dynasty/sections/roster/player-row.tsx

import { Pencil, Trash2, Shirt } from 'lucide-react'
import { devTraitColors, type DevTrait } from '@/lib/player-config'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import type { RosterPlayer } from '@/dal/features/players'

interface PlayerRowProps {
    player: RosterPlayer
    onEdit: (player: RosterPlayer) => void
    onDelete: (id: string) => void
    onToggleRedshirt: (player: RosterPlayer) => void
}

export function PlayerRow({ player, onEdit, onDelete, onToggleRedshirt }: PlayerRowProps) {
    const traitColor = player.season.dev_trait ? devTraitColors[player.season.dev_trait as DevTrait] ?? '' : ''

    return (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            {/* Avatar */}
            <PlayerAvatar src={player.avatar_url} alt={player.name} size={28} />

            {/* Jersey # */}
            <span className="w-6 text-center text-xs font-bold text-text/60">
                {player.season.jersey_number ?? '—'}
            </span>

            {/* Name + Position */}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-text block truncate">{player.name}</span>
                <span className="text-[10px] text-text/50">{player.position}</span>
            </div>

            {/* Year */}
            <span className="text-[10px] text-text/60 w-12 text-center hidden sm:block">
                {player.season.year ?? '—'}
            </span>

            {/* Rating */}
            <span className="text-xs font-bold text-text w-7 text-center">
                {player.season.rating ?? '—'}
            </span>

            {/* Dev Trait — always occupies space on sm+ for alignment */}
            <span className={`w-12 text-center rounded-full px-1 py-0.5 text-[10px] font-semibold hidden sm:block ${player.season.dev_trait && player.season.dev_trait !== 'Normal' ? traitColor : 'text-transparent'}`}>
                {player.season.dev_trait && player.season.dev_trait !== 'Normal' ? player.season.dev_trait : '—'}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 w-18 shrink-0 justify-end">
                <button
                    onClick={() => onToggleRedshirt(player)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                    title={player.season.is_redshirted ? 'Remove redshirt' : 'Redshirt'}
                >
                    <Shirt className={`h-3.5 w-3.5 ${player.season.is_redshirted ? 'text-red-500' : 'text-text/30'}`} />
                </button>
                <button
                    onClick={() => onEdit(player)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5 text-text/50" />
                </button>
                <button
                    onClick={() => onDelete(player.id)}
                    className="p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
        </div>
    )
}
