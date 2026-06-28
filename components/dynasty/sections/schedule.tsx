// components/dynasty/sections/schedule.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Trophy, TrendingDown, Minus, Calendar, Eye } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { fbsTeams } from '@/lib/fbs-teams'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { Button, buttonStyles } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function getWeekDisplayName(week: number): string {
    if (week <= 0) return `Pre ${week}`
    if (week <= 14) return `Week ${week}`
    if (week === 15) return 'Conf Champ'
    if (week === 16) return 'Bowl Game'
    if (week === 17) return 'Playoff QF'
    if (week === 18) return 'Playoff SF'
    if (week === 19) return 'Natty'
    return `Week ${week}`
}

function getResultColor(result: string): string {
    switch (result) {
        case 'W':
            return 'bg-green-100/80 text-green-900'
        case 'L':
            return 'bg-red-100/80 text-red-900'
        case 'Bye':
            return 'bg-slate-100/80 text-slate-700'
        default:
            return 'bg-background/70 text-text'
    }
}

function ResultIcon({ result }: { result: string }) {
    switch (result) {
        case 'W': return <Trophy className="h-4 w-4 text-green-600" />
        case 'L': return <TrendingDown className="h-4 w-4 text-red-600" />
        case 'T': return <Minus className="h-4 w-4 text-yellow-600" />
        case 'Bye': return <Calendar className="h-4 w-4 text-gray-500" />
        default: return null
    }
}

function getScoreParts(score: string | null): { team: string; opponent: string } {
    if (!score) return { team: '', opponent: '' }
    const [team = '', opponent = ''] = score.split('-')
    return { team, opponent }
}

function buildScore(team: string, opponent: string): string | null {
    if (!team.trim() && !opponent.trim()) return null
    return `${team.trim()}-${opponent.trim()}`
}

interface ScheduleProps {
    dynastyId: string
}

export function Schedule({ dynastyId }: ScheduleProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    // Warn on browser navigation / tab close with unsaved changes
    useEffect(() => {
        if (!isDirty) return
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

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

    const opponentTeams = useMemo(
        () => fbsTeams.map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name)),
        []
    )

    const handleUpdateGame = useCallback((gameId: string, field: keyof Game, value: unknown) => {
        setGames(prev => prev.map(g => g.id === gameId ? { ...g, [field]: value } : g))
        setIsDirty(true)
    }, [])

    const handleAddGame = async () => {
        if (!yearRecordId) return
        const nextWeek = games.length > 0 ? Math.max(...games.map(g => g.week)) + 1 : 1
        const newGame = await GameService.createGame({
            dynasty_id: dynastyId,
            year_record_id: yearRecordId,
            week: nextWeek,
            location: 'home',
            opponent: '',
            result: 'N/A',
            score: null,
            score_by_quarter: null,
            team_stats: null,
            recap: null,
            is_user_controlled: false,
        })
        if (newGame) {
            setGames(prev => [...prev, newGame])
            setIsDirty(true)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            for (const g of games) {
                await GameService.updateGame(g.id, {
                    location: g.location,
                    opponent: g.opponent,
                    result: g.result,
                    score: g.score,
                    recap: g.recap,
                })
            }
            setIsDirty(false)
        } catch (err) {
            console.error('Failed to save schedule:', err)
        } finally {
            setSaving(false)
        }
    }

    // Record calculations
    const record = useMemo(() => {
        const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
        return {
            wins: played.filter(g => g.result === 'W').length,
            losses: played.filter(g => g.result === 'L').length,
            ties: played.filter(g => g.result === 'T').length,
        }
    }, [games])

    const locationRecord = useCallback((loc: string) => {
        const filtered = games.filter(g => g.location === loc && (g.result === 'W' || g.result === 'L' || g.result === 'T'))
        return {
            wins: filtered.filter(g => g.result === 'W').length,
            losses: filtered.filter(g => g.result === 'L').length,
        }
    }, [games])

    const home = locationRecord('home')
    const away = locationRecord('away')
    const neutral = locationRecord('neutral')

    if (loading) {
        return <div className="text-sm text-text/60">Loading schedule...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-6">
            {/* Record Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <RecordCard
                    label="Overall"
                    value={`${record.wins}-${record.losses}${record.ties > 0 ? `-${record.ties}` : ''}`}
                />
                <RecordCard label="Home" value={`${home.wins}-${home.losses}`} color="var(--blue-600)" />
                <RecordCard label="Away" value={`${away.wins}-${away.losses}`} color="var(--red-600)" />
                <RecordCard label="Neutral" value={`${neutral.wins}-${neutral.losses}`} color="var(--purple-600)" />
            </div>

            {/* Games Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">Games</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            {isDirty && (
                                <span className="text-xs font-medium text-amber-500">Unsaved changes</span>
                            )}
                            <Button
                                bg="var(--primary)"
                                text="white"
                                size="sm"
                                onClick={handleAddGame}
                                className="font-semibold"
                            >
                                Add Game
                            </Button>
                            <Button
                                bg="var(--green-600)"
                                text="white"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="font-semibold"
                            >
                                {saving ? 'Saving...' : 'Save Schedule'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {games.length === 0 ? (
                        <p className="text-sm text-text/60">No games yet. Add games to start tracking your season.</p>
                    ) : (
                        <div className="space-y-2">
                            {games.map((game) => {
                                const scoreParts = getScoreParts(game.score)
                                const oppTeam = fbsTeams.find(t => t.name === game.opponent)
                                const oppLogos = game.opponent && game.opponent !== 'BYE'
                                    ? getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null)
                                    : []

                                return (
                                    <div
                                        key={game.id}
                                        className={`rounded-lg border border-primary/15 p-3 ${getResultColor(game.result)}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-text/85">
                                                {getWeekDisplayName(game.week)}
                                            </div>

                                            {/* View Game */}
                                            <Link
                                                href={`/dashboard/dynasty/${dynastyId}/game/${game.id}`}
                                                {...buttonStyles({ bg: 'var(--primary)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Link>
                                        </div>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                                            <div className="space-y-1 lg:col-span-2">
                                                <p className="text-[11px] font-medium uppercase tracking-wide text-text/60">Location</p>
                                                <Select
                                                    value={game.location}
                                                    onChange={(e) => handleUpdateGame(game.id, 'location', e.target.value)}
                                                    className="h-9 min-w-0 text-xs"
                                                >
                                                    <option value="home">Home</option>
                                                    <option value="away">Away</option>
                                                    <option value="neutral">Neutral</option>
                                                    <option value="none">None</option>
                                                </Select>
                                            </div>

                                            <div className="space-y-1 lg:col-span-5">
                                                <p className="text-[11px] font-medium uppercase tracking-wide text-text/60">Opponent</p>
                                                <div className="flex min-w-0 items-center gap-2">
                                                    {oppLogos.length > 0 && (
                                                        <LogoImage candidates={oppLogos} alt={game.opponent} size={28} />
                                                    )}
                                                    <Select
                                                        value={game.opponent || ''}
                                                        onChange={(e) => handleUpdateGame(game.id, 'opponent', e.target.value)}
                                                        className="h-9 min-w-0 flex-1 text-xs"
                                                    >
                                                        <option value="">Select Opponent</option>
                                                        <option value="BYE">BYE</option>
                                                        {opponentTeams.map((t) => (
                                                            <option key={t.name} value={t.name}>
                                                                {t.name} ({t.conference})
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1 lg:col-span-2">
                                                <p className="text-[11px] font-medium uppercase tracking-wide text-text/60">Result</p>
                                                <div className="flex items-center gap-1">
                                                    <ResultIcon result={game.result} />
                                                    <Select
                                                        value={game.result}
                                                        onChange={(e) => handleUpdateGame(game.id, 'result', e.target.value)}
                                                        className="h-9 min-w-0 text-xs"
                                                    >
                                                        <option value="N/A">—</option>
                                                        <option value="W">Win</option>
                                                        <option value="L">Loss</option>
                                                        <option value="T">Tie</option>
                                                        <option value="Bye">Bye</option>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1 lg:col-span-3">
                                                <p className="text-[11px] font-medium uppercase tracking-wide text-text/60">Score</p>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        value={scoreParts.team}
                                                        onChange={(e) => {
                                                            handleUpdateGame(game.id, 'score', buildScore(e.target.value, scoreParts.opponent))
                                                        }}
                                                        placeholder="You"
                                                        className="h-9 w-16 text-center text-xs"
                                                    />
                                                    <span className="text-xs text-text/50">-</span>
                                                    <Input
                                                        value={scoreParts.opponent}
                                                        onChange={(e) => {
                                                            handleUpdateGame(game.id, 'score', buildScore(scoreParts.team, e.target.value))
                                                        }}
                                                        placeholder="Opp"
                                                        className="h-9 w-16 text-center text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function RecordCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="rounded-xl border border-primary/20 bg-background/70 p-4 text-center">
            <p className="text-2xl font-bold" style={color ? { color } : undefined}>
                {value}
            </p>
            <p className="mt-1 text-xs text-text/60">{label}</p>
        </div>
    )
}
