// components/dynasty/sections/recruiting/recruit-list.tsx

'use client'

import type { Recruit } from '@/dal/features/recruits'
import { RecruitRow } from './recruit-row'

interface RecruitListProps {
    recruits: Recruit[]
    onEdit: (recruit: Recruit) => void
    onDelete: (id: string) => void
}

export function RecruitList({ recruits, onEdit, onDelete }: RecruitListProps) {
    if (recruits.length === 0) {
        return (
            <p className="text-sm text-text/60 py-4 text-center">
                No recruits yet. Add your first recruit above.
            </p>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text/50 border-b border-primary/15">
                <span className="w-7 shrink-0 text-center">★</span>
                <span className="flex-1 min-w-0">Player</span>
                <span className="w-12 shrink-0 text-center">Dev</span>
                <span className="w-8 shrink-0 text-center hidden sm:block">St.</span>
                <span className="w-8 shrink-0 text-center">Nat.</span>
                <span className="w-8 shrink-0 text-center hidden sm:block">St.#</span>
                <span className="w-8 shrink-0 text-center hidden sm:block">Pos.#</span>
                
                <span className="w-12 shrink-0" />
            </div>

            {/* Rows */}
            {recruits.map(recruit => (
                <RecruitRow
                    key={recruit.id}
                    recruit={recruit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
