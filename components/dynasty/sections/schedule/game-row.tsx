// components/dynasty/sections/schedule/game-row.tsx

import Link from 'next/link'
import { Trophy, TrendingDown, Minus, Calendar, Pencil, MapPin } from 'lucide-react'

import { fbsTeams } from '@/lib/fbs-teams'
import { getWeekDisplayName, getResultColor, parseScore } from '@/lib/game-utils'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates, getTeamLogo } from '@/lib/logos'
import type { Game } from '@/dal/features/games'
import { buttonStyles } from '@/lib/button-utils'

function ResultIcon({ result }: { result: string }) {
    switch (result) {
        case 'W': return <Trophy className="h-3.5 w-3.5 text-green-600" />
        case 'L': return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
        case 'T': return <Minus className="h-3.5 w-3.5 text-yellow-600" />
        case 'Bye': return <Calendar className="h-3.5 w-3.5 text-text/40" />
        default: return null
    }
}

function LocationBadge({ location }: { location: string }) {
    const config: Record<string, { label: string; full: string; className: string }> = {
        home: { label: 'H', full: 'Home', className: 'bg-blue-600/15 text-blue-600' },
        away: { label: 'A', full: 'Away', className: 'bg-red-500/15 text-red-500' },
        neutral: { label: 'N', full: 'Neutral', className: 'bg-purple-600/15 text-purple-600' },
    }
    const c = config[location]
    if (!c) return null
    return (
        <>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold sm:hidden ${c.className}`}>
                {c.label}
            </span>
            <span className={`hidden sm:inline rounded px-1.5 py-0.5 text-[10px] font-bold ${c.className}`}>
                {c.full}
            </span>
        </>
    )
}

interface GameRowProps {
    game: Game
    dynastyId: string
    dynastyConference?: string | null
}

export function GameRow({ game, dynastyId, dynastyConference }: GameRowProps) {
    const oppTeam = fbsTeams.find(t => t.name === game.opponent)
    const oppLogos = game.opponent && game.opponent !== 'BYE' ? Array.from(
        new Set([
            getTeamLogo(game.opponent),
            ...getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null),
        ].filter(Boolean))
    ) : []
    const isConf = oppTeam?.conference === dynastyConference
    const { user, opp } = parseScore(game.score)

    return (
        <div className={`rounded-lg border p-2.5 sm:p-3 ${getResultColor(game.result)}`}>
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Week */}
                <span className="text-xs font-semibold text-text/70 w-14 sm:w-20 shrink-0">
                    {getWeekDisplayName(game.week)}
                </span>

                {/* Location Badge */}
                <div className="shrink-0">
                    <LocationBadge location={game.location} />
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {oppLogos.length > 0 && (
                        <LogoImage candidates={oppLogos} alt={game.opponent} size={28} className="shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium truncate block">
                            {game.opponent || <span className="text-text/40 italic">TBD</span>}
                        </span>
                        {/* Conference + stadium on sm+ */}
                        <span className="hidden sm:block text-[11px] text-text/50 truncate">
                            {oppTeam?.conference}
                            {isConf && <span className="ml-1 text-amber-600 font-semibold">• Conf</span>}
                            {game.stadium && <span className="ml-2 inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 inline" />{game.stadium}</span>}
                        </span>
                    </div>
                </div>

                {/* Result + Score */}
                {game.result && game.result !== 'N/A' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                        <ResultIcon result={game.result} />
                        {game.score && (
                            <span className="text-sm font-bold tabular-nums text-text">
                                {user}-{opp}
                            </span>
                        )}
                    </div>
                )}

                {/* Edit Game */}
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/game/${game.id}`}
                    {...buttonStyles({ bg: 'var(--primary)', text: 'white', className: 'rounded px-2 py-1.5 text-[11px] font-semibold shrink-0' })}
                >
                    <Pencil className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                </Link>
            </div>
        </div>
    )
}
