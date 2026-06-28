// components/dynasty/sections/schedule/game-row.tsx

import Link from 'next/link'
import { Trophy, TrendingDown, Minus, Calendar, Pencil, Gamepad2 } from 'lucide-react'

import { fbsTeams } from '@/lib/fbs-teams'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { buttonStyles } from '@/components/ui/button'
import type { Game } from '@/dal/features/games'

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
        case 'W': return 'bg-green-100/80 text-green-900 dark:bg-green-950/40 dark:text-green-200'
        case 'L': return 'bg-red-100/80 text-red-900 dark:bg-red-950/40 dark:text-red-200'
        case 'Bye': return 'bg-slate-100/80 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300'
        default: return 'bg-background/70 text-text'
    }
}

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
    const oppLogos = game.opponent && game.opponent !== 'BYE'
        ? getSchoolLogoCandidates(game.opponent, oppTeam?.nickName ?? null)
        : []
    const isConf = oppTeam?.conference === dynastyConference
    const scoreParts = game.score ? game.score.split('-') : null

    return (
        <div className={`rounded-lg border border-primary/15 p-2.5 ${getResultColor(game.result)}`}>
            {/* Mobile: stacked layout / Desktop: single row */}
            <div className="flex items-center gap-2">
                {/* Week + Location */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-text/80 w-[4.5rem]">
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
                    {scoreParts && (
                        <span className="text-xs font-bold tabular-nums">
                            {scoreParts[0]}-{scoreParts[1]}
                        </span>
                    )}
                </div>

                {/* Edit Game */}
                <Link
                    href={`/dashboard/dynasty/${dynastyId}/game/${game.id}`}
                    {...buttonStyles({ bg: 'var(--primary)', text: 'white', className: 'rounded px-2 py-1 text-[11px] font-semibold shrink-0' })}
                >
                    <Pencil className="h-3 w-3 sm:hidden" />
                    <span className="hidden sm:inline flex items-center gap-1">
                        <Pencil className="h-3 w-3 inline" /> Edit
                    </span>
                </Link>
            </div>
        </div>
    )
}
