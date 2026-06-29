// components/dynasty/sections/roster/player-row.tsx

import { Pencil, Trash2, Shirt } from 'lucide-react'
import { devTraitColors, type DevTrait } from '@/lib/player-config'
import type { Player } from '@/dal/features/players'

interface PlayerRowProps {
    player: Player
    onEdit: (player: Player) => void
    onDelete: (id: string) => void
    onToggleRedshirt: (player: Player) => void
}

export function PlayerRow({ player, onEdit, onDelete, onToggleRedshirt }: PlayerRowProps) {
    const traitColor = player.dev_trait
        ? devTraitColors[player.dev_trait as DevTrait] ?? ''
        : ''

    return (
        <div className="flex items-center gap-2 rounded px-2 py-1.5 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            {/* Jersey # */}
            <span className="w-7 text-center text-xs font-bold text-text/60">
                {player.jersey_number ?? '—'}
            </span>

            {/* Name + Position */}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-text block truncate">{player.name}</span>
                <span className="text-[10px] text-text/50">{player.position}</span>
            </div>

            {/* Year */}
            <span className="text-[10px] text-text/60 w-14 text-center hidden sm:block">
                {player.year ?? '—'}
            </span>

            {/* Rating */}
            <span className="text-xs font-bold text-text w-8 text-center">
                {player.rating ?? '—'}
            </span>

            {/* Dev Trait */}
            {player.dev_trait && player.dev_trait !== 'Normal' && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${traitColor} hidden sm:inline`}>
                    {player.dev_trait}
                </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
                <button
                    onClick={() => onToggleRedshirt(player)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                    title={player.is_redshirted ? 'Remove redshirt' : 'Redshirt'}
                >
                    <Shirt className={`h-3.5 w-3.5 ${player.is_redshirted ? 'text-red-500' : 'text-text/30'}`} />
                </button>
                <button
                    onClick={() => onEdit(player)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5 text-text/50" />
                </button>
                <button
                    onClick={() => onDelete(player.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
        </div>
    )
}
