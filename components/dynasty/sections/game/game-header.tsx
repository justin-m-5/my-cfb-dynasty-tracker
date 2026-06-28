// components/dynasty/sections/game/game-header.tsx

import { LogoImage } from '@/components/ui/logo-image'
import { Card, CardContent } from '@/components/ui/card'
import { getWeekFullName, getLocationLabel, parseScore } from '@/lib/game-utils'
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
    const resultColor = game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-text'
    const weekLabel = getWeekFullName(game.week)
    const locationLabel = getLocationLabel(game.location)

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
                    </div>

                    {/* Score */}
                    <div className="text-center">
                        {game.result !== 'N/A' ? (
                            <>
                                <p className={`text-2xl font-bold sm:text-3xl ${resultColor}`}>
                                    {userScore} - {oppScore}
                                </p>
                                <p className={`text-xs font-semibold ${resultColor}`}>
                                    {game.result === 'W' ? 'WIN' : game.result === 'L' ? 'LOSS' : game.result === 'T' ? 'TIE' : ''}
                                </p>
                            </>
                        ) : (
                            <p className="text-xl font-bold text-text/40 sm:text-2xl">{locationLabel}</p>
                        )}
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-1">
                        <LogoImage candidates={oppLogos} alt={game.opponent || 'TBD'} size={40} />
                        <p className="text-xs font-semibold text-text sm:text-sm">{game.opponent || 'TBD'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
