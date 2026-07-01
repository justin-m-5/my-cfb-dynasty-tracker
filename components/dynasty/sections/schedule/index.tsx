// components/dynasty/sections/schedule.tsx

'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { MAX_SCHEDULE_WEEK } from '@/lib/game-utils'
import { Button } from '@/components/ui/display/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'

import { RecordSummary } from './record-summary'
import { GameRow } from './game-row'

interface ScheduleProps {
    dynastyId: string
}

export function Schedule({ dynastyId }: ScheduleProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const d = await DynastyService.getDynastyById(dynastyId)
                setDynasty(d)

                if (d) {
                    const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                    if (yr) {
                        setYearRecordId(yr.id)
                        const g = await GameService.getGames(dynastyId, yr.id)
                        setGames(g)
                    }
                }
            } catch (err) {
                console.error('Failed to load schedule:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleAddGame = async () => {
        if (!yearRecordId || adding) return
        const nextWeek = games.length > 0 ? Math.max(...games.map(g => g.week)) + 1 : 1
        if (nextWeek > MAX_SCHEDULE_WEEK) return
        setAdding(true)
        try {
            const created = await GameService.createGame({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                week: nextWeek,
                location: 'home',
                opponent: '',
                result: 'N/A',
                score: null,
                score_by_quarter: null,
                stadium: null,
                team_stats: null,
                recap: null,
            })
            if (created) {
                setGames(prev => [...prev, created])
            }
        } catch (err) {
            console.error('Failed to add game:', err)
        } finally {
            setAdding(false)
        }
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading schedule...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-5 pt-10">
            <RecordSummary dynasty={dynasty} games={games} />

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Games</CardTitle>
                        <Button
                            bg="var(--primary)"
                            text="white"
                            size="sm"
                            onClick={handleAddGame}
                            disabled={adding || (games.length > 0 && Math.max(...games.map(g => g.week)) >= MAX_SCHEDULE_WEEK)}
                            className="flex items-center gap-1 text-xs font-semibold"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {adding ? 'Adding...' : 'Add Game'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {games.length === 0 ? (
                        <p className="text-sm text-text/60">No games yet. Add games to start tracking your season.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {games.map((game) => (
                                <GameRow
                                    key={game.id}
                                    game={game}
                                    dynastyId={dynastyId}
                                    dynastyConference={dynasty.conference}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
