// components/dynasty/sections/team-home.tsx

'use client'

import { useEffect, useState } from 'react'
import { Calendar, Trophy, TrendingUp } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService, type YearRecord } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamHomeProps {
    dynastyId: string
}

export function TeamHome({ dynastyId }: TeamHomeProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [yearRecord, setYearRecord] = useState<YearRecord | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const d = await DynastyService.getDynastyById(dynastyId)
            setDynasty(d)

            if (d) {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                setYearRecord(yr)

                if (yr) {
                    const g = await GameService.getGames(dynastyId, yr.id)
                    setGames(g)
                }
            }

            setIsLoading(false)
        }
        load()
    }, [dynastyId])

    if (isLoading) {
        return <div className="text-sm text-text/60">Loading team data...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    // Compute current season stats from games
    const wins = games.filter(g => g.result === 'W').length
    const losses = games.filter(g => g.result === 'L').length
    const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
    const nextGame = games.find(g => g.result === 'N/A')
    const currentWeek = nextGame ? nextGame.week : (played.length > 0 ? played[played.length - 1].week + 1 : 1)

    // Points from scores
    let pointsFor = 0
    let pointsAgainst = 0
    for (const g of played) {
        if (g.score) {
            const [pf, pa] = g.score.split('-').map(Number)
            if (!isNaN(pf)) pointsFor += pf
            if (!isNaN(pa)) pointsAgainst += pa
        }
    }

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
        <div className="space-y-6">
            {/* Current Season At A Glance */}
            <div>
                <h2 className="mb-3 text-lg font-bold text-text">
                    {dynasty.current_year} Season
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <GlanceCard
                        icon={<Calendar className="h-5 w-5 text-blue-500" />}
                        label="Week"
                        value={String(currentWeek)}
                    />
                    <GlanceCard
                        icon={null}
                        label="Record"
                        value={`${wins}-${losses}`}
                    />
                    <GlanceCard
                        icon={null}
                        label="Ranking"
                        value={yearRecord?.final_ranking || '—'}
                    />
                    <GlanceCard
                        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                        label="Streak"
                        value={streak || '—'}
                    />
                </div>
            </div>

            {/* Season Details */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailCard label="Points For" value={String(pointsFor)} />
                <DetailCard label="Points Against" value={String(pointsAgainst)} />
                <DetailCard
                    label="Point Diff"
                    value={`${pointsFor - pointsAgainst >= 0 ? '+' : ''}${pointsFor - pointsAgainst}`}
                    color={pointsFor >= pointsAgainst ? 'var(--green-600)' : 'var(--red-600)'}
                />
                <DetailCard label="Conference Record" value={yearRecord?.conference_record || '0-0'} />
                <DetailCard label="Bowl Game" value={yearRecord?.bowl_game || '—'} />
                <DetailCard label="Bowl Result" value={yearRecord?.bowl_result || '—'} />
            </div>

            {/* Next Game */}
            {nextGame && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Next Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text/80">
                            Week {nextGame.week} •{' '}
                            {nextGame.location === 'home' ? 'vs' : nextGame.location === 'away' ? '@' : 'vs'}{' '}
                            <span className="font-semibold text-text">
                                {nextGame.opponent || 'TBD'}
                            </span>
                            {nextGame.location === 'neutral' && ' (Neutral)'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Career Stats */}
            <div>
                <h2 className="mb-3 text-lg font-bold text-text">Career</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <GlanceCard
                        icon={null}
                        label="All-Time Record"
                        value={`${dynasty.total_wins}-${dynasty.total_losses}`}
                    />
                    <GlanceCard
                        icon={<Trophy className="h-5 w-5 text-amber-500" />}
                        label="Championships"
                        value={String(dynasty.championships)}
                    />
                    <DetailCard label="Seasons Played" value={String(dynasty.seasons_played)} />
                    <DetailCard label="Coach Level" value={String(dynasty.coach_level)} />
                </div>
            </div>
        </div>
    )
}

function GlanceCard({ icon = null, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/70 p-4">
            {icon}
            <div>
                <p className="text-2xl font-bold text-text">{value}</p>
                <p className="text-xs text-text/60">{label}</p>
            </div>
        </div>
    )
}

function DetailCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl border border-primary/20 bg-background/70 p-4 text-center">
            <p className="text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
            <p className="mt-1 text-xs text-text/60">{label}</p>
        </div>
    )
}
