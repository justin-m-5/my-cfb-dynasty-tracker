// components/dynasty/sections/schedule/record-summary.tsx

import { useMemo, useCallback } from 'react'
import Image from 'next/image'
import { DetailCard } from '@/components/ui/detail-card'
import { fbsTeams } from '@/lib/fbs-teams'
import { conferenceLogoByName } from '@/lib/logos'
import type { Dynasty } from '@/dal/features/dynasty'
import type { Game } from '@/dal/features/games'

interface RecordSummaryProps {
    dynasty: Dynasty
    games: Game[]
}

export function RecordSummary({ dynasty, games }: RecordSummaryProps) {
    const record = useMemo(() => {
        const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
        return {
            wins: played.filter(g => g.result === 'W').length,
            losses: played.filter(g => g.result === 'L').length,
            ties: played.filter(g => g.result === 'T').length,
        }
    }, [games])

    const confRecord = useMemo(() => {
        if (!dynasty.conference) return null
        const confGames = games.filter(g => {
            const opp = fbsTeams.find(t => t.name === g.opponent)
            return opp?.conference === dynasty.conference && (g.result === 'W' || g.result === 'L' || g.result === 'T')
        })
        return {
            wins: confGames.filter(g => g.result === 'W').length,
            losses: confGames.filter(g => g.result === 'L').length,
        }
    }, [games, dynasty])

    const locationRecord = useCallback((loc: string) => {
        const filtered = games.filter(g => g.location === loc && (g.result === 'W' || g.result === 'L' || g.result === 'T'))
        return {
            wins: filtered.filter(g => g.result === 'W').length,
            losses: filtered.filter(g => g.result === 'L').length,
        }
    }, [games])

    const home = locationRecord('home')
    const away = locationRecord('away')
    const neutral = locationRecord('neutral')

    const conferenceLogo = dynasty.conference ? conferenceLogoByName[dynasty.conference] ?? null : null

    return (
        <div className="grid grid-cols-5 gap-3">
            <DetailCard
                label="Overall"
                value={`${record.wins}-${record.losses}${record.ties > 0 ? `-${record.ties}` : ''}`}
            />
            {confRecord && (
                <DetailCard
                    label={
                        conferenceLogo ? '' : dynasty.conference!
                    }
                    value={`${confRecord.wins}-${confRecord.losses}`}
                    color="var(--amber-600)"
                    icon={
                        conferenceLogo ? (
                            <Image
                                src={conferenceLogo}
                                alt={dynasty.conference!}
                                width={24}
                                height={24}
                                className="rounded bg-white dark:bg-white"
                                unoptimized
                            />
                        ) : undefined
                    }
                />
            )}
            <DetailCard label="Home" value={`${home.wins}-${home.losses}`} color="var(--blue-600)" />
            <DetailCard label="Away" value={`${away.wins}-${away.losses}`} color="var(--red-600)" />
            <DetailCard label="Neutral" value={`${neutral.wins}-${neutral.losses}`} color="var(--purple-600)" />
        </div>
    )
}
