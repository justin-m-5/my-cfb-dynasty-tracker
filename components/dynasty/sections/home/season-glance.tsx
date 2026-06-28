// components/dynasty/sections/home/season-glance.tsx

import { Calendar, TrendingUp } from 'lucide-react'
import { GlanceCard } from '@/components/ui/glance-card'
import type { Dynasty } from '@/dal/features/dynasty'
import type { YearRecord } from '@/dal/features/year-records'
import type { Game } from '@/dal/features/games'

interface SeasonGlanceProps {
    dynasty: Dynasty
    yearRecord: YearRecord | null
    games: Game[]
}

export function SeasonGlance({ dynasty, yearRecord, games }: SeasonGlanceProps) {
    const wins = games.filter(g => g.result === 'W').length
    const losses = games.filter(g => g.result === 'L').length
    const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
    const nextGame = games.find(g => g.result === 'N/A')
    const currentWeek = nextGame ? nextGame.week : (played.length > 0 ? played[played.length - 1].week + 1 : 1)

    // Streak
    let streak = ''
    if (played.length > 0) {
        const lastResult = played[played.length - 1].result
        let count = 0
        for (let i = played.length - 1; i >= 0; i--) {
            if (played[i].result === lastResult) count++
            else break
        }
        streak = `${lastResult}${count}`
    }

    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-text">
                {dynasty.current_year} Season
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <GlanceCard
                    icon={<Calendar className="h-4 w-4 text-blue-500" />}
                    label="Week"
                    value={String(currentWeek)}
                />
                <GlanceCard
                    label="Record"
                    value={`${wins}-${losses}`}
                />
                <GlanceCard
                    label="Ranking"
                    value={yearRecord?.final_ranking ? `#${yearRecord.final_ranking}` : '—'}
                />
                <GlanceCard
                    icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                    label="Streak"
                    value={streak || '—'}
                />
            </div>
        </div>
    )
}
