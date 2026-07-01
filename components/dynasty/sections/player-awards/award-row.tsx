// components/dynasty/sections/player-awards/award-row.tsx

'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Award } from '@/dal/features/awards'

interface AwardRowProps {
    award: Award
    onEdit: (award: Award) => void
    onDelete: (id: string) => void
}

export function AwardRow({ award, onEdit, onDelete }: AwardRowProps) {
    return (
        <div className="flex items-center gap-2 px-2 py-2 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            <span className="flex-1 text-sm font-semibold text-text truncate">{award.player_name}</span>
            <span className="flex-1 text-sm text-text/80 truncate">{award.award_name}</span>
            <span className="w-24 text-center text-xs text-text/60 hidden sm:block">{award.team || '—'}</span>
            <div className="w-14 shrink-0 flex items-center justify-end gap-0.5">
                <button
                    onClick={() => onEdit(award)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5 text-text/50" />
                </button>
                <button
                    onClick={() => onDelete(award.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
        </div>
    )
}
