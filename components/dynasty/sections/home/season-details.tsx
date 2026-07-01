// components/dynasty/sections/home/season-details.tsx

import { DetailCard } from '@/components/ui/layout/detail-card'
import type { YearRecord } from '@/dal/features/year-records'
import type { Game } from '@/dal/features/games'

interface SeasonDetailsProps {
    yearRecord: YearRecord | null
    games: Game[]
}

export function SeasonDetails({ yearRecord, games }: SeasonDetailsProps) {
    const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')

    let pointsFor = 0
    let pointsAgainst = 0
    for (const g of played) {
        if (g.score) {
            const [pf, pa] = g.score.split('-').map(Number)
            if (!isNaN(pf)) pointsFor += pf
            if (!isNaN(pa)) pointsAgainst += pa
        }
    }

    const diff = pointsFor - pointsAgainst

    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-text">Season Details</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <DetailCard label="Points For" value={String(pointsFor)} />
                <DetailCard label="Points Against" value={String(pointsAgainst)} />
                <DetailCard
                    label="Point Diff"
                    value={`${diff >= 0 ? '+' : ''}${diff}`}
                    color={diff >= 0 ? 'var(--green-600)' : 'var(--red-600)'}
                />
                <DetailCard label="Conf Record" value={yearRecord?.conference_record || '0-0'} />
                <DetailCard label="Bowl Game" value={yearRecord?.bowl_game || '—'} />
                <DetailCard label="Bowl Result" value={yearRecord?.bowl_result || '—'} />
            </div>
        </div>
    )
}
