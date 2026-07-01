// components/dynasty/sections/player-awards/award-list.tsx

'use client'

import type { Award } from '@/dal/features/awards'
import { AwardRow } from './award-row'

interface AwardListProps {
    awards: Award[]
    onEdit: (award: Award) => void
    onDelete: (id: string) => void
}

export function AwardList({ awards, onEdit, onDelete }: AwardListProps) {
    if (awards.length === 0) {
        return <p className="text-sm text-text/60 py-4 text-center">No awards recorded this season.</p>
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-text/50 border-b border-primary/15">
                <span className="flex-1">Player</span>
                <span className="flex-1">Award</span>
                <span className="w-24 text-center hidden sm:block">Team</span>
                <span className="w-14 shrink-0" />
            </div>
            {awards.map(award => (
                <AwardRow
                    key={award.id}
                    award={award}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
