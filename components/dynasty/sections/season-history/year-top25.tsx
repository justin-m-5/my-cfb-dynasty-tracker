'use client'

import { useEffect, useState } from 'react'

import { Top25Service, type Top25Ranking } from '@/dal/features/top25'
import type { YearRecord } from '@/dal/features/year-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWeekDisplayName } from '@/lib/game-utils'

interface YearTop25Props {
    dynastyId: string
    yearRecord: YearRecord
}

export function YearTop25({ dynastyId, yearRecord }: YearTop25Props) {
    const [rankings, setRankings] = useState<Top25Ranking[]>([])
    const [finalWeek, setFinalWeek] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const week = await Top25Service.getLastSavedWeek(dynastyId, yearRecord.year)
                const poll = await Top25Service.getRankings(dynastyId, yearRecord.year, week)
                setFinalWeek(poll.length > 0 ? week : null)
                setRankings(poll)
            } catch (error) {
                console.error('Failed to load final top 25:', error)
                setFinalWeek(null)
                setRankings([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId, yearRecord.year])

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">{yearRecord.year} Final Top 25</CardTitle>
                    {finalWeek !== null && <span className="text-[10px] font-semibold uppercase tracking-wide text-text/50">{getWeekDisplayName(finalWeek)}</span>}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-text/60">Loading Top 25...</p>
                ) : rankings.length === 0 ? (
                    <p className="text-sm text-text/60">No saved poll was found for this season.</p>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-primary/15 bg-background/60">
                        {rankings.map((ranking) => (
                            <div key={ranking.id} className="flex items-center gap-3 border-b border-primary/10 px-3 py-2 text-xs last:border-b-0 hover:bg-primary/5">
                                <div className="w-8 shrink-0 text-right text-sm font-semibold text-text">{ranking.rank}</div>
                                <div className="min-w-0 flex-1 truncate font-medium text-text">{ranking.team_name}</div>
                                <div className="shrink-0 font-medium text-text/65">{ranking.record ?? '—'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
