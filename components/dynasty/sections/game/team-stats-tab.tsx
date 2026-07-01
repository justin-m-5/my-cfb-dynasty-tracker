// components/dynasty/sections/game/team-stats-tab.tsx

'use client'

import { Input } from '@/components/ui/form/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import type { Game } from '@/dal/features/games'

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
    passing_yards: 'Pass Yards',
    rushing_yards: 'Rush Yards',
    turnovers: 'Turnovers',
    penalties: 'Penalties',
    third_down: '3rd Down',
    possession: 'Possession',
}

interface TeamStatsTabProps {
    game: Game
    updateGame: (field: keyof Game, value: unknown) => void
}

export function TeamStatsTab({ game, updateGame }: TeamStatsTabProps) {
    const stats: TeamStatsData = (game.team_stats as TeamStatsData) ?? defaultTeamStats

    const updateStat = (key: keyof TeamStatsData, side: 'user' | 'opp', val: string) => {
        const updated = { ...stats, [key]: { ...stats[key], [side]: val } }
        updateGame('team_stats', updated)
    }

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Team Stats</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-text/60">
                        <span>You</span>
                        <span>Stat</span>
                        <span>Opp</span>
                    </div>
                    {(Object.keys(teamStatLabels) as (keyof TeamStatsData)[]).map((key) => (
                        <div key={key} className="grid grid-cols-3 items-center gap-2">
                            <Input
                                value={stats[key]?.user ?? ''}
                                onChange={(e) => updateStat(key, 'user', e.target.value)}
                                className="h-8 text-center text-base sm:text-sm"
                            />
                            <p className="text-center text-[11px] font-medium text-text/70 sm:text-xs">{teamStatLabels[key]}</p>
                            <Input
                                value={stats[key]?.opp ?? ''}
                                onChange={(e) => updateStat(key, 'opp', e.target.value)}
                                className="h-8 text-center text-base sm:text-sm"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
