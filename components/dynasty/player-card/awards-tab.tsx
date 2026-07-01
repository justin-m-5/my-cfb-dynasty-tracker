// components/dynasty/player-card/awards-tab.tsx

'use client'

import { Trophy } from 'lucide-react'

import type { Award } from '@/dal/features/awards'

interface AwardsTabProps {
    awards: Award[]
}

export function AwardsTab({ awards }: AwardsTabProps) {
    return (
        <div className="rounded-2xl border border-primary/15 bg-background/70">
            {awards.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-text/60">
                    No awards recorded for this player.
                </div>
            ) : (
                awards.map((award) => (
                    <div key={award.id} className="flex items-start gap-3 border-b border-primary/10 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-primary/5">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Trophy className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-text">{award.award_name}</div>
                            <div className="text-xs text-text/60">{award.team || 'Team not set'}</div>
                        </div>
                        <div className="shrink-0 text-xs font-semibold text-text/60">{award.year}</div>
                    </div>
                ))
            )}
        </div>
    )
}
