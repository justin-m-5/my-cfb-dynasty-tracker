// components/dynasty/sections/advance-season/roster-breakdown.tsx

import type { Recruit } from '@/dal/features/recruits'
import type { RosterPlayer } from '@/dal/features/players'
import type { Transfer } from '@/dal/features/transfers'
import type { DraftedPlayer } from '@/dal/features/drafted-players'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'

interface RosterBreakdownProps {
    roster: RosterPlayer[]
    transfers: Transfer[]
    recruits: Recruit[]
    draftedPlayers: DraftedPlayer[]
}

export function RosterBreakdown({ roster, transfers, recruits, draftedPlayers }: RosterBreakdownProps) {
    const graduatingNames = new Set(
        roster.filter((player) => player.season.year === 'SR' || player.season.year === 'SR (RS)').map((player) => player.name)
    )
    const transferOutNames = new Set(
        transfers.filter((transfer) => transfer.transfer_direction === 'To').map((transfer) => transfer.player_name)
    )
    const declaredNames = new Set(draftedPlayers.map((player) => player.player_name))

    const returningCount = roster.filter((player) => (!graduatingNames.has(player.name) && !transferOutNames.has(player.name) && !declaredNames.has(player.name))).length

    const breakdownItems = [
        { label: 'Returning', value: returningCount, tone: 'text-text' },
        { label: 'Graduating', value: graduatingNames.size, tone: 'text-red-500' },
        { label: 'Transfers Out', value: transferOutNames.size, tone: 'text-red-500' },
        {
            label: 'Transfers In',
            value: transfers.filter((transfer) => transfer.transfer_direction === 'From').length,
            tone: 'text-green-600',
        },
        { label: 'Recruits Incoming', value: recruits.length, tone: 'text-green-600' },
    ]

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Projected Roster Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {breakdownItems.map((item) => (
                        <div key={item.label} className="rounded-xl border border-primary/10 bg-background/70 px-2 py-2 text-center">
                            <p className={`text-sm font-bold ${item.tone}`}>{item.value}</p>
                            <p className="mt-1 text-[10px] text-text/55">{item.label}</p>
                        </div>
                    ))}
                </div>
                {draftedPlayers.length > 0 && (
                    <p className="mt-3 text-[10px] text-text/55">
                        Returning count excludes {draftedPlayers.length} current draft declaration{draftedPlayers.length === 1 ? '' : 's'}.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
