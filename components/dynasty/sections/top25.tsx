// components/dynasty/sections/top25.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { Top25Service, type RankedTeam } from '@/dal/features/top25'
import { fbsTeams } from '@/lib/fbs-teams'
import { getWeekDisplayName, MAX_RANKINGS_WEEK } from '@/lib/game-utils'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RankingRow } from './top25/ranking-row'

const EMPTY_RANKINGS: RankedTeam[] = Array.from({ length: 25 }, () => ({ name: '', record: '' }))

interface Top25Props {
    dynastyId: string
}

export function Top25({ dynastyId }: Top25Props) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [year, setYear] = useState<number | null>(null)
    const [week, setWeek] = useState<number>(0)
    const [rankings, setRankings] = useState<RankedTeam[]>([...EMPTY_RANKINGS])
    const [previousRankings, setPreviousRankings] = useState<RankedTeam[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Init: load dynasty, year, last saved week
    useEffect(() => {
        const init = async () => {
            setLoading(true)
            try {
                const d = await DynastyService.getDynastyById(dynastyId)
                setDynasty(d)
                if (d) {
                    const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                    if (yr) {
                        setYear(yr.year)
                        const lastWeek = await Top25Service.getLastSavedWeek(dynastyId, yr.year)
                        setWeek(lastWeek)
                    }
                }
            } catch (err) {
                console.error('Failed to init top25:', err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [dynastyId])

    // Load rankings when week changes
    useEffect(() => {
        if (!year) return
        const loadWeek = async () => {
            setLoading(true)
            setSaved(false)
            try {
                const rows = await Top25Service.getRankings(dynastyId, year, week)
                
                // Load previous week for comparison
                let prevRows: typeof rows = []
                if (week > 0) {
                    prevRows = await Top25Service.getRankings(dynastyId, year, week - 1)
                    setPreviousRankings(prevRows.map(r => ({ name: r.team_name, record: r.record ?? '' })))
                } else {
                    setPreviousRankings([])
                }

                // If current week has rankings, use them
                if (rows.length > 0) {
                    const mapped: RankedTeam[] = Array.from({ length: 25 }, (_, i) => {
                        const row = rows.find(r => r.rank === i + 1)
                        return { name: row?.team_name ?? '', record: row?.record ?? '' }
                    })
                    setRankings(mapped)
                } else if (prevRows.length > 0) {
                    // Auto-fill from last week if current week is empty
                    const mapped: RankedTeam[] = Array.from({ length: 25 }, (_, i) => {
                        const row = prevRows.find(r => r.rank === i + 1)
                        return { name: row?.team_name ?? '', record: row?.record ?? '' }
                    })
                    setRankings(mapped)
                } else {
                    setRankings([...EMPTY_RANKINGS])
                }
            } catch (err) {
                console.error('Failed to load week:', err)
            } finally {
                setLoading(false)
            }
        }
        loadWeek()
    }, [dynastyId, year, week])

    const handleTeamChange = (index: number, name: string) => {
        setRankings(prev => {
            const copy = [...prev]
            copy[index] = { ...copy[index], name }
            return copy
        })
        setSaved(false)
    }

    const handleSave = async () => {
        if (!year) return
        setSaving(true)
        try {
            await Top25Service.saveRankings(dynastyId, year, week, rankings)
            setSaved(true)
        } catch (err) {
            console.error('Failed to save rankings:', err)
        } finally {
            setSaving(false)
        }
    }

    // Teams not currently ranked (for dropdowns)
    const unrankedTeams = useMemo(() => {
        const rankedNames = new Set(rankings.map(t => t.name).filter(Boolean))
        return fbsTeams.filter(t => !rankedNames.has(t.name)).map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name))
    }, [rankings])

    // Week options: 0 (preseason) through 19 (natty)
    const weekOptions = useMemo(() =>
        Array.from({ length: MAX_RANKINGS_WEEK + 1 }, (_, i) => ({ value: i, label: getWeekDisplayName(i) })),
        []
    )

    if (loading && !dynasty) {
        return <div className="text-sm text-text/60">Loading Top 25...</div>
    }

    return (
        <div className="space-y-4 pt-10">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-base">Top 25 Poll</CardTitle>
                            <Select
                                value={String(week)}
                                onChange={(e) => setWeek(Number(e.target.value))}
                                className="h-8 w-32 text-xs"
                            >
                                {weekOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
                            <Button
                                bg="var(--green-600)"
                                text="white"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1 text-xs font-semibold"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-text/60 py-4 text-center">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* 1-10 */}
                            <div className="rounded-lg border border-primary/15 p-2">
                                {rankings.slice(0, 10).map((team, i) => (
                                    <RankingRow
                                        key={i}
                                        rank={i + 1}
                                        team={team}
                                        previousRankings={previousRankings}
                                        unrankedTeams={unrankedTeams}
                                        onTeamChange={handleTeamChange}
                                    />
                                ))}
                            </div>
                            {/* 11-20 */}
                            <div className="rounded-lg border border-primary/15 p-2">
                                {rankings.slice(10, 20).map((team, i) => (
                                    <RankingRow
                                        key={i + 10}
                                        rank={i + 11}
                                        team={team}
                                        previousRankings={previousRankings}
                                        unrankedTeams={unrankedTeams}
                                        onTeamChange={handleTeamChange}
                                    />
                                ))}
                            </div>
                            {/* 21-25 */}
                            <div className="rounded-lg border border-primary/15 p-2">
                                {rankings.slice(20, 25).map((team, i) => (
                                    <RankingRow
                                        key={i + 20}
                                        rank={i + 21}
                                        team={team}
                                        previousRankings={previousRankings}
                                        unrankedTeams={unrankedTeams}
                                        onTeamChange={handleTeamChange}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
