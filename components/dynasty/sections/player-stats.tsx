// components/dynasty/sections/player-stats.tsx

'use client'

import { useEffect, useState } from 'react'

import { YearRecordService } from '@/dal/features/year-records'
import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import { statCategories, type StatCategory } from '@/lib/stat-categories'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsTable } from './player-stats/stats-table'

interface PlayerStatsProps {
    dynastyId: string
}

export function PlayerStats({ dynastyId }: PlayerStatsProps) {
    const [stats, setStats] = useState<(PlayerStat & { player_name: string; position: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState<StatCategory>('Passing')

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    const data = await PlayerStatService.getSeasonTotalsWithNames(dynastyId, yr.id)
                    setStats(data)
                }
            } catch (err) {
                console.error('Failed to load player stats:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    if (loading) {
        return <div className="text-sm text-text/60">Loading player stats...</div>
    }

    return (
        <div className="space-y-4 pt-10">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base">Season Stats</CardTitle>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as StatCategory)}
                            className="h-8 w-32 text-base sm:text-xs"
                        >
                            {statCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <StatsTable stats={stats} category={category} />
                </CardContent>
            </Card>
        </div>
    )
}
