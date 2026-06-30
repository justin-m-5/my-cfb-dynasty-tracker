'use client'

import { useEffect, useState } from 'react'

import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import type { YearRecord } from '@/dal/features/year-records'
import { statCategories, type StatCategory } from '@/lib/stat-categories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { StatsTable } from '../player-stats/stats-table'

interface YearStatsProps {
    dynastyId: string
    yearRecords: YearRecord[]
    yearRecordId?: string
    isAllTime?: boolean
}

type PlayerStatRow = PlayerStat & { player_name: string; position: string }

export function YearStats({ dynastyId, yearRecords, yearRecordId, isAllTime = false }: YearStatsProps) {
    const [stats, setStats] = useState<PlayerStatRow[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState<StatCategory>('Passing')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const targetRecords = isAllTime
                    ? yearRecords
                    : yearRecords.filter((record) => record.id === yearRecordId)

                if (targetRecords.length === 0) {
                    setStats([])
                    return
                }

                const results = await Promise.all(
                    targetRecords.map((record) => PlayerStatService.getSeasonTotalsWithNames(dynastyId, record.id))
                )

                setStats(results.flat())
            } catch (error) {
                console.error('Failed to load season history stats:', error)
                setStats([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId, isAllTime, yearRecordId, yearRecords])

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-base">{isAllTime ? 'All-Time Stats' : 'Season Stats'}</CardTitle>
                        <p className="text-xs text-text/60">
                            {isAllTime ? `Aggregated across ${yearRecords.length} seasons` : 'Aggregated season totals by player'}
                        </p>
                    </div>
                    <Select
                        value={category}
                        onChange={(event) => setCategory(event.target.value as StatCategory)}
                        className="h-8 w-full bg-background/80 text-xs sm:w-36"
                    >
                        {statCategories.map((statCategory) => (
                            <option key={statCategory} value={statCategory}>
                                {statCategory}
                            </option>
                        ))}
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-text/60">Loading stats...</p>
                ) : (
                    <StatsTable stats={stats} category={category} />
                )}
            </CardContent>
        </Card>
    )
}
