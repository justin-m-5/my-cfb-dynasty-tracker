// components/dynasty/sections/advance-season/season-summary.tsx

'use client'

import type { Player } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import type { Award } from '@/dal/features/awards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { devTraitColors, type DevTrait } from '@/lib/player-config'

interface SeasonSummaryProps {
    players: Player[]
    recruits: Recruit[]
    transfers: Transfer[]
    awards: Award[]
    year: number
}

export function SeasonSummary({ players, recruits, transfers, awards, year }: SeasonSummaryProps) {
    const seniors = players.filter(p => p.year === 'SR' || p.year === 'SR (RS)')
    const returning = players.filter(p => p.year !== 'SR' && p.year !== 'SR (RS)')
    const transfersIn = transfers.filter(t => t.transfer_direction === 'From')
    const transfersOut = transfers.filter(t => t.transfer_direction === 'To')

    return (
        <div className="space-y-3">
            {/* Roster Summary */}
            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm">Roster ({players.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="font-semibold text-green-600">{returning.length} Returning</p>
                            <p className="text-text/50 text-[10px]">Will carry forward to {year + 1}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-red-500">{seniors.length} Graduating</p>
                            <p className="text-text/50 text-[10px]">Seniors leaving after this season</p>
                        </div>
                    </div>
                    {seniors.length > 0 && (
                        <div className="mt-2 border-t border-primary/10 pt-2">
                            <p className="text-[10px] uppercase tracking-wide text-text/50 font-semibold mb-1">Departing Seniors</p>
                            <div className="flex flex-wrap gap-1">
                                {seniors.map(p => (
                                    <span key={p.id} className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-600">
                                        {p.name} <span className="text-red-400">{p.position}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transfers */}
            {transfers.length > 0 && (
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm">Transfer Portal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="font-semibold text-green-600">{transfersIn.length} Incoming</p>
                                {transfersIn.map(t => (
                                    <div key={t.id} className="flex items-center gap-1 text-[10px] text-text/70 mt-0.5">
                                        <span>{t.player_name}</span>
                                        <span className="text-text/40">{t.position}</span>
                                        {t.dev_trait && t.dev_trait !== 'Normal' && (
                                            <span className={`rounded px-1 py-0.5 text-[8px] font-medium ${devTraitColors[t.dev_trait as DevTrait] || ''}`}>
                                                {t.dev_trait}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold text-red-500">{transfersOut.length} Outgoing</p>
                                {transfersOut.map(t => (
                                    <div key={t.id} className="flex items-center gap-1 text-[10px] text-text/70 mt-0.5">
                                        <span>{t.player_name}</span>
                                        <span className="text-text/40">{t.position} → {t.school}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recruits */}
            {recruits.length > 0 && (
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm">Recruiting Class ({recruits.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {recruits.map(r => (
                                <span key={r.id} className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600">
                                    {r.name} <span className="text-blue-400">{r.position}</span>
                                    {r.stars && <span className="text-yellow-600">{r.stars}★</span>}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Awards */}
            {awards.length > 0 && (
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm">Awards ({awards.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0.5">
                            {awards.map(a => (
                                <div key={a.id} className="text-[10px] text-text/70">
                                    <span className="font-medium text-text">{a.player_name}</span>
                                    {' — '}
                                    <span>{a.award_name}</span>
                                    {a.team && <span className="text-text/50"> ({a.team})</span>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
