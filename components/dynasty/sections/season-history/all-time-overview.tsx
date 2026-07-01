'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { YearRecord } from '@/dal/features/year-records'

interface AllTimeOverviewProps {
    yearRecords: YearRecord[]
}

function formatRanking(finalRanking: number | null) {
    return finalRanking ? `#${finalRanking}` : '—'
}

function formatBowl(record: YearRecord) {
    if (!record.bowl_game && !record.bowl_result) return '—'
    if (!record.bowl_game) return record.bowl_result
    if (!record.bowl_result) return record.bowl_game
    return `${record.bowl_game} (${record.bowl_result})`
}

export function AllTimeOverview({ yearRecords }: AllTimeOverviewProps) {
    const sortedRecords = [...yearRecords].sort((a, b) => b.year - a.year)

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">All-Time Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-xl border border-primary/15 bg-background/60">
                    <table className="w-full min-w-215 text-xs">
                        <thead>
                            <tr className="border-b border-primary/15 bg-primary/5 text-left text-[10px] font-semibold uppercase tracking-wide text-text/55">
                                <th className="px-2 py-2">Year</th>
                                <th className="px-2 py-2">School</th>
                                <th className="px-2 py-2">Record</th>
                                <th className="px-2 py-2">Conf</th>
                                <th className="px-2 py-2">Final</th>
                                <th className="px-2 py-2">Bowl / Result</th>
                                <th className="px-2 py-2">Nat Champ</th>
                                <th className="px-2 py-2">Heisman</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRecords.map((record) => (
                                <tr key={record.id} className="border-b border-primary/10 last:border-b-0 hover:bg-primary/5">
                                    <td
                                        className="border-l px-2 py-2 font-semibold text-text"
                                        style={{ borderLeftColor: record.primary_color ?? 'var(--primary)' }}
                                    >
                                        {record.year}
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="font-medium text-text">{record.school_name}</div>
                                        <div className="text-[10px] text-text/55">{record.conference ?? 'Independent'}</div>
                                    </td>
                                    <td className="px-2 py-2 font-medium text-text">{record.overall_record || '—'}</td>
                                    <td className="px-2 py-2 text-text/75">{record.conference_record || '—'}</td>
                                    <td className="px-2 py-2 text-text/75">{formatRanking(record.final_ranking)}</td>
                                    <td className="px-2 py-2 text-text/75">{formatBowl(record)}</td>
                                    <td className="px-2 py-2 text-text/75">{record.nat_champ || '—'}</td>
                                    <td className="px-2 py-2 text-text/75">{record.heisman || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
