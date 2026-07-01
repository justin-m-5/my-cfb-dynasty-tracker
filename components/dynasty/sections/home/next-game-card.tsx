// components/dynasty/sections/home/next-game-card.tsx

import { Swords } from 'lucide-react'
import { fbsTeams } from '@/lib/teams/fbs-teams'
import { getSchoolLogoCandidates, getTeamLogo } from '@/lib/teams/logos'
import { LogoImage } from '@/components/ui/display/logo-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import type { Game } from '@/dal/features/games'

interface NextGameCardProps {
    games: Game[]
}

export function NextGameCard({ games }: NextGameCardProps) {
    const nextGame = games.find(g => g.result === 'N/A')

    if (!nextGame || !nextGame.opponent) return null

    const oppTeam = fbsTeams.find(t => t.name === nextGame.opponent)
    const oppLogos = Array.from(
        new Set([
            getTeamLogo(nextGame.opponent),
            ...getSchoolLogoCandidates(nextGame.opponent, oppTeam?.nickName ?? null),
        ].filter(Boolean))
    )
    const locLabel = nextGame.location === 'home' ? 'vs' : nextGame.location === 'away' ? '@' : 'vs'

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Swords className="h-4 w-4 text-primary" />
                    Next Up
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    {oppLogos.length > 0 && (
                        <LogoImage candidates={oppLogos} alt={nextGame.opponent} size={36} />
                    )}
                    <div>
                        <p className="text-sm font-semibold text-text">
                            Week {nextGame.week} • {locLabel}{' '}
                            {nextGame.opponent}
                        </p>
                        {nextGame.location === 'neutral' && (
                            <p className="text-xs text-text/50">Neutral Site</p>
                        )}
                        {oppTeam && (
                            <p className="text-xs text-text/50">{oppTeam.conference}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
