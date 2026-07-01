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
const COLUMN_BREAKS = [
    { start: 0, end: 10 },
    { start: 10, end: 20 },
    { start: 20, end: 25 },
] as const

function getColumnForIndex(index: number) {
    return COLUMN_BREAKS.find(column => index >= column.start && index < column.end) ?? null
}

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
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

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

    useEffect(() => {
        if (!year) return
        const loadWeek = async () => {
            setLoading(true)
            setSaved(false)
            try {
                const rows = await Top25Service.getRankings(dynastyId, year, week)

                let prevRows: typeof rows = []
                if (week > 0) {
                    prevRows = await Top25Service.getRankings(dynastyId, year, week - 1)
                    setPreviousRankings(prevRows.map(r => ({ name: r.team_name, record: r.record ?? '' })))
                } else {
                    setPreviousRankings([])
                }

                if (rows.length > 0) {
                    const mapped: RankedTeam[] = Array.from({ length: 25 }, (_, i) => {
                        const row = rows.find(r => r.rank === i + 1)
                        return { name: row?.team_name ?? '', record: row?.record ?? '' }
                    })
                    setRankings(mapped)
                } else if (prevRows.length > 0) {
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
            const currentTeam = copy[index]
            if (!currentTeam) return prev

            copy[index] = {
                ...currentTeam,
                name,
                record: currentTeam.name === name ? currentTeam.record : '',
            }
            return copy
        })
        setSaved(false)
    }

    const handleReorder = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return
        const fromColumn = getColumnForIndex(fromIndex)
        const toColumn = getColumnForIndex(toIndex)
        if (!fromColumn || !toColumn || fromColumn.start !== toColumn.start) return

        setRankings(prev => {
            if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
                return prev
            }

            const next = [...prev]
            const [movedTeam] = next.splice(fromIndex, 1)
            if (!movedTeam) return prev
            next.splice(toIndex, 0, movedTeam)
            return next
        })
        setSaved(false)
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
        setDropTargetIndex(index)
    }

    const handleDragOver = (index: number) => {
        if (draggedIndex === null) return
        const draggedColumn = getColumnForIndex(draggedIndex)
        const targetColumn = getColumnForIndex(index)
        if (!draggedColumn || !targetColumn || draggedColumn.start !== targetColumn.start) return
        setDropTargetIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setDropTargetIndex(null)
    }

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return
        const draggedColumn = getColumnForIndex(draggedIndex)
        const targetColumn = getColumnForIndex(index)
        if (!draggedColumn || !targetColumn || draggedColumn.start !== targetColumn.start) {
            setDraggedIndex(null)
            setDropTargetIndex(null)
            return
        }
        handleReorder(draggedIndex, index)
        setDraggedIndex(null)
        setDropTargetIndex(null)
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

    const unrankedTeams = useMemo(() => {
        const rankedNames = new Set(rankings.map(t => t.name).filter(Boolean))
        return fbsTeams.filter(team => !rankedNames.has(team.name)).sort((a, b) => a.name.localeCompare(b.name))
    }, [rankings])

    const weekOptions = useMemo(
        () => Array.from({ length: MAX_RANKINGS_WEEK + 1 }, (_, i) => ({ value: i, label: getWeekDisplayName(i) })),
        []
    )

    if (loading && !dynasty) {
        return <div className="text-sm text-text/60">Loading Top 25...</div>
    }

    return (
        <div className="space-y-4 pt-10">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-3">
                        <CardTitle className="text-base">Top 25 Poll</CardTitle>

                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={String(week)}
                                onChange={(e) => setWeek(Number(e.target.value))}
                                className="h-8 w-40 text-base sm:text-xs"
                            >
                                {weekOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>

                            <div className="flex items-center gap-2">
                                {saved && <span className="text-xs font-medium text-green-600">Saved!</span>}
                                <Button
                                    variant="save"
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
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-4 text-center text-sm text-text/60">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {COLUMN_BREAKS.map(({ start, end }) => (
                                <div key={`${start}-${end}`} className="rounded-lg border border-primary/15 p-2">
                                    {rankings.slice(start, end).map((team, offset) => {
                                        const index = start + offset
                                        return (
                                            <RankingRow
                                                key={index}
                                                index={index}
                                                rank={index + 1}
                                                team={team}
                                                previousRankings={previousRankings}
                                                unrankedTeams={unrankedTeams}
                                                columnStart={start}
                                                columnEnd={end}
                                                isDragging={draggedIndex === index}
                                                isDropTarget={dropTargetIndex === index && draggedIndex !== index}
                                                onTeamChange={handleTeamChange}
                                                onReorder={handleReorder}
                                                onDragStart={handleDragStart}
                                                onDragOver={handleDragOver}
                                                onDragEnd={handleDragEnd}
                                                onDrop={handleDrop}
                                            />
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
