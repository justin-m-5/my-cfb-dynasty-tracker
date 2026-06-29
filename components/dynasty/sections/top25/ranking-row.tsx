// components/dynasty/sections/top25/ranking-row.tsx

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { fbsTeams } from '@/lib/fbs-teams'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { Select } from '@/components/ui/select'
import type { RankedTeam } from '@/dal/features/top25'

interface RankingRowProps {
    rank: number
    team: RankedTeam
    previousRankings: RankedTeam[]
    unrankedTeams: { name: string; conference: string }[]
    onTeamChange: (rank: number, name: string) => void
}

export function RankingRow({ rank, team, previousRankings, unrankedTeams, onTeamChange }: RankingRowProps) {
    const oppTeam = fbsTeams.find(t => t.name === team.name)
    const logos = team.name ? getSchoolLogoCandidates(team.name, oppTeam?.nickName ?? null) : []

    // Compute rank change from previous week
    const renderChange = () => {
        if (!team.name || previousRankings.length === 0) {
            return <Minus className="h-3.5 w-3.5 text-text/30" />
        }
        const prevIdx = previousRankings.findIndex(t => t.name === team.name)
        if (prevIdx === -1) {
            return <span className="text-[10px] font-bold text-green-600">NEW</span>
        }
        const diff = prevIdx - (rank - 1)
        if (diff > 0) {
            return (
                <span className="flex items-center text-xs text-green-600 font-semibold">
                    <ArrowUp className="h-3 w-3" />{diff}
                </span>
            )
        }
        if (diff < 0) {
            return (
                <span className="flex items-center text-xs text-red-500 font-semibold">
                    <ArrowDown className="h-3 w-3" />{Math.abs(diff)}
                </span>
            )
        }
        return <Minus className="h-3.5 w-3.5 text-text/30" />
    }

    return (
        <div className="flex items-center gap-2 rounded px-2 py-1.5 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            {/* Rank */}
            <span className="w-6 text-right text-sm font-bold text-text/80">{rank}</span>

            {/* Logo */}
            <div className="w-6 shrink-0">
                {logos.length > 0 && <LogoImage candidates={logos} alt={team.name} size={20} />}
            </div>

            {/* Team Select */}
            <Select
                value={team.name || '__unranked__'}
                onChange={(e) => onTeamChange(rank - 1, e.target.value === '__unranked__' ? '' : e.target.value)}
                className="h-8 flex-1 text-xs"
            >
                <option value="__unranked__">— Unranked —</option>
                {/* Show current team as option if selected */}
                {team.name && (
                    <option value={team.name}>{team.name}</option>
                )}
                {unrankedTeams.map(t => (
                    <option key={t.name} value={t.name}>{t.name} ({t.conference})</option>
                ))}
            </Select>

            {/* Rank change */}
            <div className="w-8 flex justify-center shrink-0">
                {renderChange()}
            </div>
        </div>
    )
}
