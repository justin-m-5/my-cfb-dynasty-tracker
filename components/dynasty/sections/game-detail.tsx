// components/dynasty/sections/game-detail.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { GameService, type Game } from '@/dal/features/games'
import { PlayerService, type Player } from '@/dal/features/players'
import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { fbsTeams } from '@/lib/fbs-teams'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

import { GameHeader } from './game/game-header'
import { QuickEditRow } from './game/quick-edit-row'
import { BoxScoreTab } from './game/box-score-tab'
import { TeamStatsTab } from './game/team-stats-tab'
import { PlayerStatsTab } from './game/player-stats-tab'
import { RecapTab } from './game/recap-tab'

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
        return <p className="text-sm text-red-500">Game not found.</p>
    }

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

    return (
        <div className="space-y-5">
            {/* Save bar */}
            <div className="flex items-center justify-end gap-2">
                {isDirty && <span className="text-xs font-medium text-amber-500">Unsaved</span>}
                <Button
                    bg="var(--green-600)"
                    text="white"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 font-semibold"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>

            <GameHeader dynasty={dynasty} game={game} userLogos={userLogos} oppLogos={oppLogos} />
            <QuickEditRow game={game} updateGame={updateGame} />

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-primary/20 sm:gap-4">
                {tabItems.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap pb-2 px-1 text-xs font-medium transition-colors sm:text-sm ${
                            activeTab === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text/60 hover:text-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Box Score' && <BoxScoreTab game={game} dynasty={dynasty} updateGame={updateGame} />}
            {activeTab === 'Team Stats' && <TeamStatsTab game={game} updateGame={updateGame} />}
            {activeTab === 'Player Stats' && (
                <PlayerStatsTab gameId={game.id} roster={roster} stats={playerStats} onStatsChange={setPlayerStats} />
            )}
            {activeTab === 'Recap' && <RecapTab game={game} updateGame={updateGame} />}
        </div>
    )
}
