// components/dynasty/sections/game/game-header.tsx

import { LogoImage } from '@/components/ui/logo-image'
import { Card, CardContent } from '@/components/ui/card'
import { getWeekFullName, parseScore } from '@/lib/game-utils'
import type { Dynasty } from '@/dal/features/dynasty'
import type { Game } from '@/dal/features/games'

interface GameHeaderProps {
    dynasty: Dynasty
    game: Game
    userLogos: string[]
    oppLogos: string[]
}

export function GameHeader({ dynasty, game, userLogos, oppLogos }: GameHeaderProps) {
    const { user: userScore, opp: oppScore } = parseScore(game.score)
    const weekLabel = getWeekFullName(game.week)
    
    // Color coding: green for higher score, red for lower, gray for tie or N/A
    const userColor = game.result !== 'N/A' 
        ? userScore > oppScore ? 'text-green-600' : userScore < oppScore ? 'text-red-600' : 'text-text'
        : 'text-text/40'
    const oppColor = game.result !== 'N/A'
        ? oppScore > userScore ? 'text-green-600' : oppScore < userScore ? 'text-red-600' : 'text-text'
        : 'text-text/40'

    return (
        <Card>
            <CardContent className="py-5">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-text/50">
                    {weekLabel}{game.location === 'neutral' ? ' • Neutral Site' : ''}
                </p>
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                    {/* User team */}
                    <div className="flex flex-col items-center gap-1">
                        <LogoImage candidates={userLogos} alt={dynasty.school_name} size={40} />
                        <p className="text-xs font-semibold text-text sm:text-sm">{dynasty.school_abbrev ?? dynasty.school_name}</p>
                        <p className={`text-2xl font-bold tabular-nums ${userColor}`}>{userScore}</p>
                    </div>

                    {/* Separator */}
                    <div className="text-3xl font-bold text-text/30">-</div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-1">
                        <LogoImage candidates={oppLogos} alt={game.opponent || 'TBD'} size={40} />
                        <p className="text-xs font-semibold text-text sm:text-sm">{game.opponent || 'TBD'}</p>
                        <p className={`text-2xl font-bold tabular-nums ${oppColor}`}>{oppScore}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
