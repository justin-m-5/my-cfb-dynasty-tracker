// components/dynasty/sections/game-detail.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { GameService, type Game, type QuarterScore } from '@/dal/features/games'
import { PlayerService, type Player } from '@/dal/features/players'
import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import { PlayerStatsTab } from '@/components/dynasty/sections/game/player-stats-tab'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { fbsTeams } from '@/lib/fbs-teams'
import { Button, buttonStyles } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TextArea } from '@/components/ui/text-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

const tabItems = ['Box Score', 'Team Stats', 'Player Stats', 'Recap'] as const
type TabKey = (typeof tabItems)[number]

interface GameDetailProps {
    dynastyId: string
    gameId: string
}

export function GameDetail({ dynastyId, gameId }: GameDetailProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [game, setGame] = useState<Game | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [activeTab, setActiveTab] = useState<TabKey>('Box Score')
    const [roster, setRoster] = useState<Player[]>([])
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const [d, g] = await Promise.all([
                    DynastyService.getDynastyById(dynastyId),
                    GameService.getGameById(gameId),
                ])
                setDynasty(d)
                if (g) {
                    setGame({
                        ...g,
                        score_by_quarter: g.score_by_quarter ?? [
                            { home: 0, away: 0 },
                            { home: 0, away: 0 },
                            { home: 0, away: 0 },
                            { home: 0, away: 0 },
                        ],
                    })

                    // Load roster and player stats
                    const [rosterData, statsData] = await Promise.all([
                        d ? PlayerService.getRoster(dynastyId, g.year_record_id) : Promise.resolve([]),
                        PlayerStatService.getStatsForGame(g.id),
                    ])
                    setRoster(rosterData)
                    setPlayerStats(statsData)
                }
            } catch (err) {
                console.error('Failed to load game:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId, gameId])

    // Warn on unsaved changes
    useEffect(() => {
        if (!isDirty) return
        const handler = (e: BeforeUnloadEvent) => e.preventDefault()
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const updateGame = useCallback((field: keyof Game, value: unknown) => {
        setGame(prev => prev ? { ...prev, [field]: value } : prev)
        setIsDirty(true)
    }, [])

    const handleSave = async () => {
        if (!game) return
        setSaving(true)
        try {
            await GameService.updateGame(game.id, {
                location: game.location,
                opponent: game.opponent,
                result: game.result,
                score: game.score,
                score_by_quarter: game.score_by_quarter,
                team_stats: game.team_stats,
                recap: game.recap,
            })
            setIsDirty(false)
        } catch (err) {
            console.error('Failed to save game:', err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading game...</div>
    }

    if (!game || !dynasty) {
        return (
            <div className="space-y-4 text-center">
                <p className="text-sm text-red-500">Game not found.</p>
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/schedule`}
                    {...buttonStyles({ size: 'sm', bg: 'var(--orange-400)', text: 'white' })}
                >
                    ← Back to Schedule
                </Link>
            </div>
        )
    }

    if (game.result === 'Bye' || game.opponent === 'BYE') {
        return (
            <div className="space-y-4 text-center">
                <h2 className="text-xl font-bold text-text">Bye Week</h2>
                <p className="text-sm text-text/60">No game scheduled this week.</p>
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/schedule`}
                    {...buttonStyles({ size: 'sm', bg: 'var(--orange-400)', text: 'white' })}
                >
                    ← Back to Schedule
                </Link>
            </div>
        )
    }

    const oppTeam = fbsTeams.find(t => t.name === game.opponent)
    const userLogos = getSchoolLogoCandidates(dynasty.school_name, dynasty.school_nickname)
    const oppLogos = game.opponent ? getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null) : []

    const locationLabel = game.location === 'home' ? 'vs' : game.location === 'away' ? '@' : 'vs'
    const weekLabel = game.week <= 14 ? `Week ${game.week}` : game.week === 15 ? 'Conf Championship' : game.week === 16 ? 'Bowl Game' : game.week === 17 ? 'Playoff QF' : game.week === 18 ? 'Playoff SF' : game.week === 19 ? 'National Championship' : `Week ${game.week}`

    return (
        <div className="space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/schedule`}
                    {...buttonStyles({ size: 'sm', bg: 'var(--orange-400)', text: 'white' })}
                >
                    ← Back to Schedule
                </Link>
                <div className="flex items-center gap-2">
                    {isDirty && <span className="text-xs font-medium text-amber-500">Unsaved</span>}
                    <Button
                        bg="var(--green-600)"
                        text="white"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="font-semibold"
                    >
                        <Save className="mr-1 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Game Header */}
            <GameHeader
                dynasty={dynasty}
                game={game}
                userLogos={userLogos}
                oppLogos={oppLogos}
                locationLabel={locationLabel}
                weekLabel={weekLabel}
            />

            {/* Quick edit: opponent, location, result, score */}
            <QuickEditRow game={game} updateGame={updateGame} />

            {/* Sub-nav tabs */}
            <div className="flex gap-4 border-b border-primary/20">
                {tabItems.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-1 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text/60 hover:text-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Box Score' && (
                <BoxScoreTab game={game} dynasty={dynasty} updateGame={updateGame} />
            )}
            {activeTab === 'Team Stats' && (
                <TeamStatsTab game={game} updateGame={updateGame} />
            )}
            {activeTab === 'Player Stats' && (
                <PlayerStatsTab
                    gameId={game.id}
                    roster={roster}
                    stats={playerStats}
                    onStatsChange={setPlayerStats}
                />
            )}
            {activeTab === 'Recap' && (
                <RecapTab game={game} updateGame={updateGame} />
            )}
        </div>
    )
}

/* ─── Game Header ─────────────────────────────────────── */

function GameHeader({
    dynasty,
    game,
    userLogos,
    oppLogos,
    locationLabel,
    weekLabel,
}: {
    dynasty: Dynasty
    game: Game
    userLogos: string[]
    oppLogos: string[]
    locationLabel: string
    weekLabel: string
}) {
    const [userScore, oppScore] = (game.score ?? '0-0').split('-').map(Number)
    const resultColor = game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-text'

    return (
        <Card>
            <CardContent className="py-5">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-text/50">
                    {weekLabel}{game.location === 'neutral' ? ' • Neutral Site' : ''}
                </p>
                <div className="flex items-center justify-center gap-6">
                    {/* User team */}
                    <div className="flex flex-col items-center gap-1">
                        <LogoImage candidates={userLogos} alt={dynasty.school_name} size={48} />
                        <p className="text-sm font-semibold text-text">{dynasty.school_abbrev ?? dynasty.school_name}</p>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                        {game.result !== 'N/A' ? (
                            <>
                                <p className={`text-3xl font-bold ${resultColor}`}>
                                    {userScore} - {oppScore}
                                </p>
                                <p className={`text-xs font-semibold ${resultColor}`}>
                                    {game.result === 'W' ? 'WIN' : game.result === 'L' ? 'LOSS' : game.result === 'T' ? 'TIE' : ''}
                                </p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-text/40">{locationLabel}</p>
                        )}
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-1">
                        <LogoImage candidates={oppLogos} alt={game.opponent || 'TBD'} size={48} />
                        <p className="text-sm font-semibold text-text">{game.opponent || 'TBD'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/* ─── Quick Edit Row ──────────────────────────────────── */

function QuickEditRow({ game, updateGame }: { game: Game; updateGame: (f: keyof Game, v: unknown) => void }) {
    const opponentTeams = useMemo(
        () => fbsTeams.map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name)),
        []
    )

    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-45 flex-1">
                <Label className="text-xs">Opponent</Label>
                <Select
                    value={game.opponent}
                    onChange={(e) => updateGame('opponent', e.target.value)}
                    className="mt-1 h-9 text-sm"
                >
                    <option value="">Select</option>
                    <option value="BYE">BYE</option>
                    {opponentTeams.map((t) => (
                        <option key={t.name} value={t.name}>{t.name} ({t.conference})</option>
                    ))}
                </Select>
            </div>
            <div>
                <Label className="text-xs">Location</Label>
                <Select
                    value={game.location}
                    onChange={(e) => updateGame('location', e.target.value)}
                    className="mt-1 h-9 w-28 text-sm"
                >
                    <option value="home">Home</option>
                    <option value="away">Away</option>
                    <option value="neutral">Neutral</option>
                    <option value="none">None</option>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Result</Label>
                <Select
                    value={game.result}
                    onChange={(e) => updateGame('result', e.target.value)}
                    className="mt-1 h-9 w-24 text-sm"
                >
                    <option value="N/A">—</option>
                    <option value="W">Win</option>
                    <option value="L">Loss</option>
                    <option value="T">Tie</option>
                    <option value="Bye">Bye</option>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Your Score</Label>
                <Input
                    value={game.score?.split('-')[0] ?? ''}
                    onChange={(e) => {
                        const opp = game.score?.split('-')[1] ?? '0'
                        updateGame('score', `${e.target.value}-${opp}`)
                    }}
                    className="mt-1 h-9 w-20 text-center text-sm"
                />
            </div>
            <div>
                <Label className="text-xs">Opp Score</Label>
                <Input
                    value={game.score?.split('-')[1] ?? ''}
                    onChange={(e) => {
                        const you = game.score?.split('-')[0] ?? '0'
                        updateGame('score', `${you}-${e.target.value}`)
                    }}
                    className="mt-1 h-9 w-20 text-center text-sm"
                />
            </div>
        </div>
    )
}

/* ─── Box Score Tab ────────────────────────────────────── */

function BoxScoreTab({
    game,
    dynasty,
    updateGame,
}: {
    game: Game
    dynasty: Dynasty
    updateGame: (f: keyof Game, v: unknown) => void
}) {
    const quarters = (game.score_by_quarter ?? []) as QuarterScore[]
    const labels = ['Q1', 'Q2', 'Q3', 'Q4']

    const updateQuarter = (qi: number, side: 'home' | 'away', val: string) => {
        const updated = [...quarters]
        updated[qi] = { ...updated[qi], [side]: Number(val) || 0 }
        updateGame('score_by_quarter', updated)
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Score by Quarter</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary/20 text-xs text-text/60">
                                <th className="py-2 pr-4 text-left font-medium">Team</th>
                                {labels.map(l => <th key={l} className="px-3 py-2 text-center font-medium">{l}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-primary/10">
                                <td className="py-2 pr-4 font-medium text-text">{awayName}</td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            value={q.away}
                                            onChange={(e) => updateQuarter(i, 'away', e.target.value)}
                                            className="h-8 w-14 text-center text-sm mx-auto"
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-text">{homeName}</td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            value={q.home}
                                            onChange={(e) => updateQuarter(i, 'home', e.target.value)}
                                            className="h-8 w-14 text-center text-sm mx-auto"
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

/* ─── Team Stats Tab ──────────────────────────────────── */

const defaultTeamStats = {
    first_downs: { user: 0, opp: 0 },
    total_yards: { user: 0, opp: 0 },
    passing_yards: { user: 0, opp: 0 },
    rushing_yards: { user: 0, opp: 0 },
    turnovers: { user: 0, opp: 0 },
    penalties: { user: 0, opp: 0 },
    third_down: { user: '', opp: '' },
    possession: { user: '', opp: '' },
}

type TeamStatsData = typeof defaultTeamStats

const teamStatLabels: Record<keyof TeamStatsData, string> = {
    first_downs: 'First Downs',
    total_yards: 'Total Yards',
    passing_yards: 'Passing Yards',
    rushing_yards: 'Rushing Yards',
    turnovers: 'Turnovers',
    penalties: 'Penalties',
    third_down: '3rd Down',
    possession: 'Time of Possession',
}

function TeamStatsTab({ game, updateGame }: { game: Game; updateGame: (f: keyof Game, v: unknown) => void }) {
    const stats: TeamStatsData = (game.team_stats as TeamStatsData) ?? defaultTeamStats

    const updateStat = (key: keyof TeamStatsData, side: 'user' | 'opp', val: string) => {
        const updated = { ...stats, [key]: { ...stats[key], [side]: val } }
        updateGame('team_stats', updated)
    }

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Team Stats</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-text/60">
                        <span>You</span>
                        <span>Stat</span>
                        <span>Opponent</span>
                    </div>
                    {(Object.keys(teamStatLabels) as (keyof TeamStatsData)[]).map((key) => (
                        <div key={key} className="grid grid-cols-3 items-center gap-2">
                            <Input
                                value={stats[key]?.user ?? ''}
                                onChange={(e) => updateStat(key, 'user', e.target.value)}
                                className="h-8 text-center text-sm"
                            />
                            <p className="text-center text-xs font-medium text-text/70">{teamStatLabels[key]}</p>
                            <Input
                                value={stats[key]?.opp ?? ''}
                                onChange={(e) => updateStat(key, 'opp', e.target.value)}
                                className="h-8 text-center text-sm"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

/* ─── Recap Tab ───────────────────────────────────────── */

function RecapTab({ game, updateGame }: { game: Game; updateGame: (f: keyof Game, v: unknown) => void }) {
    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Game Recap</CardTitle></CardHeader>
            <CardContent>
                <TextArea
                    value={game.recap ?? ''}
                    onChange={(e) => updateGame('recap', e.target.value)}
                    rows={8}
                    placeholder="Write a summary of the game..."
                />
            </CardContent>
        </Card>
    )
}
