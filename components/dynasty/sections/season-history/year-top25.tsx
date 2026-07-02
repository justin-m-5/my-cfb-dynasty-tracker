// components/dynasty/sections/season-history/year-top25.tsx

'use client'

import { useEffect, useState } from 'react'

import { Top25Service, type Top25Ranking } from '@/dal/features/top25'
import type { YearRecord } from '@/dal/features/year-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { Select } from '@/components/ui/form/select'
import { getWeekDisplayName } from '@/lib/game-utils'

interface YearTop25Props {
    dynastyId: string
    yearRecord: YearRecord
}

export function YearTop25({ dynastyId, yearRecord }: YearTop25Props) {
    const [rankings, setRankings] = useState<Top25Ranking[]>([])
    const [savedWeeks, setSavedWeeks] = useState<number[]>([])
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const weeks = await Top25Service.getSavedWeeks(dynastyId, yearRecord.year)
                setSavedWeeks(weeks)

                if (weeks.length > 0) {
                    const lastWeek = weeks[weeks.length - 1]
                    setSelectedWeek(lastWeek)
                    const poll = await Top25Service.getRankings(dynastyId, yearRecord.year, lastWeek)
                    setRankings(poll)
                } else {
                    setSelectedWeek(null)
                    setRankings([])
                }
            } catch (error) {
                console.error('Failed to load top 25:', error)
                setSavedWeeks([])
                setSelectedWeek(null)
                setRankings([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId, yearRecord.year])

    const handleWeekChange = async (week: number) => {
        setSelectedWeek(week)
        setLoading(true)
        try {
            const poll = await Top25Service.getRankings(dynastyId, yearRecord.year, week)
            setRankings(poll)
        } catch (error) {
            console.error('Failed to load week rankings:', error)
            setRankings([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">{yearRecord.year} Top 25</CardTitle>
                    {savedWeeks.length > 0 && (
                        <Select
                            value={String(selectedWeek ?? '')}
                            onChange={(e) => handleWeekChange(Number(e.target.value))}
                            className="h-8 w-40 text-xs"
                        >
                            {savedWeeks.map((week) => (
                                <option key={week} value={week}>{getWeekDisplayName(week)}</option>
                            ))}
                        </Select>
                    )}
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
                            <div key={ranking.id} className="flex items-center gap-3 border-b border-primary/10 px-2 py-2 text-xs last:border-b-0 hover:bg-primary/5">
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
