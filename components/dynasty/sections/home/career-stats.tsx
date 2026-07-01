// components/dynasty/sections/home/career-stats.tsx

import { Trophy } from 'lucide-react'
import { GlanceCard } from '@/components/ui/glance-card'
import type { Dynasty } from '@/dal/features/dynasty'

interface CareerStatsProps {
    dynasty: Dynasty
}

export function CareerStats({ dynasty }: CareerStatsProps) {
    return (
        <div>
            <h2 className="mb-3 text-lg font-bold text-text">Career</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <GlanceCard
                    label="All-Time"
                    value={`${dynasty.total_wins}-${dynasty.total_losses}`}
                />
                <GlanceCard
                    icon={<Trophy className="h-4 w-4 text-amber-500" />}
                    label="N. Championships"
                    value={String(dynasty.championships)}
                />
                <GlanceCard
                    label="Seasons"
                    value={String(dynasty.seasons_played)}
                />
                <GlanceCard
                    label="Coach Lvl."
                    value={String(dynasty.coach_level)}
                />
            </div>
        </div>
    )
}
