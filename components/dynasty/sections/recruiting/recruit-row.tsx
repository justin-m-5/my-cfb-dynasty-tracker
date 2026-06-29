// components/dynasty/sections/recruiting/recruit-row.tsx

import { Pencil, Trash2 } from 'lucide-react'
import { devTraitColors, type DevTrait } from '@/lib/player-config'
import { starsDisplay, starsColor } from '@/lib/recruit-config'
import type { Recruit } from '@/dal/features/recruits'

interface RecruitRowProps {
    recruit: Recruit
    onEdit: (recruit: Recruit) => void
    onDelete: (id: string) => void
}

export function RecruitRow({ recruit, onEdit, onDelete }: RecruitRowProps) {
    const traitColor = recruit.dev_trait ? devTraitColors[recruit.dev_trait as DevTrait] ?? '' : ''

    return (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            {/* Stars */}
            <span className={`w-7 shrink-0 text-center text-[10px] font-bold ${starsColor(recruit.stars)}`}>
                {starsDisplay(recruit.stars)}
            </span>

            {/* Name + Position */}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-text block truncate">{recruit.name}</span>
                <span className="text-[10px] text-text/50">{recruit.position}</span>
            </div>

            {/* Dev Trait */}
            <span className={`w-12 shrink-0 text-center text-[10px] rounded-full font-semibold ${recruit.dev_trait && recruit.dev_trait !== 'Normal' ? traitColor : 'text-text/40'}`}>
                {recruit.dev_trait ?? '—'}
            </span>

            {/* State */}
            <span className="w-8 shrink-0 text-center text-[10px] text-text/60 hidden sm:block">
                {recruit.state ?? '—'}
            </span>

            {/* National Rank */}
            <span className="w-8 shrink-0 text-center text-[10px] text-text/60">
                {recruit.national_rank ?? '—'}
            </span>

            {/* State Rank */}
            <span className="w-8 shrink-0 text-center text-[10px] text-text/60 hidden sm:block">
                {recruit.state_rank ?? '—'}
            </span>

            {/* Position Rank */}
            <span className="w-8 shrink-0 text-center text-[10px] text-text/60 hidden sm:block">
                {recruit.position_rank ?? '—'}
            </span>

            

            {/* Actions */}
            <div className="flex items-center gap-0.5 w-12 shrink-0 justify-end">
                <button
                    onClick={() => onEdit(recruit)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5 text-text/50" />
                </button>
                <button
                    onClick={() => onDelete(recruit.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
        </div>
    )
}
