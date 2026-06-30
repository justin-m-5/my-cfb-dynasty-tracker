'use client'

import { useEffect, useState } from 'react'

import { GameService, type Game } from '@/dal/features/games'
import type { YearRecord } from '@/dal/features/year-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocationLabel, getWeekDisplayName, parseScore } from '@/lib/game-utils'

interface YearScheduleProps {
    dynastyId: string
    yearRecord: YearRecord
}

function resultClasses(result: Game['result']) {
    if (result === 'W') return 'text-green-600 dark:text-green-400'
    if (result === 'L') return 'text-red-600 dark:text-red-400'
    if (result === 'T') return 'text-amber-600 dark:text-amber-400'
    return 'text-text/55'
}

export function YearSchedule({ dynastyId, yearRecord }: YearScheduleProps) {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await GameService.getGames(dynastyId, yearRecord.id)
                setGames(data)
            } catch (error) {
                console.error('Failed to load season history schedule:', error)
                setGames([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId, yearRecord.id])

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{yearRecord.year} Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-text/60">Loading schedule...</p>
                ) : games.length === 0 ? (
                    <p className="text-sm text-text/60">No games were recorded for this season.</p>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-primary/15 bg-background/60">
                        {games.map((game) => {
                            const { user, opp } = parseScore(game.score)
                            const score = game.score ? `${user}-${opp}` : '—'

                            return (
                                <div key={game.id} className="flex items-center gap-3 border-b border-primary/10 px-3 py-2 text-xs last:border-b-0 hover:bg-primary/5">
                                    <div className="w-20 shrink-0 font-semibold text-text/75">{getWeekDisplayName(game.week)}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-text">
                                            {game.location !== 'none' ? `${getLocationLabel(game.location)} ` : ''}
                                            {game.opponent || 'TBD'}
                                        </div>
                                        <div className="text-[10px] text-text/50">
                                            {game.location === 'neutral' ? 'Neutral site' : game.location === 'home' ? 'Home game' : game.location === 'away' ? 'Road game' : 'Not scheduled'}
                                        </div>
                                    </div>
                                    <div className={`shrink-0 text-right font-semibold ${resultClasses(game.result)}`}>
                                        <div>{game.result}</div>
                                        <div className="text-[10px] text-text/60">{score}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
