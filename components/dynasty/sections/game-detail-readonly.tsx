// components/dynasty/sections/game-detail-readonly.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { GameService, type Game } from '@/dal/features/games'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { fbsTeams } from '@/lib/fbs-teams'
import { getWeekFullName, parseScore } from '@/lib/game-utils'
import { buttonStyles } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoImage } from '@/components/ui/logo-image'
import { Select } from '@/components/ui/select'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import {
    type StatCategory,
    statCategories,
    displayColumns,
    computeStatValue,
} from '@/lib/stat-config'

interface GameDetailReadOnlyProps {
    dynastyId: string
    gameId: string
}

export function GameDetailReadOnly({ dynastyId, gameId }: GameDetailReadOnlyProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [game, setGame] = useState<Game | null>(null)
    const [loading, setLoading] = useState(true)
    const [roster, setRoster] = useState<RosterPlayer[]>([])
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
    const [activeTab, setActiveTab] = useState<'Box Score' | 'Player Stats' | 'Recap'>('Box Score')
    const [statCategory, setStatCategory] = useState<StatCategory>('Passing')

    useEffect(() => {
        const load = async () => {
            try {
                const [d, g] = await Promise.all([
                    DynastyService.getDynastyById(dynastyId),
                    GameService.getGameById(gameId),
                ])
                setDynasty(d)
                if (g) {
                    setGame(g)
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

    if (loading) return <div className="text-sm text-text/60">Loading game...</div>
    if (!game || !dynasty) return <p className="text-sm text-red-500">Game not found.</p>

    if (game.result === 'Bye' || game.opponent === 'BYE') {
        return (
            <div className="space-y-4 text-center">
                <h2 className="text-xl font-bold text-text">Bye Week</h2>
                <p className="text-sm text-text/60">No game scheduled this week.</p>
            </div>
        )
    }

    const oppTeam = fbsTeams.find(t => t.name === game.opponent)
    const userLogos = getSchoolLogoCandidates(dynasty.school_name, dynasty.school_nickname)
    const oppLogos = game.opponent ? getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null) : []

    const playerName = (playerId: string) => {
        const p = roster.find(r => r.id === playerId)
        return p ? `${p.name} #${p.season.jersey_number ?? ''}` : 'Unknown'
    }

    function hasStatsInCategory(stat: PlayerStat, category: StatCategory): boolean {
        const fields = statCategories[category]
        return fields.some(({ field }) => {
            const val = (stat as unknown as Record<string, number>)[field]
            return val !== 0 && val !== undefined && val !== null
        })
    }

    const categoryStats = playerStats.filter(s => hasStatsInCategory(s, statCategory))
    const columns = displayColumns[statCategory]

    const tabs = ['Box Score', 'Player Stats', 'Recap'] as const

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/season-history`}
                    {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
                >
                    ← Season History
                </Link>
            </div>

            {/* Combined matchup header */}
            <Card className="border-primary/15">
                <CardContent className="py-5">
                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-text/50">
                        {getWeekFullName(game.week)}{game.location === 'neutral' ? ' • Neutral Site' : game.location === 'home' ? ' • Home' : game.location === 'away' ? ' • Away' : ''}
                    </p>
                    <div className="flex items-center justify-center gap-4 sm:gap-6">
                        <div className="flex flex-col items-center gap-1">
                            <LogoImage candidates={userLogos} alt={dynasty.school_name} size={44} />
                            <p className="text-xs font-semibold text-text sm:text-sm">{dynasty.school_abbrev ?? dynasty.school_name}</p>
                        </div>
                        <div className="text-center">
                            {game.result && game.result !== 'N/A' ? (
                                <>
                                    <p className={`text-2xl font-bold sm:text-3xl ${game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-text'}`}>
                                        {(() => { const { user, opp } = parseScore(game.score); return `${user} - ${opp}` })()}
                                    </p>
                                    <p className={`text-xs font-semibold ${game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-text'}`}>
                                        {game.result === 'W' ? 'WIN' : game.result === 'L' ? 'LOSS' : game.result === 'T' ? 'TIE' : ''}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xl font-bold text-text/40 sm:text-2xl">—</p>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <LogoImage candidates={oppLogos} alt={game.opponent || 'TBD'} size={44} />
                            <p className="text-xs font-semibold text-text sm:text-sm">{game.opponent || 'TBD'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs (hamburger on mobile) */}
            <SidebarNav
                items={tabs.map(tab => ({ name: tab, key: tab }))}
                active={activeTab}
                onChange={(key) => setActiveTab(key as typeof activeTab)}
            />

            {/* Box Score */}
            {activeTab === 'Box Score' && game.score_by_quarter && (
                <Card className="border-primary/15">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Score by Quarter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary/15">
                                        <th className="px-3 py-1.5 text-left text-xs text-text/50">Team</th>
                                        {(game.score_by_quarter as { home: number; away: number }[]).map((_, i) => (
                                            <th key={i} className="px-2 py-1.5 text-center text-xs text-text/50">Q{i + 1}</th>
                                        ))}
                                        <th className="px-2 py-1.5 text-center text-xs font-semibold text-text/70">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-primary/10">
                                        <td className="px-2 py-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <LogoImage candidates={userLogos} alt={dynasty.school_name} size={20} />
                                                <span className="text-xs font-medium">{dynasty.school_abbrev || dynasty.school_name}</span>
                                            </div>
                                        </td>
                                        {(game.score_by_quarter as { home: number; away: number }[]).map((q, i) => (
                                            <td key={i} className="px-2 py-1.5 text-center text-xs">{game.location === 'away' ? q.away : q.home}</td>
                                        ))}
                                        <td className="px-2 py-1.5 text-center text-xs font-bold">
                                            {(game.score_by_quarter as { home: number; away: number }[]).reduce((s, q) => s + (game.location === 'away' ? q.away : q.home), 0)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 py-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <LogoImage candidates={oppLogos} alt={game.opponent || 'OPP'} size={20} />
                                                <span className="text-xs font-medium">{game.opponent}</span>
                                            </div>
                                        </td>
                                        {(game.score_by_quarter as { home: number; away: number }[]).map((q, i) => (
                                            <td key={i} className="px-2 py-1.5 text-center text-xs">{game.location === 'away' ? q.home : q.away}</td>
                                        ))}
                                        <td className="px-2 py-1.5 text-center text-xs font-bold">
                                            {(game.score_by_quarter as { home: number; away: number }[]).reduce((s, q) => s + (game.location === 'away' ? q.home : q.away), 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Player Stats */}
            {activeTab === 'Player Stats' && (
                <div className="space-y-3">
                    <Select
                        value={statCategory}
                        onChange={(e) => setStatCategory(e.target.value as StatCategory)}
                        className="h-9 w-44 text-sm"
                    >
                        {Object.keys(statCategories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>

                    <Card className="border-primary/15">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-primary/20 bg-background/50">
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-text/60 whitespace-nowrap">Player</th>
                                            {columns.map(col => (
                                                <th key={col.field} className="px-2 py-2 text-center text-xs font-semibold text-text/60 whitespace-nowrap">
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryStats.length > 0 ? categoryStats.map(stat => (
                                            <tr key={stat.id} className="border-b border-primary/10 hover:bg-primary/5">
                                                <td className="px-3 py-2 font-medium text-text whitespace-nowrap">{playerName(stat.player_id)}</td>
                                                {columns.map(col => (
                                                    <td key={col.field} className="px-2 py-2 text-center text-text/80">
                                                        {computeStatValue(stat as unknown as Record<string, unknown>, col.field)}
                                                    </td>
                                                ))}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-xs text-text/50">No {statCategory.toLowerCase()} stats recorded.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recap */}
            {activeTab === 'Recap' && (
                <Card className="border-primary/15">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Game Recap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {game.recap ? (
                            <p className="whitespace-pre-wrap text-sm text-text/80">{game.recap}</p>
                        ) : (
                            <p className="text-sm text-text/50">No recap was written for this game.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
