// components/dynasty/sections/schedule/game-row.tsx

import Link from 'next/link'
import { Trophy, TrendingDown, Minus, Calendar, Pencil, Gamepad2 } from 'lucide-react'

import { fbsTeams } from '@/lib/fbs-teams'
import { getWeekDisplayName, getResultColor, parseScore } from '@/lib/game-utils'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import type { Game } from '@/dal/features/games'
import { buttonStyles } from '@/lib/button-utils'

function ResultIcon({ result }: { result: string }) {
    switch (result) {
        case 'W': return <Trophy className="h-3.5 w-3.5 text-green-600" />
        case 'L': return <TrendingDown className="h-3.5 w-3.5 text-red-600" />
        case 'T': return <Minus className="h-3.5 w-3.5 text-yellow-600" />
        case 'Bye': return <Calendar className="h-3.5 w-3.5 text-gray-500" />
        default: return null
    }
}

function LocationBadge({ location }: { location: string }) {
    const config: Record<string, { label: string; className: string }> = {
        home: { label: 'H', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        away: { label: 'A', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
        neutral: { label: 'N', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    }
    const c = config[location]
    if (!c) return null
    return (
        <span className={`rounded px-1 py-0.5 text-[10px] font-bold ${c.className}`}>
            {c.label}
        </span>
    )
}

interface GameRowProps {
    game: Game
    dynastyId: string
    dynastyConference?: string | null
}

export function GameRow({ game, dynastyId, dynastyConference }: GameRowProps) {
    const oppTeam = fbsTeams.find(t => t.name === game.opponent)
    const oppLogos = game.opponent && game.opponent !== 'BYE' ? getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null) : []
    const isConf = oppTeam?.conference === dynastyConference
    const { user, opp } = parseScore(game.score)

    return (
        <div className={`rounded-lg border border-primary/15 p-2.5 ${getResultColor(game.result)}`}>
            <div className="flex items-center gap-2">
                {/* Week + Location */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-text/80 w-18">
                        {getWeekDisplayName(game.week)}
                    </span>
                    <LocationBadge location={game.location} />
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {oppLogos.length > 0 && (
                        <LogoImage candidates={oppLogos} alt={game.opponent} size={24} />
                    )}
                    <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium truncate block">
                            {game.opponent || <span className="text-text/40 italic">TBD</span>}
                        </span>
                        <span className="text-[10px] text-text/50 hidden sm:inline">
                            {oppTeam?.conference}
                            {isConf && <span className="ml-1 text-amber-600 font-semibold">• Conf</span>}
                        </span>
                    </div>
                </div>

                {/* User controlled */}
                {game.is_user_controlled && (
                    <Gamepad2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                )}

                {/* Result + Score */}
                <div className="flex items-center gap-1 shrink-0">
                    <ResultIcon result={game.result} />
                    {game.score && (
                        <span className="text-xs font-bold tabular-nums">
                            {user}-{opp}
                        </span>
                    )}
                </div>

                {/* Edit Game */}
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/game/${game.id}`}
                    {...buttonStyles({ bg: 'var(--primary)', text: 'white', className: 'rounded px-2 py-1 text-[11px] font-semibold shrink-0' })}
                >
                    <Pencil className="h-3 w-3 sm:hidden" />
                    <span className="hidden sm:inline">
                        <Pencil className="h-3 w-3 inline" /> Edit
                    </span>
                </Link>
            </div>
        </div>
    )
}
