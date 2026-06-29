// components/dynasty/sections/advance-season/season-recap.tsx

'use client'

import type { Game } from '@/dal/features/games'
import type { Dynasty } from '@/dal/features/dynasty'
import { getWeekDisplayName, getResultColor } from '@/lib/game-utils'
import { DetailCard } from '@/components/ui/detail-card'

interface SeasonRecapProps {
    dynasty: Dynasty
    games: Game[]
}

export function SeasonRecap({ dynasty, games }: SeasonRecapProps) {
    const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
    const wins = played.filter(g => g.result === 'W').length
    const losses = played.filter(g => g.result === 'L').length

    let pointsFor = 0
    let pointsAgainst = 0
    for (const g of played) {
        if (g.score) {
            const [pf, pa] = g.score.split('-').map(Number)
            if (!isNaN(pf)) pointsFor += pf
            if (!isNaN(pa)) pointsAgainst += pa
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text/80">
                {dynasty.current_year} Season Recap
            </h3>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <DetailCard label="Record" value={`${wins}-${losses}`} />
                <DetailCard label="Points For" value={String(pointsFor)} />
                <DetailCard label="Points Against" value={String(pointsAgainst)} />
                <DetailCard label="Games Played" value={String(played.length)} />
            </div>

            {/* Game results */}
            <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text/50">Results</p>
                {games.map(g => (
                    <div
                        key={g.id}
                        className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${getResultColor(g.result)}`}
                    >
                        <span className="w-16 shrink-0 font-medium text-text/70">
                            {getWeekDisplayName(g.week)}
                        </span>
                        <span className="flex-1 truncate">
                            {g.opponent || 'TBD'}
                        </span>
                        <span className="font-bold shrink-0">
                            {g.result && g.result !== 'N/A' ? `${g.result} ${g.score ?? ''}` : '—'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
